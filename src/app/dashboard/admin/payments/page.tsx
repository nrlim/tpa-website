import { getStudentsWithPaymentStatus } from "./actions"
import PaymentClient from "./PaymentClient"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function AdminPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string; sort?: string; order?: string; status?: string }>
}) {
    const resolvedParams = await searchParams

    const currentDate = new Date()
    const month = resolvedParams.month ? parseInt(resolvedParams.month) : currentDate.getMonth() + 1
    const year = resolvedParams.year ? parseInt(resolvedParams.year) : currentDate.getFullYear()
    const sortBy = resolvedParams.sort || 'name'
    const sortOrder = (resolvedParams.order as 'asc' | 'desc') || 'asc'
    const status = resolvedParams.status || 'ALL'

    const students = await getStudentsWithPaymentStatus(month, year, sortBy, sortOrder, status)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Student Payments</h1>
                </div>
            </div>

            <PaymentClient
                initialStudents={students}
                currentMonth={month}
                currentYear={year}
            />
        </div>
    )
}
