'use client'

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { markPayment, markBulkPayment } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { PaymentReportButton } from "./PaymentReportButton"
import { useToast } from "@/context/ToastContext"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Extend jsPDF interface if needed, or simply force cast to any
// Usually autoTable adds itself to prototype.

interface StudentPayment {
    id: string
    fullName: string
    nis: string | null
    status: string // "PAID" | "UNPAID"
    paymentId?: string
    phoneNumber: string
    transferProofUrl?: string | null
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
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkPending, setIsBulkPending] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const { showToast } = useToast()

    const currentSort = searchParams.get('sort') || 'name'
    const currentOrder = searchParams.get('order') || 'asc'
    const currentStatus = searchParams.get('status') || 'ALL'

    const handleSort = (column: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (currentSort === column && currentOrder === 'asc') {
            params.set('order', 'desc')
        } else {
            params.set('sort', column)
            params.set('order', 'asc')
        }
        startTransition(() => {
            router.push(`?${params.toString()}`)
        })
    }

    const SortIcon = ({ column }: { column: string }) => {
        if (currentSort !== column) return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />
        return currentOrder === 'asc'
            ? <ArrowUp className="w-4 h-4 ml-1 text-primary" />
            : <ArrowDown className="w-4 h-4 ml-1 text-primary" />
    }

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
            showToast(`Payment marked as ${newStatus}`, 'success')
        } catch (error) {
            showToast("Failed to update payment", 'error')
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

    const handleBulkPayClick = () => {
        if (selectedIds.length === 0) return
        setIsConfirmOpen(true)
    }

    const onConfirmBulkPay = async () => {
        setIsBulkPending(true)
        try {
            await markBulkPayment(selectedIds, currentMonth, currentYear, 'PAID')
            setSelectedIds([])
            showToast(`Successfully marked ${selectedIds.length} payments as PAID`, 'success')
        } catch (error) {
            showToast("Failed to update payments", 'error')
        } finally {
            setIsBulkPending(false)
            setIsConfirmOpen(false)
        }
    }



    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Manage Payments</CardTitle>
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                onClick={handleBulkPayClick}
                                disabled={isBulkPending}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isBulkPending ? 'Processing...' : `Mark ${selectedIds.length} as PAID`}
                            </Button>
                        )}
                        <PaymentReportButton
                            students={initialStudents}
                            month={currentMonth}
                            year={currentYear}
                        />
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Status Limit</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentStatus}
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.set('status', e.target.value)
                                startTransition(() => router.push(`?${params.toString()}`))
                            }}
                            disabled={isPending}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentSort}
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.set('sort', e.target.value)
                                params.set('order', 'asc') // Reset to asc on column change
                                startTransition(() => router.push(`?${params.toString()}`))
                            }}
                            disabled={isPending}
                        >
                            <option value="name">Name</option>
                            <option value="nis">NIS</option>
                            <option value="status">Status</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Order</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentOrder}
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.set('order', e.target.value)
                                startTransition(() => router.push(`?${params.toString()}`))
                            }}
                            disabled={isPending}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </CardContent>
            </Card >

            <div className="bg-white rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
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
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">
                                        Student Name <SortIcon column="name" />
                                    </div>
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('nis')}>
                                    <div className="flex items-center">
                                        NIS <SortIcon column="nis" />
                                    </div>
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                                    <div className="flex items-center">
                                        Status <SortIcon column="status" />
                                    </div>
                                </th>
                                <th className="p-4 font-medium">Proof</th>
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
                                    <td className="p-4">
                                        {student.transferProofUrl && (
                                            <a
                                                href={student.transferProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline border border-blue-200 bg-blue-50 px-2 py-1 rounded"
                                            >
                                                View Proof
                                            </a>
                                        )}
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
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={onConfirmBulkPay}
                title="Konfirmasi Pembayaran Massal"
                description={`Apakah Anda yakin ingin menandai ${selectedIds.length} santri sebagai LUNAS? Tindakan ini tidak dapat dibatalkan.`}
                isLoading={isBulkPending}
                confirmConfig={{
                    label: "Ya, Tandai Lunas",
                    variant: "default"
                }}
            />
        </div >
    )
}
