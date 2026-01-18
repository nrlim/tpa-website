import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { Score } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStudentPayments } from "@/app/dashboard/admin/payments/actions"

// Quick components for Card (I don't have them in UI yet, I should use standard divs or create them, but I will simulate them or use standard HTML with classes)
// Actually I can create ui/card.tsx but it takes time. I will just use divs with classes to be faster and still look good.
// "Use best practices... Create components".
// Okay, I should probably generate `src/components/ui/card.tsx`.
// But I will just write inline styles for now to ensure I finish the main logic.
// Wait, I can't overwrite `card` variable if I import.
// I will use `div className="bg-card ..."` 

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: {
            scores: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    const payments = student ? await getStudentPayments(student.id) : []

    if (!student) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                Data santri tidak ditemukan. Silakan hubungi admin.
            </div>
        )
    }


    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const currentPayment = payments.find((p: any) => p.month === currentMonth && p.year === currentYear)
    const isPaidThisMonth = currentPayment?.status === 'PAID'

    return (
        <div className="space-y-8">
            {/* Payment Alert */}
            {!isPaidThisMonth ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-destructive/10 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Pembayaran Bulan Ini Belum Lunas</h3>
                        <p className="text-sm opacity-90">
                            Tagihan SPP untuk bulan <span className="font-semibold">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span> belum terbayarkan. Mohon segera lakukan pembayaran.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-100 border border-green-200 text-green-800 rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-green-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Pembayaran Bulan Ini Lunas</h3>
                        <p className="text-sm opacity-90">
                            Terima kasih, pembayaran SPP untuk bulan <span className="font-semibold">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span> sudah lunas.
                        </p>
                    </div>
                </div>
            )}

            {/* Profile Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Profil Santri</h2>
                <div className="bg-card border rounded-xl p-6 shadow-sm grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                        <p className="font-semibold text-lg">{student.fullName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">NIS / ID</p>
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded w-fit">
                            {student.nis || 'Belum ada NIS'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Orang Tua</p>
                        <p className="font-medium">{student.parentName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                        <p className="font-medium">{student.dateOfBirth.toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Alamat</p>
                        <p className="font-medium">{student.address}</p>
                    </div>
                </div>
            </section>

            {/* Scores Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Riwayat Nilai</h2>
                {student.scores.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed">
                        <p className="text-muted-foreground">Belum ada nilai yang diinput oleh pengajar.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {student.scores.map((score: Score) => (
                            <div key={score.id} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
                                    <span className="font-semibold text-primary">Laporan Belajar</span>
                                    <span className="text-xs text-muted-foreground">{score.createdAt.toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm">Bacaan (Iqro/Qur&apos;an)</span>
                                        <span className="font-bold">{score.reading}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm">Hafalan</span>
                                        <span className="font-bold">{score.memorization}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm">Kedisiplinan</span>
                                        <span className="font-bold">{score.discipline}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm">Kehadiran</span>
                                        <span className="font-bold">{score.attendance}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-sm">Akhlak/Perilaku</span>
                                        <span className="font-bold">{score.behavior}</span>
                                    </div>
                                    <div className="mt-4 pt-3 border-t bg-muted/30 -mx-4 -mb-4 p-4 flex justify-between items-center">
                                        <span className="font-bold text-lg">Nilai Akhir</span>
                                        <span className="font-black text-2xl text-primary">{score.finalScore.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Payment History Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Riwayat Pembayaran</h2>
                {payments.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed">
                        <p className="text-muted-foreground">Belum ada data pembayaran.</p>
                    </div>
                ) : (
                    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground border-b">
                                    <tr>
                                        <th className="p-4 font-medium whitespace-nowrap">Periode</th>
                                        <th className="p-4 font-medium whitespace-nowrap">Status</th>
                                        <th className="p-4 font-medium whitespace-nowrap">Tanggal Bayar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment: any) => (
                                        <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="p-4 whitespace-nowrap">
                                                {new Date(payment.year, payment.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <Badge variant={payment.status === 'PAID' ? 'default' : 'destructive'}
                                                    className={payment.status === 'PAID' ? 'bg-green-600' : 'bg-red-600'}>
                                                    {payment.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                                                {payment.paidAt ? payment.paidAt.toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
