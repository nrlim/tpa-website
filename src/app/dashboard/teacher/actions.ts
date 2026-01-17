'use server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addScore(prevState: any, formData: FormData) {
    const studentId = formData.get('studentId') as string
    const reading = Number(formData.get('reading'))
    const memorization = Number(formData.get('memorization'))
    const discipline = Number(formData.get('discipline'))
    const attendance = Number(formData.get('attendance'))
    const behavior = Number(formData.get('behavior'))

    // Validate 0-100
    if (
        [reading, memorization, discipline, attendance, behavior].some(s => s < 0 || s > 100)
    ) {
        return { error: 'Nilai harus antara 0 - 100' }
    }

    const finalScore = (reading + memorization + discipline + attendance + behavior) / 5

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Find Teacher Profile
    let teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })

    if (!teacher) {
        // Try to find if user has 'teacher' role
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { role: true }
        })

        if (dbUser?.role?.name === 'teacher') {
            // Lazy create teacher profile
            teacher = await prisma.teacher.create({
                data: {
                    userId: user.id,
                    name: dbUser.email // Default name from email
                }
            })
        } else {
            return { error: 'Anda tidak memiliki akses pengajar.' }
        }
    }

    try {
        await prisma.score.create({
            data: {
                studentId,
                teacherId: teacher.id,
                reading,
                memorization,
                discipline,
                attendance,
                behavior,
                finalScore
            }
        })
        revalidatePath(`/dashboard/teacher/student/${studentId}`)
        return { success: true, message: 'Nilai berhasil disimpan' }
    } catch (e: unknown) {
        return { error: 'Gagal menyimpan: ' + (e as Error).message }
    }
}
