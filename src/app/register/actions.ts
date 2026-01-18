'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { encrypt } from '@/lib/encryption'

const schema = z.object({
    fullName: z.string().min(2, "Nama lengkap santri harus diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), "Tanggal lahir tidak valid"),
    parentName: z.string().min(2, "Nama orang tua harus diisi"),
    address: z.string().min(5, "Alamat harus diisi"),
    phoneNumber: z.string().min(10, "Nomor HP tidak valid"),
})

// Schema for adding a new student to existing parent
const addStudentSchema = z.object({
    fullName: z.string().min(2, "Nama lengkap santri harus diisi"),
    dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), "Tanggal lahir tidak valid"),
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

    // PUBLIC REGISTRATION - Create Pending Registration (Requires Approval)
    if (!isAdmin) {
        try {
            // Check if email already has a pending registration
            const existingPending = await prisma.preUser.findFirst({
                where: {
                    email,
                    status: 'PENDING'
                }
            })

            if (existingPending) {
                return { error: 'Email ini sudah memiliki pendaftaran yang menunggu persetujuan admin.' }
            }

            // Check if email already exists in the system
            const existingUser = await prisma.user.findUnique({
                where: { email }
            })

            if (existingUser) {
                return { error: 'Email ini sudah terdaftar di sistem. Silakan login atau gunakan email lain.' }
            }

            // Create pending registration
            await prisma.preUser.create({
                data: {
                    email,
                    password: encrypt(password), // Store encrypted
                    parentName,
                    phoneNumber,
                    address,
                    studentFullName: fullName,
                    dateOfBirth: new Date(dateOfBirth),
                    status: 'PENDING'
                }
            })

            return {
                success: true,
                message: 'Pendaftaran berhasil dikirim! Akun Anda akan diaktifkan setelah admin menyetujui pendaftaran. Anda akan menerima email konfirmasi.',
                isPending: true
            }
        } catch (e: unknown) {
            console.error('Pending Registration Error:', e)
            return { error: 'Gagal mengirim pendaftaran: ' + (e as Error).message }
        }
    }

    // ADMIN REGISTRATION - Create account immediately (no approval needed)
    let authData, authError

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
        user_metadata: { fullName: parentName }
    })
    authData = result.data
    authError = result.error

    if (authError) {
        console.error('Supabase Auth Error')
        return { error: authError.message }
    }

    if (!authData.user) {
        console.error('No user returned from Supabase')
        return { error: 'Pendaftaran gagal. Silakan coba lagi.' }
    }

    // 2. Create DB records
    try {
        // Ensure Role exists (or find it)
        const parentRole = await prisma.role.upsert({
            where: { name: 'parent' },
            update: {},
            create: { name: 'parent' }
        })

        // Create User, Parent, and Student
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            // Check if user already exists
            const existingUser = await tx.user.findUnique({ where: { id: authData.user!.id } })
            if (!existingUser) {
                // Create User with parent role
                const user = await tx.user.create({
                    data: {
                        id: authData.user!.id,
                        email,
                        roleId: parentRole.id,
                    }
                })

                // Create Parent profile
                const parent = await tx.parent.create({
                    data: {
                        userId: user.id,
                        name: parentName,
                        phoneNumber,
                        address,
                    }
                })

                // Generate NIS: Year + Sequential Number (e.g., 2026001)
                const currentYear = new Date().getFullYear()
                const yearStart = new Date(currentYear, 0, 1)

                const studentsThisYear = await tx.student.count({
                    where: {
                        createdAt: {
                            gte: yearStart
                        }
                    }
                })

                const sequentialNumber = (studentsThisYear + 1).toString().padStart(3, '0')
                const nis = `${currentYear}${sequentialNumber}`

                // Create Student linked to Parent
                await tx.student.create({
                    data: {
                        parentId: parent.id,
                        nis,
                        fullName,
                        dateOfBirth: new Date(dateOfBirth),
                    }
                })
            }
        })
    } catch (e: unknown) {
        console.error('Registration Error')
        return { error: 'Gagal menyimpan data siswa: ' + (e as Error).message }
    }

    return {
        success: true,
        message: 'Siswa berhasil ditambahkan oleh Admin (Akun Aktif).',
    }
}

// Add another student to existing parent account
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addStudentToParent(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Anda harus login terlebih dahulu' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = Object.fromEntries(formData)
    const parsed = addStudentSchema.safeParse(data)

    if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach(issue => {
            if (issue.path[0]) errors[issue.path[0].toString()] = issue.message
        })
        return { error: 'Mohon perbaiki isian form', fieldErrors: errors }
    }

    const { fullName, dateOfBirth } = parsed.data

    try {
        // Find parent by user ID
        const parent = await prisma.parent.findUnique({
            where: { userId: user.id },
            include: { user: true }
        })

        if (!parent) {
            return { error: 'Data orang tua tidak ditemukan' }
        }

        // Create pending registration for additional student
        await prisma.preUser.create({
            data: {
                email: parent.user.email,
                password: '', // Not needed for existing parent
                parentName: parent.name,
                phoneNumber: parent.phoneNumber,
                address: parent.address,
                studentFullName: fullName,
                dateOfBirth: new Date(dateOfBirth),
                existingParentId: parent.id, // Mark as existing parent adding child
                status: 'PENDING'
            }
        })

        return {
            success: true,
            message: `Permintaan penambahan santri "${fullName}" telah dikirim dan menunggu persetujuan admin.`,
            isPending: true
        }
    } catch (e: unknown) {
        console.error('Add Student Error:', e)
        return { error: 'Gagal mengirim permintaan: ' + (e as Error).message }
    }
}
