'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Create a Supabase Admin client for user management
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

const teacherSchema = z.object({
    name: z.string().min(2, "Nama harus diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
})

export async function createTeacher(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData)
    const parsed = teacherSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Mohon perbaiki isian form' }
    }

    const { name, email, password } = parsed.data

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (authError) {
            return { error: authError.message }
        }

        if (!authData.user) {
            return { error: 'Gagal membuat user auth' }
        }

        // 2. Ensure Teacher Role exists
        const teacherRole = await prisma.role.upsert({
            where: { name: 'teacher' },
            update: {},
            create: { name: 'teacher' }
        })

        // 3. Create Database Record
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    id: authData.user!.id,
                    email,
                    roleId: teacherRole.id
                }
            })

            await tx.teacher.create({
                data: {
                    userId: user.id,
                    name
                }
            })
        })

    } catch (error: any) {
        // console.error('Create Teacher Error')
        return { error: error.message || 'Gagal menyimpan data pengajar' }
    }

    revalidatePath('/dashboard/admin/teachers')
    redirect('/dashboard/admin/teachers')
}

export async function deleteTeacher(teacherId: string) {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { user: true }
        })

        if (!teacher) return { error: 'Teacher not found' }

        // 1. Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(teacher.userId)

        if (authError) {
            // console.error('Error deleting auth user')
            // Continue to delete DB record anyway to keep clean
        }

        // 2. Delete User from DB (Cascades to Teacher)
        await prisma.user.delete({ where: { id: teacher.userId } })

        revalidatePath('/dashboard/admin/teachers')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
