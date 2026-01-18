'use client'

import { useActionState, useEffect } from 'react'
import { addStudentToParent } from '@/app/register/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext' // Added import

export default function AddStudentPage() {
    const { showToast } = useToast()
    const [state, formAction, isPending] = useActionState(addStudentToParent, null)

    useEffect(() => {
        if (state?.success) {
            showToast(state.message, 'success')
        } else if (state?.error) {
            showToast(state.error, 'error')
        }
    }, [state, showToast])

    if (state?.success) {
        return (
            <div className="max-w-lg mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                        </div>
                        <CardTitle className="text-green-600">Berhasil!</CardTitle>
                        <CardDescription>{state.message}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="flex gap-3 justify-center">
                            <Link href="/dashboard/parent">
                                <Button variant="outline">Kembali ke Dashboard</Button>
                            </Link>
                            <Link href="/dashboard/parent/add">
                                <Button onClick={() => window.location.reload()}>
                                    Tambah Santri Lagi
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Tambah Santri Baru</CardTitle>
                    <CardDescription>
                        Tambahkan anak Anda yang lain ke dalam akun yang sama
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        {state?.error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nama Lengkap Santri</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Masukkan nama lengkap santri"
                                required
                            />
                            {state?.fieldErrors?.fullName && (
                                <p className="text-sm text-destructive">{state.fieldErrors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                required
                            />
                            {state?.fieldErrors?.dateOfBirth && (
                                <p className="text-sm text-destructive">{state.fieldErrors.dateOfBirth}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link href="/dashboard/parent" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isPending} className="flex-1">
                                {isPending ? 'Menyimpan...' : 'Tambah Santri'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
