'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Invalid login credentials' }
    }

    let redirectPath = '/dashboard/student' // default

    if (data.user) {
        const user = await prisma.user.findUnique({
            where: { id: data.user.id },
            include: { role: true }
        })

        if (user?.role?.name === 'admin') {
            redirectPath = '/dashboard/admin'
        } else if (user?.role?.name === 'teacher') {
            redirectPath = '/dashboard/teacher'
        } else if (user?.role?.name === 'student') {
            redirectPath = '/dashboard/student'
        }
    }

    redirect(redirectPath)
}
