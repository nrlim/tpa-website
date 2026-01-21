'use client'

import { Button } from '@/components/ui/button'
import { FileDown, Loader2, Printer } from 'lucide-react'
import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useToast } from "@/context/ToastContext"

interface StudentPayment {
    id: string
    fullName: string
    nis: string | null
    status: string // "PAID" | "UNPAID"
    paymentId?: string
    phoneNumber: string
    transferProofUrl?: string | null
}

interface PaymentReportButtonProps {
    students: StudentPayment[]
    month: number
    year: number
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

export function PaymentReportButton({ students, month, year }: PaymentReportButtonProps) {
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()

    const generateDoc = async () => {
        if (!students || students.length === 0) {
            showToast('Tidak ada data pembayaran untuk dicetak.', 'info')
            return null
        }

        const doc = new jsPDF()

        // Elegant Minimalist Palette
        const colorPrimary: [number, number, number] = [33, 33, 33]       // Near Black
        const colorSecondary: [number, number, number] = [97, 97, 97]     // Dark Gray
        const colorMuted: [number, number, number] = [158, 158, 158]      // Medium Gray
        const colorBorder: [number, number, number] = [224, 224, 224]     // Light Gray
        const colorAccent: [number, number, number] = [66, 66, 66]        // Charcoal

        const monthName = MONTHS[month - 1] || 'Unknown'
        const periodText = `${monthName} ${year}`
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
                    // console.warn('Logo not loaded, continuing without logo')
                    resolve()
                }
                img.src = logoUrl
            })
        } catch (error) {
            // console.warn('Error loading logo:', error)
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
        const totalStudents = students.length
        const totalPaid = students.filter(s => s.status === 'PAID').length
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
        const tableData = students.map((s, index) => [
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
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 15

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

        return doc
    }

    const handleDownload = async () => {
        setLoading(true)
        try {
            const doc = await generateDoc()
            if (doc) {
                const monthName = MONTHS[month - 1] || 'Unknown'
                doc.save(`Laporan_SPP_${monthName}_${year}.pdf`)
            }
        } catch (error) {
            console.error('Error generating report:', error)
            showToast('Gagal membuat laporan.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = async () => {
        setLoading(true)
        try {
            const doc = await generateDoc()
            if (doc) {
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
                            // Ignore
                        }
                    }, 60000)
                }
            }
        } catch (error) {
            console.error('Error printing report:', error)
            showToast('Gagal mencetak laporan.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                onClick={handlePrint}
                disabled={loading}
                variant="secondary"
                size="sm"
            >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Printer className="mr-2 h-4 w-4" />
                )}
                Cetak
            </Button>
            <Button
                variant="outline"
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center gap-2"
                size="sm"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FileDown className="h-4 w-4" />
                )}
                Download Report
            </Button>
        </div>
    )
}
