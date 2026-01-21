import prisma from '@/lib/prisma'
import { ScoreForm } from './ScoreForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ReportGenerator } from '@/components/ReportGenerator'

export default async function StudentGradePage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = await params
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            parent: true,
            class: true,
            scores: {
                orderBy: { createdAt: 'desc' },
                include: { teacher: true }
            }
        }
    })

    if (!student) return <div>Santri tidak ditemukan</div>

    return (
        <div className="space-y-8 container mx-auto">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/teacher">
                        <Button variant="outline" size="sm">Kembali</Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Penilaian: {student.fullName}</h1>
                </div>
                <ReportGenerator student={student} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ScoreForm studentId={student.id} />

                    <div>
                        <h3 className="text-xl font-bold mb-4">Riwayat Nilai</h3>
                        {student.scores.length === 0 ? (
                            <p className="text-muted-foreground">Belum ada nilai.</p>
                        ) : (
                            <div className="space-y-4">
                                {student.scores.map(score => (
                                    <div key={score.id} className="border rounded-lg p-4 bg-card shadow-sm">
                                        <div className="flex justify-between items-start mb-2 border-b pb-2">
                                            <div>
                                                <p className="font-semibold text-sm">Tanggal: {score.createdAt.toLocaleDateString()}</p>
                                                <p className="text-xs text-muted-foreground">Oleh: {score.teacher?.name || 'Unknown'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-2xl font-black text-primary">{score.finalScore.toFixed(1)}</span>
                                                <span className="text-xs text-muted-foreground">Nilai Akhir</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                            <div>
                                                <span className="block font-bold">{score.reading}</span>
                                                <span className="text-xs text-muted-foreground">Bacaan</span>
                                            </div>
                                            <div>
                                                <span className="block font-bold">{score.memorization}</span>
                                                <span className="text-xs text-muted-foreground">Hafalan</span>
                                            </div>
                                            <div>
                                                <span className="block font-bold">{score.discipline}</span>
                                                <span className="text-xs text-muted-foreground">Disiplin</span>
                                            </div>
                                            <div>
                                                <span className="block font-bold">{score.attendance}</span>
                                                <span className="text-xs text-muted-foreground">Hadir</span>
                                            </div>
                                            <div>
                                                <span className="block font-bold">{score.behavior}</span>
                                                <span className="text-xs text-muted-foreground">Akhlak</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    {/* Sidebar Profile Info */}
                    <div className="bg-muted/30 p-6 rounded-xl border space-y-4 shadow-sm">
                        <h3 className="font-semibold mb-2">Data Santri</h3>
                        <div>
                            <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                            <p className="font-medium">{student.fullName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">NIS</p>
                            <p className="font-medium font-mono">{student.nis || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Orang Tua</p>
                            <p className="font-medium">{student.parent.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Alamat</p>
                            <p className="font-medium">{student.parent.address}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">No. HP</p>
                            <p className="font-medium">{student.parent.phoneNumber}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
