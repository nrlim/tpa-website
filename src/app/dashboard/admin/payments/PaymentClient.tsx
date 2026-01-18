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

    const generatePDF = () => {
        const doc = new jsPDF()

        const monthName = MONTHS[currentMonth - 1]

        doc.setFontSize(18)
        doc.text("TPA Nurul Iman - Payment Report", 14, 22)

        doc.setFontSize(12)
        doc.text(`Period: ${monthName} ${currentYear}`, 14, 32)

        const tableData = initialStudents.map((s, index) => [
            index + 1,
            s.fullName,
            s.nis || '-',
            s.status
        ])

        autoTable(doc, {
            head: [['No', 'Student Name', 'NIS', 'Status']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 163, 74] }, // Greenish
        })

        doc.save(`Payment_Report_${monthName}_${currentYear}.pdf`)
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
                            <th className="p-4 font-medium">Action</th>
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
                                <td className="p-4">
                                    <Button
                                        size="sm"
                                        variant={student.status === 'PAID' ? "outline" : "default"}
                                        onClick={() => handleTogglePayment(student.id, student.status)}
                                    >
                                        {student.status === 'PAID' ? "Mark Unpaid" : "Mark Paid"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
