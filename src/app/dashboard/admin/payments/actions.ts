'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getStudentsWithPaymentStatus(
    month: number,
    year: number,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
) {
    try {
        const students = await prisma.student.findMany({
            include: {
                parent: true,
                payments: {
                    where: {
                        month: month,
                        year: year
                    }
                }
            },
            orderBy: {
                fullName: 'asc'
            }
        })

        const mappedStudents = students.map(student => ({
            id: student.id,
            fullName: student.fullName,
            nis: student.nis,
            status: student.payments[0]?.status || 'UNPAID',
            paymentId: student.payments[0]?.id,
            phoneNumber: student.parent.phoneNumber
        }))

        return mappedStudents.sort((a, b) => {
            let valA = ''
            let valB = ''

            if (sortBy === 'name') {
                valA = a.fullName.toLowerCase()
                valB = b.fullName.toLowerCase()
            } else if (sortBy === 'nis') {
                valA = (a.nis || '').toLowerCase()
                valB = (b.nis || '').toLowerCase()
            } else if (sortBy === 'status') {
                valA = a.status
                valB = b.status
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1
            return 0
        })
    } catch (error) {
        console.error("Error fetching students with payment status")
        throw new Error("Failed to fetch payment status")
    }
}

export async function markPayment(studentId: string, month: number, year: number, status: string) {
    try {
        await prisma.payment.upsert({
            where: {
                studentId_month_year: {
                    studentId,
                    month,
                    year
                }
            },
            create: {
                studentId,
                month,
                year,
                status,
                paidAt: status === 'PAID' ? new Date() : null
            },
            update: {
                status,
                paidAt: status === 'PAID' ? new Date() : null
            }
        })

        revalidatePath('/dashboard/admin/payments')
        revalidatePath('/dashboard/parent')
        return { success: true }
    } catch (error) {
        console.error("Error updating payment")
        return { success: false, error: "Failed to update payment" }
    }
}

export async function markBulkPayment(studentIds: string[], month: number, year: number, status: string) {
    try {
        // Use a transaction or Promise.all. Promise.all is sufficient here.
        await prisma.$transaction(
            studentIds.map(studentId =>
                prisma.payment.upsert({
                    where: {
                        studentId_month_year: {
                            studentId,
                            month,
                            year
                        }
                    },
                    create: {
                        studentId,
                        month,
                        year,
                        status,
                        paidAt: status === 'PAID' ? new Date() : null
                    },
                    update: {
                        status,
                        paidAt: status === 'PAID' ? new Date() : null
                    }
                })
            )
        )

        revalidatePath('/dashboard/admin/payments')
        revalidatePath('/dashboard/parent')
        return { success: true }
    } catch (error) {
        console.error("Error updating bulk payments")
        return { success: false, error: "Failed to update bulk payments" }
    }
}

export async function getStudentPayments(studentId: string) {
    try {
        return await prisma.payment.findMany({
            where: {
                studentId
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        })
    } catch (error) {
        console.error("Error fetching student payments")
        return []
    }
}
