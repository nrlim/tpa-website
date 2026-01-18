'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStudent } from './actions'
import { Pencil, X } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { useToast } from '@/context/ToastContext'

type StudentWithParent = {
    id: string
    nis?: string | null
    fullName: string
    dateOfBirth: Date
    parent: {
        name: string
        phoneNumber: string
        address: string
    }
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
    )
}

export function EditStudentModal({ student }: { student: StudentWithParent }) {
    const [isOpen, setIsOpen] = useState(false)
    const { showToast } = useToast()

    // Format date for input: YYYY-MM-DD
    const formattedDate = new Date(student.dateOfBirth).toISOString().split('T')[0]

    async function handleAction(formData: FormData) {
        const res = await updateStudent(null, formData)

        if (res?.error) {
            showToast(res.error, 'error')
        } else if (res?.success) {
            showToast('Data santri berhasil diperbarui!', 'success')
            setIsOpen(false)
        }
    }

    if (!isOpen) {
        return (
            <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
                <Pencil className="h-4 w-4" />
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Edit Data Santri</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form action={handleAction} className="space-y-4">
                    <input type="hidden" name="id" value={student.id} />

                    {/* NIS - Read Only */}
                    {student.nis && (
                        <div className="space-y-2">
                            <Label htmlFor="nis">NIS (Nomor Induk Siswa)</Label>
                            <Input id="nis" value={student.nis} disabled className="font-mono bg-muted" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nama Lengkap Santri</Label>
                        <Input id="fullName" name="fullName" defaultValue={student.fullName} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                            <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={formattedDate} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentName">Nama Orang Tua</Label>
                            <Input id="parentName" name="parentName" defaultValue={student.parent.name} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
                        <Input id="phoneNumber" name="phoneNumber" defaultValue={student.parent.phoneNumber} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Input id="address" name="address" defaultValue={student.parent.address} required />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Batal
                        </Button>
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    )
}
