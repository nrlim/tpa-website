'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    isLoading?: boolean
    confirmConfig?: {
        label: string
        variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
        icon?: string
    }
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading,
    confirmConfig
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg animate-in zoom-in duration-200">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`rounded-full p-3 ${confirmConfig?.variant === 'default' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                        <AlertCircle className={`h-8 w-8 ${confirmConfig?.variant === 'default' ? 'text-primary' : 'text-destructive'}`} />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-2">{title}</h2>

                {/* Description */}
                <p className="text-sm text-muted-foreground text-center mb-6">
                    {description}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        variant={confirmConfig?.variant || "destructive"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Memproses...' : (confirmConfig?.label || 'Ya, Hapus')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
