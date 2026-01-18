'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

const schema = z.object({
    fullName: z.string().min(2, "Nama lengkap harus diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), "Tanggal lahir tidak valid"),
    parentName: z.string().min(2, "Nama orang tua harus diisi"),
    address: z.string().min(5, "Alamat harus diisi"),
    phoneNumber: z.string().min(10, "Nomor HP tidak valid"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerStudent(prevState: any, formData: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(formData)
    const parsed = schema.safeParse(data)

    if (!parsed.success) {
        // Flatten errors
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach(issue => {
            if (issue.path[0]) errors[issue.path[0].toString()] = issue.message
        })
        return { error: 'Mohon perbaiki isian form', fieldErrors: errors }
    }

    const { email, password, fullName, dateOfBirth, parentName, address, phoneNumber } = parsed.data

    const supabase = await createClient()

    // Check if current user is an Admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    let isAdmin = false

    if (currentUser) {
        const dbUser = await prisma.user.findUnique({
            where: { id: currentUser.id },
            include: { role: true }
        })
        if (dbUser?.role?.name === 'admin') {
            isAdmin = true
        }
    }

    let authData, authError

    if (isAdmin) {
        // Admin creating user: Use Service Role to skip verification
        const { createClient: createServiceClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const result = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { fullName }
        })
        authData = result.data
        authError = result.error
    } else {
        // Regular signup
        const result = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
            }
        })
        authData = result.data
        authError = result.error
    }

    if (authError) {
        console.error('Supabase Auth Error')
        return { error: authError.message }
    }

    if (!authData.user) {
        console.error('No user returned from Supabase')
        return { error: 'Pendaftaran gagal. Silakan coba lagi.' }
    }

    // User might need email confirmation - check if session exists
    const sessionExists = 'session' in authData && authData.session
    if (!sessionExists && !isAdmin) {
        // User created in auth but needs to confirm email (only log for regular users)
        // Still create the database records
    }

    // 2. Create DB records
    try {
        // Ensure Role exists (or find it)
        const studentRole = await prisma.role.upsert({
            where: { name: 'student' },
            update: {},
            create: { name: 'student' }
        })

        // Create User and Student
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            // Check if user already exists (shouldn't if Auth succeeded, but sync issues possible)
            const existingUser = await tx.user.findUnique({ where: { id: authData.user!.id } })
            if (!existingUser) {
                const user = await tx.user.create({
                    data: {
                        id: authData.user!.id,
                        email,
                        roleId: studentRole.id, // Assign Student Role
                    }
                })

                // Generate NIS: Year + Sequential Number (e.g., 2026001)
                const currentYear = new Date().getFullYear()
                const yearStart = new Date(currentYear, 0, 1) // January 1st of current year

                // Count students created this year
                const studentsThisYear = await tx.student.count({
                    where: {
                        createdAt: {
                            gte: yearStart
                        }
                    }
                })

                // Generate NIS: YYYY + 3-digit sequential number
                const sequentialNumber = (studentsThisYear + 1).toString().padStart(3, '0')
                const nis = `${currentYear}${sequentialNumber}`

                await tx.student.create({
                    data: {
                        userId: user.id,
                        nis,
                        fullName,
                        dateOfBirth: new Date(dateOfBirth),
                        parentName,
                        address,
                        phoneNumber
                    }
                })
            }
        })
    } catch (e: unknown) {
        console.error('Registration Error')
        // If DB fails, we technically have an orphaned Auth user. 
        // For this MVP, we just return error.
        return { error: 'Gagal menyimpan data siswa: ' + (e as Error).message }
    }

    // Check for session only if it's a regular signup (or if we want to auto-login)
    // For admin creation, we won't have a session for the NEW user
    const hasSession = 'session' in authData && authData.session

    if (hasSession) {
        // User is logged in, redirect to dashboard
        redirect('/dashboard/student')
    } else {
        if (isAdmin) {
            return {
                success: true,
                message: 'Siswa berhasil ditambahkan oleh Admin (Akun Aktif).',
            }
        }

        // User needs to confirm email
        return {
            success: true,
            message: 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun.',
            needsEmailConfirmation: true
        }
    }
}
