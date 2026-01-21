'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileDown, Loader2, Printer } from 'lucide-react'
import { useState } from 'react'

interface Score {
    id: string
    createdAt: Date
    reading: number
    memorization: number
    discipline: number
    attendance: number
    behavior: number
    finalScore: number
    teacher?: {
        name: string
    } | null
}

interface Student {
    id: string
    fullName: string
    nis: string | null
    parent: {
        name: string
        address: string
    }
    class?: {
        name: string
    } | null
    scores: Score[]
}

interface ReportGeneratorProps {
    student: Student
}

export function ReportGenerator({ student }: ReportGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedScoreIds, setSelectedScoreIds] = useState<string[]>([])

    // Helper to toggle selection
    const toggleScore = (id: string) => {
        setSelectedScoreIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const selectLatest = () => {
        if (student.scores.length > 0) {
            setSelectedScoreIds([student.scores[0].id])
        }
    }

    const selectAll = () => {
        setSelectedScoreIds(student.scores.map(s => s.id))
    }

    const generateDoc = async () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        })

        // Filter scores
        const scoresToPrint = student.scores.filter(s => selectedScoreIds.includes(s.id))

        // Calculate Averages
        let averages = null
        if (scoresToPrint.length > 1) {
            const count = scoresToPrint.length
            averages = {
                reading: scoresToPrint.reduce((acc, s) => acc + s.reading, 0) / count,
                memorization: scoresToPrint.reduce((acc, s) => acc + s.memorization, 0) / count,
                discipline: scoresToPrint.reduce((acc, s) => acc + s.discipline, 0) / count,
                attendance: scoresToPrint.reduce((acc, s) => acc + s.attendance, 0) / count,
                behavior: scoresToPrint.reduce((acc, s) => acc + s.behavior, 0) / count,
                finalScore: scoresToPrint.reduce((acc, s) => acc + s.finalScore, 0) / count,
            }
        }

        // Load logo
        const logoUrl = '/logo.png'
        const logoImg = new Image()
        logoImg.src = logoUrl
        await new Promise((resolve) => {
            logoImg.onload = resolve
            logoImg.onerror = resolve
        })

        // === Header Section (Black & White Professional) ===

        // Logo
        if (logoImg.complete && logoImg.naturalHeight !== 0) {
            doc.addImage(logoImg, 'PNG', 14, 10, 22, 22)
        }

        // Title
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text('LAPORAN HASIL BELAJAR', 42, 20)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.text('Taman Pendidikan Al-Qur\'an Nurul Iman', 42, 27)

        // Header Line Separator
        doc.setLineWidth(0.5)
        doc.line(14, 38, 196, 38)
        doc.setLineWidth(0.1) // Reset width

        // === Student Info Section ===
        const startY = 48
        const gap = 8

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Data Santri', 14, startY)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        // Alignment Constants
        const leftLabelX = 14
        const leftColonX = 50
        const leftValueX = 53

        const rightLabelX = 110
        const rightColonX = 140
        const rightValueX = 143

        const infoY = startY + 12

        // Left Column
        doc.text('Nama Lengkap', leftLabelX, infoY)
        doc.text(':', leftColonX, infoY)
        doc.text(student.fullName, leftValueX, infoY)

        doc.text('NIS', leftLabelX, infoY + gap)
        doc.text(':', leftColonX, infoY + gap)
        doc.text(student.nis || '-', leftValueX, infoY + gap)

        // Right Column
        doc.text('Orang Tua', rightLabelX, infoY)
        doc.text(':', rightColonX, infoY)
        doc.text(student.parent.name, rightValueX, infoY)

        doc.text('Kelas', rightLabelX, infoY + gap)
        doc.text(':', rightColonX, infoY + gap)
        doc.text(student.class?.name || '-', rightValueX, infoY + gap)

        // === Grades Table ===
        const tableColumn = [
            'No',
            'Tanggal',
            'Pengajar',
            'Bacaan',
            'Hafalan',
            'Disiplin',
            'Hadir',
            'Akhlak',
            'Nilai Akhir',
        ]

        const tableRows = scoresToPrint.map((score, index) => [
            index + 1,
            new Date(score.createdAt).toLocaleDateString('id-ID'),
            score.teacher?.name || '-',
            score.reading,
            score.memorization,
            score.discipline,
            score.attendance,
            score.behavior,
            score.finalScore.toFixed(1),
        ])

        if (averages) {
            tableRows.push([
                '',
                'RATA - RATA',
                '',
                averages.reading.toFixed(1),
                averages.memorization.toFixed(1),
                averages.discipline.toFixed(1),
                averages.attendance.toFixed(1),
                averages.behavior.toFixed(1),
                averages.finalScore.toFixed(1)
            ])
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: infoY + gap * 2.5,
            theme: 'grid', // Grid creates borders
            headStyles: {
                fillColor: [240, 240, 240], // Light Gray
                textColor: 0, // Black
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.1,
                lineColor: 0 // Black borders
            },
            styles: {
                textColor: 0,
                fontSize: 9,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: 0
            },
            columnStyles: {
                0: { cellWidth: 10 }, // No
                1: { halign: 'left', cellWidth: 25 }, // Tanggal
                2: { halign: 'left' }  // Pengajar
            },
            alternateRowStyles: {
                fillColor: false, // Clean white
            },
            didParseCell: (data) => {
                if (averages && data.row.index === tableRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold'
                    data.cell.styles.fillColor = [240, 240, 240] // Light Gray summary
                }
            }
        })

        // === Footer / Signature ===
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 150

        const signatureY = finalY + 20

        if (signatureY > 250) {
            doc.addPage()
        }

        const sigY = signatureY > 250 ? 50 : signatureY

        const dateStr = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text(`Jakarta, ${dateStr}`, 145, sigY)
        doc.text('Mengetahui,', 145, sigY + 5)
        doc.text('Kepala TPA', 145, sigY + 10)
        doc.text('(..........................)', 145, sigY + 35)

        // Page numbering associated with bottom
        const totalPages = doc.internal.pages.length - 1
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.text(`Halaman ${i} dari ${totalPages}`, 105, 285, { align: 'center' })
        }

        const fileName = averages
            ? `Raport-Riwayat-${student.fullName.replace(/\s+/g, '_')}.pdf`
            : `Raport-${student.fullName.replace(/\s+/g, '_')}-${new Date(scoresToPrint[0].createdAt).toISOString().split('T')[0]}.pdf`

        return { doc, fileName }
    }

    const handleDownload = async () => {
        if (selectedScoreIds.length === 0) {
            alert('Pilih setidaknya satu nilai.')
            return
        }

        setLoading(true)
        try {
            const { doc, fileName } = await generateDoc()
            doc.save(fileName)
            setOpen(false)
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            alert('Gagal membuat PDF. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = async () => {
        if (selectedScoreIds.length === 0) {
            alert('Pilih setidaknya satu nilai.')
            return
        }

        setLoading(true)
        try {
            const { doc } = await generateDoc()
            doc.autoPrint()
            // @ts-ignore - jspdf types might range between versions
            const blobUrl = doc.output('bloburl')

            // Create an hidden iframe to trigger print
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.right = '0'
            iframe.style.bottom = '0'
            iframe.style.width = '0'
            iframe.style.height = '0'
            iframe.style.border = '0'
            iframe.src = String(blobUrl)
            document.body.appendChild(iframe)

            iframe.onload = () => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.focus() // Ensure focus
                    iframe.contentWindow.print()
                }
                // Clean up after a long delay to ensure print dialog isn't closed prematurely
                setTimeout(() => {
                    try {
                        document.body.removeChild(iframe)
                    } catch (e) {
                        // Ignore if already removed
                    }
                }, 300000) // 5 minutes
            }

            setOpen(false)
        } catch (error) {
            console.error('Failed to print PDF:', error)
            alert('Gagal mencetak PDF. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <FileDown className="mr-2 h-4 w-4" />
                    Unduh Raport
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pilih Nilai Raport</DialogTitle>
                    <DialogDescription>
                        Pilih nilai yang ingin dicetak atau diunduh.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button size="sm" variant="outline" onClick={selectLatest}>Pilih Terakhir</Button>
                    <Button size="sm" variant="outline" onClick={selectAll}>Pilih Semua</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedScoreIds([])} className="ml-auto text-destructive hover:text-destructive">Reset</Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                    {student.scores.length === 0 ? (
                        <p className="text-center text-muted-foreground p-4">Belum ada nilai.</p>
                    ) : (
                        student.scores.map(score => (
                            <div key={score.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer" onClick={() => toggleScore(score.id)}>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedScoreIds.includes(score.id)}
                                    onChange={() => { }}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {new Date(score.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                        <span>Nilai Akhir: <span className="font-bold text-primary">{score.finalScore.toFixed(1)}</span></span>
                                        <span>• {score.teacher?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handlePrint} disabled={loading || selectedScoreIds.length === 0}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak Langsung
                        </Button>
                        <Button onClick={handleDownload} disabled={loading || selectedScoreIds.length === 0}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Unduh PDF
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
