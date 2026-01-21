import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { Score } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStudentPayments } from "@/app/dashboard/admin/payments/actions"
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, GraduationCap, Wallet } from 'lucide-react'
import { TransferProofUpload } from '@/components/TransferProofUpload'

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get parent data with all their students
    const parent = await prisma.parent.findUnique({
        where: { userId: user.id },
        include: {
            students: {
                include: {
                    scores: {
                        orderBy: { createdAt: 'desc' },
                        take: 3 // Get latest 3 scores
                    }
                },
                orderBy: { fullName: 'asc' }
            }
        }
    })

    if (!parent) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                Data orang tua tidak ditemukan. Silakan hubungi admin.
            </div>
        )
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get payment status for all students
    const studentsWithPayments = await Promise.all(
        parent.students.map(async (student) => {
            const payments = await getStudentPayments(student.id)
            const currentPayment = payments.find((p: any) => p.month === currentMonth && p.year === currentYear)
            return {
                ...student,
                payments,
                isPaidThisMonth: currentPayment?.status === 'PAID'
            }
        })
    )

    // Count unpaid students this month
    const unpaidCount = studentsWithPayments.filter(s => !s.isPaidThisMonth).length

    // Get pending registrations for this parent
    const pendingRegistrations = await prisma.preUser.findMany({
        where: {
            existingParentId: parent.id,
            status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            {/* Parent Info Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Selamat Datang,</p>
                        <h1 className="text-2xl font-bold">{parent.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {parent.students.length} Santri terdaftar
                        </p>
                    </div>
                    <Link
                        href="/dashboard/parent/add"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-fit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                        Daftarkan Santri
                    </Link>
                </div>
            </div>

            {/* Pending Registrations Alert */}
            {pendingRegistrations.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-full shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-blue-900">Menunggu Persetujuan ({pendingRegistrations.length})</h3>
                            <p className="text-blue-800 mb-3">
                                Permintaan pendaftaran berikut sedang ditinjau oleh admin:
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {pendingRegistrations.map((reg: any) => (
                                    <div key={reg.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            {reg.studentFullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm truncate">{reg.studentFullName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Diajukan: {new Date(reg.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Alert Summary */}
            {unpaidCount > 0 ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-destructive/10 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Ada {unpaidCount} Santri Belum Lunas Bulan Ini</h3>
                        <p className="text-sm opacity-90">
                            Tagihan SPP untuk bulan <span className="font-semibold">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span> belum terbayarkan. Mohon segera lakukan pembayaran.
                        </p>
                    </div>
                </div>
            ) : parent.students.length > 0 && (
                <div className="bg-green-100 border border-green-200 text-green-800 rounded-xl p-4 flex items-start sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-green-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Semua Pembayaran Lunas</h3>
                        <p className="text-sm opacity-90">
                            Terima kasih, semua pembayaran SPP untuk bulan <span className="font-semibold">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span> sudah lunas.
                        </p>
                    </div>
                </div>
            )}

            {/* Students List */}
            {parent.students.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">Belum Ada Santri Terdaftar</h3>
                    <p className="text-muted-foreground mb-4">Klik tombol di bawah untuk menambahkan santri pertama Anda</p>
                    <Link
                        href="/dashboard/parent/add"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                        Tambah Santri Pertama
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Daftar Santri</h2>
                    <div className="grid gap-6">
                        {studentsWithPayments.sort((a, b) => (a.isPaidThisMonth === b.isPaidThisMonth) ? 0 : a.isPaidThisMonth ? 1 : -1).map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                isPaidThisMonth={student.isPaidThisMonth}
                                now={now}
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StudentCard({ student, isPaidThisMonth, now, currentMonth, currentYear }: { student: any; isPaidThisMonth: boolean; now: Date; currentMonth: number; currentYear: number }) {
    // Find last payment
    const sortedPayments = [...(student.payments || [])].sort((a: any, b: any) =>
        new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    )
    const lastPayment = sortedPayments[0]

    // Find current month payment to get existing proof URL
    const currentPayment = student.payments.find((p: any) => p.month === currentMonth && p.year === currentYear)

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-muted/5">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                    {student.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">{student.fullName}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground font-mono">NIS: {student.nis || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 grid grid-cols-2 gap-4">
                {/* Score Card */}
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col justify-between min-h-[100px]">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Nilai Terakhir</span>
                    </div>
                    <div>
                        {student.scores.length > 0 ? (
                            <>
                                <div className="text-2xl font-bold text-blue-900 tabular-nums">
                                    {student.scores[0].finalScore.toFixed(1)}
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                    {new Date(student.scores[0].createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">Belum ada nilai</div>
                        )}
                    </div>
                </div>

                {/* Payment Card */}
                <div className={`rounded-xl p-4 border flex flex-col justify-between min-h-[100px] ${isPaidThisMonth ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
                    }`}>
                    <div className={`flex items-center gap-2 mb-2 ${isPaidThisMonth ? 'text-emerald-700' : 'text-red-700'}`}>
                        <Wallet className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">SPP Bulan Ini</span>
                    </div>
                    <div>
                        <div className={`text-lg font-bold ${isPaidThisMonth ? 'text-emerald-900' : 'text-red-900'}`}>
                            {isPaidThisMonth ? 'LUNAS' : 'BELUM'}
                        </div>
                        {lastPayment && (
                            <div className={`text-xs mt-1 ${isPaidThisMonth ? 'text-emerald-600' : 'text-red-600'}`}>
                                {new Date(lastPayment.date || lastPayment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Section for Unpaid */}
            {!isPaidThisMonth && (
                <div className="px-4 pb-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="mb-2">
                            <p className="text-sm font-medium text-slate-700">Upload Bukti Transfer</p>
                            <p className="text-xs text-slate-500">BSI 1234567890 a.n TPA Nurul Iman</p>
                        </div>
                        <TransferProofUpload
                            studentId={student.id}
                            month={currentMonth}
                            year={currentYear}
                            existingProofUrl={currentPayment?.transferProofUrl}
                        />
                    </div>
                </div>
            )}

            {/* Footer Action */}
            <div className="p-4 bg-muted/5 border-t">
                <Link
                    href={`/dashboard/parent/${student.id}`}
                    className={buttonVariants({ variant: "outline", className: "w-full justify-between h-10 hover:bg-white hover:text-primary hover:border-primary/50 transition-all group" })}
                >
                    <span className="font-medium">Lihat Detail Lengkap</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
            </div>
        </div>
    )
}
