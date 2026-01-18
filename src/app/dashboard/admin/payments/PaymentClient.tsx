'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { markPayment, markBulkPayment } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF interface if needed, or simply force cast to any
// Usually autoTable adds itself to prototype.

interface StudentPayment {
    id: string
    fullName: string
    nis: string | null
    status: string // "PAID" | "UNPAID"
    paymentId?: string
    phoneNumber: string
}

interface PaymentClientProps {
    initialStudents: StudentPayment[]
    currentMonth: number
    currentYear: number
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const YEARS = [2024, 2025, 2026, 2027]

export default function PaymentClient({ initialStudents, currentMonth, currentYear }: PaymentClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkPending, setIsBulkPending] = useState(false)

    const handleDateChange = (type: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(window.location.search)
        params.set(type === 'month' ? 'month' : 'year', value)
        startTransition(() => {
            router.push(`?${params.toString()}`)
            setSelectedIds([]) // clear selection on date change
        })
    }

    const handleTogglePayment = async (studentId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID'
        try {
            await markPayment(studentId, currentMonth, currentYear, newStatus)
        } catch (error) {
            alert("Failed to update payment")
        }
    }

    const handleWhatsApp = (student: StudentPayment) => {
        if (!student.phoneNumber) return

        let phone = student.phoneNumber
        // Basic formatting: ensure starts with 62, remove 0 or + at start
        phone = phone.replace(/\D/g, '')
        if (phone.startsWith('0')) {
            phone = '62' + phone.slice(1)
        }

        const monthName = MONTHS[currentMonth - 1]

        const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali Santri
*${student.fullName}*

Semoga Bapak/Ibu senantiasa dalam keadaan sehat walafiat.

Kami dari Admin TPA Nurul Iman ingin mengingatkan mengenai pembayaran SPP (Syahriah) Ananda untuk periode:
Bulan: *${monthName} ${currentYear}*
Status: *BELUM LUNAS*

Mohon kesediaannya untuk dapat segera menyelesaikan administrasi tersebut.

Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
_Jazakumullahu Khairan Katsiran._

Wassalamu'alaikum Warahmatullahi Wabarakatuh.

---
_Pesan ini dikirim melalui Sistem Informasi TPA Nurul Iman_`

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    // Selection Logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(initialStudents.map(s => s.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (checked: boolean, studentId: string) => {
        if (checked) {
            setSelectedIds(prev => [...prev, studentId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== studentId))
        }
    }

    const handleBulkPay = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`Are you sure you want to mark ${selectedIds.length} students as PAID?`)) return

        setIsBulkPending(true)
        try {
            await markBulkPayment(selectedIds, currentMonth, currentYear, 'PAID')
            setSelectedIds([])
        } catch (error) {
            alert("Failed to update payments")
        } finally {
            setIsBulkPending(false)
        }
    }

    const generatePDF = async () => {
        const doc = new jsPDF()

        // Elegant Minimalist Palette
        const colorPrimary: [number, number, number] = [33, 33, 33]       // Near Black
        const colorSecondary: [number, number, number] = [97, 97, 97]     // Dark Gray
        const colorMuted: [number, number, number] = [158, 158, 158]      // Medium Gray
        const colorBorder: [number, number, number] = [224, 224, 224]     // Light Gray
        const colorAccent: [number, number, number] = [66, 66, 66]        // Charcoal

        const monthName = MONTHS[currentMonth - 1]
        const periodText = `${monthName} ${currentYear}`
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20

        // --- LOAD LOGO ---
        const logoUrl = '/logo.png'
        let logoLoaded = false

        try {
            const img = new Image()
            img.crossOrigin = 'anonymous'

            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    // Add logo - positioned on the left
                    const logoHeight = 18
                    const logoWidth = (img.width / img.height) * logoHeight
                    doc.addImage(img, 'PNG', margin, 12, logoWidth, logoHeight)
                    logoLoaded = true
                    resolve()
                }
                img.onerror = () => {
                    console.warn('Logo not loaded, continuing without logo')
                    resolve()
                }
                img.src = logoUrl
            })
        } catch (error) {
            console.warn('Error loading logo:', error)
        }

        // --- LETTERHEAD HEADER (KOP SURAT) ---
        const headerTextX = logoLoaded ? margin + 25 : margin

        // Institution Name
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
        doc.text("TPA NURUL IMAN", headerTextX, 18)

        // Tagline / Address
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2])
        doc.text("Majelis Nurul Iman • Baltic Area", headerTextX, 24)

        // Contact info (optional line)
        doc.setFontSize(8)
        doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2])
        doc.text("Pendidikan Al-Qur'an untuk Generasi Islami", headerTextX, 29)

        // Double line separator (elegant letterhead style)
        doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
        doc.setLineWidth(0.8)
        doc.line(margin, 35, pageWidth - margin, 35)
        doc.setLineWidth(0.3)
        doc.line(margin, 37, pageWidth - margin, 37)

        // --- DOCUMENT TITLE ---
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
        doc.text("LAPORAN PEMBAYARAN SPP", pageWidth / 2, 47, { align: "center" })

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2])
        doc.text(`Periode: ${periodText}`, pageWidth / 2, 53, { align: "center" })

        // --- SUMMARY SECTION ---
        const totalStudents = initialStudents.length
        const totalPaid = initialStudents.filter(s => s.status === 'PAID').length
        const totalUnpaid = totalStudents - totalPaid
        const collectionRate = totalStudents > 0 ? ((totalPaid / totalStudents) * 100).toFixed(0) : "0"

        const summaryY = 65
        const boxWidth = 38
        const boxHeight = 18
        const boxSpacing = 4
        const totalBoxWidth = (boxWidth * 4) + (boxSpacing * 3)
        const startX = (pageWidth - totalBoxWidth) / 2

        const drawStatBox = (label: string, value: string, x: number) => {
            // Box background - subtle
            doc.setFillColor(250, 250, 250)
            doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
            doc.roundedRect(x, summaryY, boxWidth, boxHeight, 2, 2, 'FD')

            // Value
            doc.setFont("helvetica", "bold")
            doc.setFontSize(12)
            doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
            doc.text(value, x + boxWidth / 2, summaryY + 8, { align: "center" })

            // Label
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7)
            doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2])
            doc.text(label.toUpperCase(), x + boxWidth / 2, summaryY + 14, { align: "center" })
        }

        drawStatBox("Total Santri", totalStudents.toString(), startX)
        drawStatBox("Lunas", totalPaid.toString(), startX + boxWidth + boxSpacing)
        drawStatBox("Belum Lunas", totalUnpaid.toString(), startX + (boxWidth + boxSpacing) * 2)
        drawStatBox("Persentase", `${collectionRate}%`, startX + (boxWidth + boxSpacing) * 3)

        // --- TABLE ---
        const tableData = initialStudents.map((s, index) => [
            (index + 1).toString(),
            s.fullName,
            s.nis || '-',
            s.status === 'PAID' ? 'LUNAS' : 'BELUM'
        ])

        autoTable(doc, {
            head: [['No', 'Nama Santri', 'NIS', 'Status']],
            body: tableData,
            startY: summaryY + boxHeight + 10,
            theme: 'grid',
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            styles: {
                fontSize: 9,
                cellPadding: 4,
                lineColor: colorBorder,
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: colorPrimary,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles: {
                textColor: colorSecondary,
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { halign: 'left' },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
            },
            alternateRowStyles: {
                fillColor: [252, 252, 252]
            },
            didParseCell: (data) => {
                // Status styling
                if (data.section === 'body' && data.column.index === 3) {
                    if (data.cell.raw === 'LUNAS') {
                        data.cell.styles.textColor = [40, 40, 40]
                    } else {
                        data.cell.styles.textColor = [170, 170, 170]
                    }
                }
            }
        })

        // --- FOOTER SECTION ---
        const totalPages = doc.getNumberOfPages()
        const pageHeight = doc.internal.pageSize.getHeight()

        // Add footer to all pages
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7)
            doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2])

            // Left side - Document info
            doc.text(
                "Dokumen ini dibuat secara otomatis oleh Sistem Informasi TPA Nurul Iman",
                margin,
                pageHeight - 10
            )

            // Right side - Page numbers
            doc.text(
                `Halaman ${i} dari ${totalPages}`,
                pageWidth - margin,
                pageHeight - 10,
                { align: "right" }
            )
        }

        // Go to the last page for signature
        doc.setPage(totalPages)
        const finalY = (doc as any).lastAutoTable.finalY + 15

        // Signature section (if space allows on last page)
        if (finalY < pageHeight - 60) {
            const signatureX = pageWidth - margin - 50

            doc.setFont("helvetica", "normal")
            doc.setFontSize(9)
            doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2])

            // Date
            const today = new Date()
            const dateStr = today.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            doc.text(`Baltic, ${dateStr}`, signatureX, finalY, { align: "center" })

            // Title
            doc.text("Mengetahui,", signatureX, finalY + 6, { align: "center" })

            // Signature line
            doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
            doc.setLineWidth(0.3)
            doc.line(signatureX - 25, finalY + 28, signatureX + 25, finalY + 28)

            // Name placeholder
            doc.setFont("helvetica", "bold")
            doc.text("Admin TPA", signatureX, finalY + 34, { align: "center" })
        }

        doc.save(`Laporan_SPP_${monthName}_${currentYear}.pdf`)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Manage Payments</CardTitle>
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                onClick={handleBulkPay}
                                disabled={isBulkPending}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isBulkPending ? 'Processing...' : `Mark ${selectedIds.length} as PAID`}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={generatePDF}
                            className="flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-down"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                            Download Report
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Month</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentMonth}
                            onChange={(e) => handleDateChange('month', e.target.value)}
                            disabled={isPending}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Year</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentYear}
                            onChange={(e) => handleDateChange('year', e.target.value)}
                            disabled={isPending}
                        >
                            {YEARS.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-white rounded-md border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={initialStudents.length > 0 && selectedIds.length === initialStudents.length}
                                />
                            </th>
                            <th className="p-4 font-medium">Student Name</th>
                            <th className="p-4 font-medium">NIS</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialStudents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">No students found</td>
                            </tr>
                        ) : initialStudents.map((student) => (
                            <tr key={student.id} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                        onChange={(e) => handleSelectOne(e.target.checked, student.id)}
                                        checked={selectedIds.includes(student.id)}
                                    />
                                </td>
                                <td className="p-4 font-medium">{student.fullName}</td>
                                <td className="p-4 text-slate-500">{student.nis || '-'}</td>
                                <td className="p-4">
                                    <Badge variant={student.status === 'PAID' ? 'default' : 'destructive'}
                                        className={student.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                                        {student.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {student.status === 'UNPAID' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                onClick={() => handleWhatsApp(student)}
                                                title="Send WhatsApp Reminder"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant={student.status === 'PAID' ? "outline" : "default"}
                                            onClick={() => handleTogglePayment(student.id, student.status)}
                                        >
                                            {student.status === 'PAID' ? "Mark Unpaid" : "Mark Paid"}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
