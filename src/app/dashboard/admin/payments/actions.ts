'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getStudentsWithPaymentStatus(
    month: number,
    year: number,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
    filterStatus?: string
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

        let mappedStudents = students.map(student => ({
            id: student.id,
            fullName: student.fullName,
            nis: student.nis,
            status: student.payments[0]?.status || 'UNPAID',
            paymentId: student.payments[0]?.id,
            phoneNumber: student.parent.phoneNumber,
            transferProofUrl: student.payments[0]?.transferProofUrl
        }))

        // Filter by status if provided
        if (filterStatus && filterStatus !== 'ALL') {
            mappedStudents = mappedStudents.filter(s => s.status === filterStatus)
        }

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
        // console.error("Error fetching students with payment status")
        throw new Error("Failed to fetch payment status")
    }
}

async function deleteProofFile(studentId: string, month: number, year: number) {
    try {
        const payment = await prisma.payment.findUnique({
            where: {
                studentId_month_year: {
                    studentId,
                    month,
                    year
                }
            }
        })

        if (payment?.transferProofUrl) {
            // Extract filename from URL
            const bucketPart = '/tpa-bucket/'
            const url = payment.transferProofUrl
            const index = url.indexOf(bucketPart)

            if (index !== -1) {
                const filename = url.substring(index + bucketPart.length)

                // Use Admin Client to delete file (Bypassing RLS)
                const adminSupabase = createAdminClient()
                const { error } = await adminSupabase.storage
                    .from('tpa-bucket')
                    .remove([filename])

                if (error) {
                    // console.error("Error deleting from Supabase:", error)
                }
            }
        }
    } catch (error) {
        // console.error("Error processing delete proof:", error)
    }
}

export async function markPayment(studentId: string, month: number, year: number, status: string) {
    try {
        if (status === 'PAID') {
            await deleteProofFile(studentId, month, year)
        }

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
                paidAt: status === 'PAID' ? new Date() : null,
                transferProofUrl: null // No proof needed if paid manually or cleared
            },
            update: {
                status,
                paidAt: status === 'PAID' ? new Date() : null,
                transferProofUrl: status === 'PAID' ? null : undefined
            }
        })

        revalidatePath('/dashboard/admin/payments')
        revalidatePath('/dashboard/parent')
        return { success: true }
    } catch (error) {
        // console.error("Error updating payment")
        return { success: false, error: "Failed to update payment" }
    }
}

export async function markBulkPayment(studentIds: string[], month: number, year: number, status: string) {
    try {
        if (status === 'PAID') {
            await Promise.all(studentIds.map(id => deleteProofFile(id, month, year)))
        }

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
                        paidAt: status === 'PAID' ? new Date() : null,
                        transferProofUrl: null
                    },
                    update: {
                        status,
                        paidAt: status === 'PAID' ? new Date() : null,
                        transferProofUrl: status === 'PAID' ? null : undefined
                    }
                })
            )
        )

        revalidatePath('/dashboard/admin/payments')
        revalidatePath('/dashboard/parent')
        return { success: true }
    } catch (error) {
        // console.error("Error updating bulk payments")
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
        // console.error("Error fetching student payments")
        return []
    }
}
