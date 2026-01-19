'use client'

import { useState } from 'react'
import { PreUser } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { approveRegistration, rejectRegistration } from './actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    UserPlus,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react'

interface Props {
    registration: PreUser
}

export function PendingRegistrationCard({ registration }: Props) {
    const router = useRouter()
    const { showToast } = useToast()
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [studentType, setStudentType] = useState('INTERNAL')

    const [showApproveDialog, setShowApproveDialog] = useState(false)

    const handleApproveClick = () => {
        setShowApproveDialog(true)
    }

    const confirmApprove = async () => {
        setIsApproving(true)
        try {
            // Get current user ID - we'll need to pass this
            const result = await approveRegistration(registration.id, 'current-admin-id', studentType)

            if (result.success) {
                showToast(result.message || 'Pendaftaran disetujui', 'success')
                // Add delay before refresh to ensure toast is visible and animation starts
                setTimeout(() => {
                    router.refresh()
                }, 2000)
            } else {
                showToast('Error: ' + (result.error || 'Unknown error'), 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat menyetujui pendaftaran', 'error')
            console.error(error)
        } finally {
            setIsApproving(false)
            setShowApproveDialog(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            showToast('Mohon berikan alasan penolakan', 'error')
            return
        }

        setIsRejecting(true)
        try {
            const result = await rejectRegistration(registration.id, 'current-admin-id', rejectReason)

            if (result.success) {
                showToast(result.message || 'Pendaftaran ditolak', 'success')
                setTimeout(() => {
                    router.refresh()
                }, 2000)
            } else {
                showToast('Error: ' + (result.error || 'Unknown error'), 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat menolak pendaftaran', 'error')
            console.error(error)
        } finally {
            setIsRejecting(false)
            setShowRejectDialog(false)
            setRejectReason('')
        }
    }

    const isExistingParent = !!registration.existingParentId

    return (
        <>
            <ConfirmDialog
                isOpen={showApproveDialog}
                onClose={() => setShowApproveDialog(false)}
                onConfirm={confirmApprove}
                title="Setujui Pendaftaran?"
                description={`Anda akan menyetujui pendaftaran untuk santri ${registration.studentFullName}. ${isExistingParent
                    ? 'Santri akan ditambahkan ke akun orang tua yang sudah ada.'
                    : 'Akun baru akan dibuat untuk orang tua dan email konfirmasi akan dikirim.'
                    }`}
                confirmConfig={{
                    label: "Ya, Setujui",
                    variant: "default"
                }}
                isLoading={isApproving}
            >
                <div className="space-y-2 text-left bg-muted/50 p-4 rounded-lg">
                    <label className="text-sm font-medium">Pilih Tipe Santri</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="studentType"
                                value="INTERNAL"
                                checked={studentType === 'INTERNAL'}
                                onChange={(e) => setStudentType(e.target.value)}
                                className="w-4 h-4 text-primary"
                            />
                            <span>Internal</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="studentType"
                                value="EXTERNAL"
                                checked={studentType === 'EXTERNAL'}
                                onChange={(e) => setStudentType(e.target.value)}
                                className="w-4 h-4 text-primary"
                            />
                            <span>Eksternal</span>
                        </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Santri internal adalah santri yang terdaftar dalam program reguler.
                        Santri eksternal biasanya hanya mengikuti program tertentu.
                    </p>
                </div>
            </ConfirmDialog>

            <div className="bg-card border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                {registration.studentFullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{registration.studentFullName}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isExistingParent ? '📎 Penambahan Santri (Orang Tua Existing)' : '🆕 Pendaftaran Baru'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {registration.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                {new Date(registration.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Parent/Student Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Informasi {isExistingParent ? 'Santri' : 'Orang Tua & Santri'}
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Nama Orang Tua</p>
                                    <p className="font-medium">{registration.parentName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium font-mono text-sm">{registration.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Nomor HP</p>
                                    <p className="font-medium">{registration.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Alamat</p>
                                    <p className="font-medium">{registration.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Data Santri
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Nama Lengkap Santri</p>
                                    <p className="font-medium text-lg">{registration.studentFullName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Tanggal Lahir</p>
                                    <p className="font-medium">
                                        {new Date(registration.dateOfBirth).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {isExistingParent && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Catatan:</strong> Ini adalah permintaan penambahan santri dari orang tua yang sudah terdaftar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {registration.status === 'PENDING' && (
                    <div className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3">
                        {!showRejectDialog ? (
                            <>
                                <Button
                                    onClick={handleApproveClick}
                                    disabled={isApproving}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isApproving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Setujui Pendaftaran
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setShowRejectDialog(true)}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Tolak
                                </Button>
                            </>
                        ) : (
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Alasan Penolakan
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="w-full p-3 border rounded-lg resize-none"
                                        rows={3}
                                        placeholder="Masukkan alasan penolakan..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleReject}
                                        disabled={isRejecting || !rejectReason.trim()}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        {isRejecting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Konfirmasi Penolakan'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowRejectDialog(false)
                                            setRejectReason('')
                                        }}
                                        variant="outline"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
