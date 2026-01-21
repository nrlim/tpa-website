'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { uploadTransferProof } from '@/app/dashboard/parent/actions'
import Compressor from 'compressorjs'
import { Upload, Loader2, CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2'

interface TransferProofUploadProps {
    studentId: string
    month: number
    year: number
    existingProofUrl?: string | null
}

export function TransferProofUpload({ studentId, month, year, existingProofUrl }: TransferProofUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Ukuran Terlalu Besar',
                text: 'Ukuran file maksimal 10MB.',
            })
            return
        }

        setIsUploading(true)

        new Compressor(file, {
            quality: 0.6,
            maxWidth: 1200,
            maxHeight: 1200,
            success(result) {
                const fileResult = result as File
                const formData = new FormData()
                formData.append('file', fileResult, fileResult.name)
                formData.append('studentId', studentId)
                formData.append('month', month.toString())
                formData.append('year', year.toString())

                uploadTransferProof(formData)
                    .then((res) => {
                        if (res.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: 'Bukti transfer berhasil diupload.',
                                timer: 2000,
                                showConfirmButton: false
                            })
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal Upload',
                                text: res.error || 'Terjadi kesalahan.',
                            })
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Terjadi kesalahan saat upload.',
                        })
                    })
                    .finally(() => {
                        setIsUploading(false)
                        // Reset input value to allow re-uploading same file if needed
                        e.target.value = ''
                    })
            },
            error(err) {
                console.error(err.message)
                setIsUploading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Gagal memproses gambar.',
                })
            },
        })
    }

    return (
        <div className="flex flex-col gap-2 items-start">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`upload-${studentId}-${month}-${year}`}
                onChange={handleFileChange}
                disabled={isUploading}
            />

            {existingProofUrl ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Bukti Terkirim</span>
                    <label htmlFor={`upload-${studentId}-${month}-${year}`} className="text-xs underline cursor-pointer ml-2 hover:text-green-800">
                        Ganti
                    </label>
                </div>
            ) : (
                <label htmlFor={`upload-${studentId}-${month}-${year}`}>
                    <div className={`
                        inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                        bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer
                        ${isUploading ? 'opacity-70' : ''}
                    `}>
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Mengompres & Upload...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Bukti Transfer
                            </>
                        )}
                    </div>
                </label>
            )}

            <p className="text-[10px] text-muted-foreground">
                *Upload foto bukti transfer (struk ATM/Mobile Banking). Gambar akan otomatis dikompres.
            </p>
        </div>
    )
}
