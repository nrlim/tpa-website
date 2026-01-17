'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function deleteStudent(studentId: string) {
    try {
        const student = await prisma.student.findUnique({ where: { id: studentId } })
        if (!student) return { error: 'Student not found' }

        // Delete the User (cascades to Student and Scores)
        await prisma.user.delete({ where: { id: student.userId } })

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
})

export async function updateStudent(prevState: any, formData: FormData) {
    try {
        const data = Object.fromEntries(formData)
        const parsed = updateSchema.safeParse(data)

        if (!parsed.success) {
            return { error: 'Invalid data' }
        }

        const { id, ...updateData } = parsed.data

        await prisma.student.update({
            where: { id },
            data: {
                ...updateData,
                dateOfBirth: new Date(updateData.dateOfBirth)
            }
        })

        revalidatePath('/dashboard/admin')
        return { success: true, message: 'Data santri berhasil diperbarui' }
    } catch (error: unknown) {
        return { error: (error as Error).message }
    }
}
