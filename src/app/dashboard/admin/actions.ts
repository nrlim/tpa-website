'use server'
import prisma from '@/lib/prisma'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { StudentType, Prisma } from '@prisma/client'

export async function deleteStudent(studentId: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { parent: true }
        })
        if (!student) return { error: 'Student not found' }

        // Check if this is the only student for this parent
        const siblingCount = await prisma.student.count({
            where: { parentId: student.parentId }
        })

        if (siblingCount === 1) {
            // This is the only student, delete Parent and User too

            // Delete from Supabase Auth
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

            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(student.parent.userId)

            if (authError) {
                // console.error('Failed to delete Supabase user')
                // We continue to delete from DB even if Auth delete fails (or maybe throw? 
                // typically we want to clean up DB primarily)
            }

            await prisma.user.delete({ where: { id: student.parent.userId } })
        } else {
            // Just delete the student
            await prisma.student.delete({ where: { id: studentId } })
        }

        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (error: unknown) {
        return { error: (error as Error).message }
    }
}

const updateSchema = z.object({
    id: z.string(),
    fullName: z.string().min(2),
    parentName: z.string().min(2),
    dateOfBirth: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
    classId: z.string().optional(),
    studentType: z.string(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateStudent(prevState: any, formData: FormData) {
    try {
        const data = Object.fromEntries(formData)
        const parsed = updateSchema.safeParse(data)

        if (!parsed.success) {
            return { error: 'Invalid data' }
        }

        const { id, fullName, parentName, dateOfBirth, phoneNumber, address, classId, studentType } = parsed.data

        // Get student with parent
        const student = await prisma.student.findUnique({
            where: { id },
            include: { parent: true }
        })

        if (!student) {
            return { error: 'Student not found' }
        }

        // Update student data
        await prisma.student.update({
            where: { id },
            data: {
                fullName,
                dateOfBirth: new Date(dateOfBirth),
                classId: classId ? parseInt(classId) : null,
                studentType: studentType as StudentType
            }
        })

        // Update parent data
        await prisma.parent.update({
            where: { id: student.parentId },
            data: {
                name: parentName,
                phoneNumber,
                address
            }
        })

        revalidatePath('/dashboard/admin')
        return { success: true, message: 'Data santri berhasil diperbarui' }
    } catch (error: unknown) {
        // console.error('Error updating student:', error)
        return { error: (error as Error).message }
    }
}


export async function toggleUserStatus(studentId: string, isActive: boolean) {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { parent: true }
        })

        if (!student) return { error: 'Student not found' }

        await prisma.user.update({
            where: { id: student.parent.userId },
            data: { isActive }
        })

        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (error: unknown) {
        return { error: (error as Error).message }
    }
}

export async function getAllStudentsForReport(filters: { q?: string; classId?: string; studentType?: string }) {
    const { q, classId, studentType } = filters;
    const where: Prisma.StudentWhereInput = {
        AND: [
            q ? {
                OR: [
                    { fullName: { contains: q, mode: 'insensitive' } },
                    { parent: { name: { contains: q, mode: 'insensitive' } } }
                ]
            } : {},
            classId ? { classId: Number(classId) } : {},
            studentType ? { studentType: studentType as StudentType } : {}
        ]
    };

    const students = await prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            parent: {
                include: {
                    user: true
                }
            },
            class: true
        }
    });

    return students;
}

