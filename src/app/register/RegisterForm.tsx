'use client'

import { useActionState } from 'react'
import { useEffect } from 'react'
import { registerStudent } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useToast } from '@/context/ToastContext'

export default function RegisterForm() {
    const { showToast } = useToast()
    const [state, action, isPending] = useActionState(registerStudent, null)

    useEffect(() => {
        if (state?.success) {
            showToast(state.message, 'success')
        } else if (state?.error) {
            showToast(state.error, 'error')
        }
    }, [state, showToast])

    return (
        <div className="w-full max-w-2xl bg-card border rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-800">Pendaftaran Santri Baru</h1>
                <p className="text-muted-foreground mt-2">Silakan lengkapi formulir di bawah ini dengan data yang benar.</p>
            </div>

            <form action={action} className="space-y-6">
                {/* Success Message - Pending Approval */}
                {state?.success && state?.isPending && (
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-blue-900 mb-2">Pendaftaran Sedang Diproses! ⏳</h3>
                                <p className="text-blue-800 mb-3">{state.message}</p>
                                <div className="bg-white rounded-md p-4 border border-blue-200">
                                    <p className="font-semibold text-blue-900 mb-2">Yang Perlu Anda Ketahui:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                                        <li>Pendaftaran Anda akan ditinjau oleh admin TPA</li>
                                        <li>Anda akan menerima email konfirmasi setelah disetujui</li>
                                        <li>Proses review biasanya memakan waktu 1-2 hari kerja</li>
                                        <li>Silakan hubungi admin jika ada pertanyaan</li>
                                    </ul>
                                    <p className="text-xs text-blue-600 mt-3">
                                        💡 Terima kasih atas kesabaran Anda!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {state?.error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                        {state.error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nama Lengkap Santri</Label>
                        <Input id="fullName" name="fullName" placeholder="Contoh: Ahmad Fadillah" required />
                        {state?.fieldErrors?.fullName && <p className="text-destructive text-xs">{state.fieldErrors.fullName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                        <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                        {state?.fieldErrors?.dateOfBirth && <p className="text-destructive text-xs">{state.fieldErrors.dateOfBirth}</p>}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="parentName">Nama Orang Tua / Wali</Label>
                        <Input id="parentName" name="parentName" placeholder="Contoh: Budi Santoso" required />
                        {state?.fieldErrors?.parentName && <p className="text-destructive text-xs">{state.fieldErrors.parentName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
                        <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="08xxxxxxxxxx" required />
                        {state?.fieldErrors?.phoneNumber && <p className="text-destructive text-xs">{state.fieldErrors.phoneNumber}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Input id="address" name="address" placeholder="Jalan..." required />
                    {state?.fieldErrors?.address && <p className="text-destructive text-xs">{state.fieldErrors.address}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (untuk Login)</Label>
                        <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
                        {state?.fieldErrors?.email && <p className="text-destructive text-xs">{state.fieldErrors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput id="password" name="password" minLength={6} required />
                        {state?.fieldErrors?.password && <p className="text-destructive text-xs">{state.fieldErrors.password}</p>}
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isPending}>
                    {isPending ? 'Memproses...' : 'Daftar Sekarang'}
                </Button>
            </form>
        </div>
    )
}
