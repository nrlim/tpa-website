'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/encryption'

export async function getPendingRegistrations() {
    try {
        const registrations = await prisma.preUser.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        })
        return registrations
    } catch (error) {
        // console.error('Error fetching pending registrations')
        return []
    }
}

export async function getRegistrationStats() {
    try {
        const [total, pending] = await Promise.all([
            prisma.preUser.count(),
            prisma.preUser.count({ where: { status: 'PENDING' } })
        ])
        return { total, pending }
    } catch (error) {
        // console.error('Error fetching registration stats')
        return { total: 0, pending: 0 }
    }
}

import { PreUser, StudentType } from '@prisma/client'
// ...

export async function approveRegistration(registrationId: string, adminUserId: string, studentType: string = 'INTERNAL') {
    try {
        const registration = await prisma.preUser.findUnique({
            where: { id: registrationId }
        })

        if (!registration || registration.status !== 'PENDING') {
            return { success: false, error: 'Pendaftaran tidak ditemukan atau sudah diproses' }
        }

        // Check if this is an existing parent adding a child
        if (registration.existingParentId) {
            // Just add the student to the existing parent
            const currentYear = new Date().getFullYear()
            const yearStart = new Date(currentYear, 0, 1)

            const studentsThisYear = await prisma.student.count({
                where: {
                    createdAt: {
                        gte: yearStart
                    }
                }
            })

            const sequentialNumber = (studentsThisYear + 1).toString().padStart(3, '0')
            const nis = `${currentYear}${sequentialNumber}`

            await prisma.$transaction(async (tx) => {
                // Create the student
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (tx as any).student.create({
                    data: {
                        parentId: registration.existingParentId!,
                        nis,
                        fullName: registration.studentFullName,
                        dateOfBirth: registration.dateOfBirth,
                        studentType: studentType as StudentType,
                    }
                })

                // Update registration status
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (tx as any).preUser.update({
                    where: { id: registrationId },
                    data: {
                        status: 'APPROVED',
                        reviewedBy: adminUserId,
                        reviewedAt: new Date()
                    }
                })
            })

            revalidatePath('/dashboard/admin/registrations')
            revalidatePath('/dashboard/parent')
            return { success: true, message: 'Santri berhasil ditambahkan ke akun orang tua' }
        }

        // New parent registration - create user account via Supabase
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

        // Create user in Supabase Auth and send confirmation email
        let authUser;
        let isNewUser = false;

        // Decrypt password if needed
        let password = registration.password
        try {
            if (password.includes(':')) {
                password = decrypt(password)
            }
        } catch (e) {
            // Ignore decryption errors and use as-is (backward compatibility)
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: registration.email,
            password: password,
            email_confirm: false, // Must be false to allow sending confirmation email
            user_metadata: { fullName: registration.parentName }
        })

        if (authError) {
            if (authError.message.toLowerCase().includes('already been registered')) {
                // User exists. Try to find them.
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
                const existingUser = users.find(u => u.email === registration.email)

                if (existingUser) {
                    authUser = existingUser
                } else {
                    // console.error('Supabase Auth Error (User Exists but not found)')
                    return { success: false, error: 'Gagal membuat akun: Email terdaftar tetapi data tidak ditemukan.' }
                }
            } else {
                // console.error('Supabase Auth Error')
                return { success: false, error: 'Gagal membuat akun: ' + (authError?.message || 'Unknown error') }
            }
        } else {
            authUser = authData.user
            isNewUser = true
        }

        if (!authUser) {
            return { success: false, error: 'Gagal mendapatkan data user.' }
        }

        // Create DB records
        try {
            const parentRole = await prisma.role.upsert({
                where: { name: 'parent' },
                update: {},
                create: { name: 'parent' }
            })

            await prisma.$transaction(async (tx) => {
                // Create or Update User (in case Prisma record missing)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const user = await (tx as any).user.upsert({
                    where: { email: registration.email },
                    update: {}, // Don't update details if exists
                    create: {
                        id: authUser.id,
                        email: registration.email,
                        roleId: parentRole.id,
                    }
                })

                // Create Parent profile
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const parent = await (tx as any).parent.create({
                    data: {
                        userId: user.id,
                        name: registration.parentName,
                        phoneNumber: registration.phoneNumber,
                        address: registration.address,
                    }
                })

                // Generate NIS
                const currentYear = new Date().getFullYear()
                const yearStart = new Date(currentYear, 0, 1)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const studentsThisYear = await (tx as any).student.count({
                    where: {
                        createdAt: {
                            gte: yearStart
                        }
                    }
                })

                const sequentialNumber = (studentsThisYear + 1).toString().padStart(3, '0')
                const nis = `${currentYear}${sequentialNumber}`

                // Create Student
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (tx as any).student.create({
                    data: {
                        parentId: parent.id,
                        nis,
                        fullName: registration.studentFullName,
                        dateOfBirth: registration.dateOfBirth,
                        studentType: studentType as StudentType,
                    }
                })

                // Update registration status
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (tx as any).preUser.update({
                    where: { id: registrationId },
                    data: {
                        status: 'APPROVED',
                        reviewedBy: adminUserId,
                        reviewedAt: new Date()
                    }
                })
            })

            // Trigger confirmation email explictly
            const { error: resendError } = await supabaseAdmin.auth.resend({
                type: 'signup',
                email: registration.email,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
                }
            })

            if (resendError) {
                // console.error('Failed to send confirmation email')
            }

            revalidatePath('/dashboard/admin/registrations')
            return { success: true, message: 'Pendaftaran disetujui dan email konfirmasi telah dikirim' }
        } catch (e: unknown) {
            // console.error('Database Error')
            // Try to delete the auth user if DB creation failed AND it was a new user
            if (isNewUser && authUser) {
                await supabaseAdmin.auth.admin.deleteUser(authUser.id)
            }
            return { success: false, error: 'Gagal membuat data: ' + (e as Error).message }
        }
    } catch (error) {
        // console.error('Approve registration error')
        return { success: false, error: 'Terjadi kesalahan saat menyetujui pendaftaran' }
    }
}

export async function rejectRegistration(registrationId: string, adminUserId: string, reason: string) {
    try {
        await prisma.preUser.update({
            where: { id: registrationId },
            data: {
                status: 'REJECTED',
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                rejectionReason: reason
            }
        })

        revalidatePath('/dashboard/admin/registrations')
        return { success: true, message: 'Pendaftaran ditolak' }
    } catch (error) {
        // console.error('Reject registration error')
        return { success: false, error: 'Gagal menolak pendaftaran' }
    }
}
