'use client'

import { Button } from '@/components/ui/button'
import { FileDown, Loader2, Printer } from 'lucide-react'
import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getAllStudentsForReport } from './actions'
import { useToast } from "@/context/ToastContext"

interface StudentReportButtonProps {
    dateStr?: string // optional date string to show when report was generated
    filters: {
        page?: string
        q?: string
        classId?: string
        studentType?: string
    }
}

function calculateAge(dateOfBirth: Date | string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

export function StudentReportButton({ filters }: StudentReportButtonProps) {
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()

    const generateDoc = async () => {
        const students = await getAllStudentsForReport(filters)

        if (!students || students.length === 0) {
            showToast('Tidak ada data santri untuk dicetak.', 'info')
            return null
        }

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        })


        // Load logo
        const logoUrl = '/logo.png'
        const logoImg = new Image()
        logoImg.src = logoUrl
        await new Promise((resolve) => {
            logoImg.onload = resolve
            logoImg.onerror = resolve
        })

        // Header
        if (logoImg.complete && logoImg.naturalHeight !== 0) {
            doc.addImage(logoImg, 'PNG', 14, 10, 22, 22)
        }

        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text('DATA SANTRI', 42, 20)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.text('Taman Pendidikan Al-Qur\'an Nurul Iman', 42, 27)

        const dateStr = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        doc.setFontSize(10)
        doc.text(`Tanggal Cetak: ${dateStr}`, 280, 20, { align: 'right' })

        // Add filter info if any
        let filterText = 'Filter: '
        const parts = []
        if (filters.q) parts.push(`Pencarian: "${filters.q}"`)
        if (filters.studentType) parts.push(`Tipe: ${filters.studentType}`)

        if (parts.length > 0) {
            filterText += parts.join(', ')
            doc.setFontSize(9)
            doc.setTextColor(100)
            doc.text(filterText, 14, 45)
        }

        const tableColumn = [
            'No',
            'NIS',
            'Nama Santri',
            'Kelas',
            'Orang Tua',
            'Umur',
            'Tipe',
            'Status'
        ]

        const tableRows = students.map((s, index) => [
            index + 1,
            s.nis || '-',
            s.fullName,
            s.class?.name || '-',
            s.parent.name,
            `${calculateAge(s.dateOfBirth)} tahun`,
            s.studentType || 'INTERNAL',
            s.parent.user.isActive ? 'Active' : 'Inactive'
        ])

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' }, // No
                1: { cellWidth: 25 }, // NIS
                2: { cellWidth: 'auto' }, // Nama
                3: { cellWidth: 25 }, // Kelas
                4: { cellWidth: 'auto' }, // Orang Tua
                5: { cellWidth: 20, halign: 'center' }, // Umur
                6: { cellWidth: 25, halign: 'center' }, // Tipe
                7: { cellWidth: 20, halign: 'center' }  // Status
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        })

        return doc
    }

    const handleDownload = async () => {
        setLoading(true)
        try {
            const doc = await generateDoc()
            if (doc) {
                doc.save(`Data-Santri-${new Date().toISOString().split('T')[0]}.pdf`)
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
            >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Printer className="mr-2 h-4 w-4" />
                )}
                Cetak
            </Button>
            <Button
                onClick={handleDownload}
                disabled={loading}
                variant="outline"
            >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                )}
                Unduh PDF
            </Button>
        </div>
    )
}
