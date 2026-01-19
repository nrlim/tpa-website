'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createClassSchema = z.object({
    name: z.string().min(1, "Nama kelas wajib diisi"),
    description: z.string().optional(),
})

export async function createClass(prevState: any, formData: FormData) {
    try {
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
        }

        const parsed = createClassSchema.safeParse(data)

        if (!parsed.success) {
            return { error: 'Invalid data', errors: parsed.error.flatten().fieldErrors }
        }

        // Check for duplicate name
        const existing = await prisma.masterClass.findUnique({
            where: { name: parsed.data.name }
        })

        if (existing) {
            return { error: 'Nama kelas sudah ada' }
        }

        await prisma.masterClass.create({
            data: {
                name: parsed.data.name,
                description: parsed.data.description,
            }
        })

        revalidatePath('/dashboard/admin/classes')
        return { success: true, message: 'Kelas berhasil dibuat' }
    } catch (error: unknown) {
        return { error: (error as Error).message }
    }
}

export async function deleteClass(classId: number) {
    try {
        await prisma.masterClass.delete({
            where: { id: classId }
        })

        revalidatePath('/dashboard/admin/classes')
        return { success: true }
    } catch (error: unknown) {
        return { error: (error as Error).message }
    }
}
