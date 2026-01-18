'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getStudentsWithPaymentStatus(month: number, year: number) {
    try {
        const students = await prisma.student.findMany({
            include: {
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

        return students.map(student => ({
            ...student,
            status: student.payments[0]?.status || 'UNPAID',
            paymentId: student.payments[0]?.id,
            phoneNumber: student.phoneNumber
        }))
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
        revalidatePath('/dashboard/student')
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
        revalidatePath('/dashboard/student')
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
