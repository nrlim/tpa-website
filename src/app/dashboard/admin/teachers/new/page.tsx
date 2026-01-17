'use client'

import { useActionState } from 'react'
import { createTeacher } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PasswordInput } from '@/components/ui/password-input'

export default function NewTeacherPage() {
    const [state, action, isPending] = useActionState(createTeacher, null)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin/teachers" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold">Tambah Pengajar Baru</h1>
            </div>

            <div className="border rounded-xl p-6 bg-card shadow-sm">
                <form action={action} className="space-y-6">
                    {state?.error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" name="name" placeholder="Nama Ustadz/Ustadzah" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (untuk Login)</Label>
                        <Input id="email" name="email" type="email" placeholder="email@tpanuruliman.com" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput id="password" name="password" minLength={6} placeholder="Minimal 6 karakter" required />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Link href="/dashboard/admin/teachers">
                            <Button variant="outline" type="button">Batal</Button>
                        </Link>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Simpan Pengajar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
