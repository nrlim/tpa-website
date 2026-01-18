'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toggleUserStatus } from './actions'

interface ToggleStatusButtonProps {
    studentId: string
    isActive: boolean
}

export function ToggleStatusButton({ studentId, isActive }: ToggleStatusButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await toggleUserStatus(studentId, !isActive)
            if (result.error) {
                alert(result.error)
            }
            setIsOpen(false)
        })
    }

    return (
        <>
            <Button
                variant={isActive ? "outline" : "default"}
                size="sm"
                onClick={() => setIsOpen(true)}
                disabled={isPending}
                className={isActive ? "text-yellow-600 border-yellow-600 hover:bg-yellow-50" : "bg-green-600 hover:bg-green-700"}
            >
                {isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>

            <ConfirmDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirm}
                title={isActive ? "Nonaktifkan Akun?" : "Aktifkan Akun?"}
                description={isActive
                    ? "Apakah Anda yakin ingin menonaktifkan akun ini? Pengguna tidak akan bisa login kembali."
                    : "Apakah Anda yakin ingin mengaktifkan akun ini kembali?"}
                isLoading={isPending}
                confirmConfig={isActive ? {
                    label: 'Ya, Nonaktifkan',
                    variant: 'destructive',
                    icon: 'warning'
                } : {
                    label: 'Ya, Aktifkan',
                    variant: 'default',
                    icon: 'info'
                }}
            />
        </>
    )
}
