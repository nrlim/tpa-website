'use server'

import { revalidatePath } from "next/cache"
import path from "path"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function uploadTransferProof(formData: FormData) {
    try {
        const file = formData.get("file") as File
        const studentId = formData.get("studentId") as string
        const month = parseInt(formData.get("month") as string)
        const year = parseInt(formData.get("year") as string)

        if (!file || !studentId || !month || !year) {
            return { success: false, error: "Missing required fields" }
        }

        const supabase = await createClient()

        // Check if there is an existing payment with a proof URL
        const existingPayment = await prisma.payment.findUnique({
            where: {
                studentId_month_year: {
                    studentId,
                    month,
                    year
                }
            }
        })

        if (existingPayment?.transferProofUrl) {
            try {
                // Extract filename from the URL
                const bucketPart = '/tpa-bucket/'
                const url = existingPayment.transferProofUrl
                const index = url.indexOf(bucketPart)

                if (index !== -1) {
                    const oldFilename = url.substring(index + bucketPart.length)

                    // Use Admin Client to delete file (Bypassing RLS)
                    const adminSupabase = createAdminClient()
                    const { error: deleteError } = await adminSupabase.storage
                        .from('tpa-bucket')
                        .remove([oldFilename])

                    if (deleteError) {
                        // console.error("Failed to delete old proof:", deleteError)
                    }
                }
            } catch (err) {
                // console.error("Error attempting to delete old proof:", err)
            }
        }

        // Generate filename: proof-{studentId}-{month}-{year}-{timestamp}.jpg
        const ext = path.extname(file.name) || ".jpg"
        const timestamp = Date.now()
        const filename = `proof-${studentId}-${month}-${year}-${timestamp}${ext}`

        // Upload to Supabase Storage 'tpa-bucket' bucket
        const { error: uploadError } = await supabase.storage
            .from('tpa-bucket')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            // console.error("Supabase upload error:", uploadError)
            return { success: false, error: "Failed to upload to storage" }
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('tpa-bucket')
            .getPublicUrl(filename)

        // Update Payment record
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
                status: "UNPAID",
                transferProofUrl: publicUrl
            },
            update: {
                transferProofUrl: publicUrl,
            }
        })

        revalidatePath(`/dashboard/parent/${studentId}`)
        revalidatePath(`/dashboard/admin/payments`)

        return { success: true }
    } catch (error) {
        // console.error("Upload error:", error)
        return { success: false, error: "Failed to upload proof" }
    }
}
