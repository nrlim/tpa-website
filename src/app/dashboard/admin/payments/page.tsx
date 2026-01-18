import { getStudentsWithPaymentStatus } from "./actions"
import PaymentClient from "./PaymentClient"

export default async function AdminPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string }>
}) {
    const resolvedParams = await searchParams

    const currentDate = new Date()
    const month = resolvedParams.month ? parseInt(resolvedParams.month) : currentDate.getMonth() + 1
    const year = resolvedParams.year ? parseInt(resolvedParams.year) : currentDate.getFullYear()

    const students = await getStudentsWithPaymentStatus(month, year)

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Student Payments</h1>
            </div>

            <PaymentClient
                initialStudents={students}
                currentMonth={month}
                currentYear={year}
            />
        </div>
    )
}
