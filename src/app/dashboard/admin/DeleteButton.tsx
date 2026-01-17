'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface DeleteButtonProps {
    action: () => Promise<{ error?: string; success?: boolean }>
}

export function DeleteButton({ action }: DeleteButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const { showToast } = useToast()

    const handleConfirm = async () => {
        setIsPending(true)
        try {
            const result = await action()
            if (result?.error) {
                showToast(result.error, 'error')
            } else {
                showToast('Data berhasil dihapus', 'success')
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat menghapus data', 'error')
        } finally {
            setIsPending(false)
            setIsOpen(false)
        }
    }

    return (
        <>
            <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => setIsOpen(true)}
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>

            <ConfirmDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirm}
                title="Hapus Data?"
                description="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
                isLoading={isPending}
            />
        </>
    )
}
