'use client'

import { useActionState } from 'react'
import { addScore } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ScoreForm({ studentId }: { studentId: string }) {
    const [state, action, isPending] = useActionState(addScore, null)

    return (
        <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Input Nilai Baru</h3>
            <form action={action} className="space-y-4">
                <input type="hidden" name="studentId" value={studentId} />

                {state?.error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
                        {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="p-3 bg-green-100 text-green-800 text-sm rounded">
                        {state.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="reading">Bacaan (Iqro/Qur&apos;an)</Label>
                        <Input id="reading" name="reading" type="number" min="0" max="100" required placeholder="0-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="memorization">Hafalan (Tahfidz)</Label>
                        <Input id="memorization" name="memorization" type="number" min="0" max="100" required placeholder="0-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discipline">Kedisiplinan</Label>
                        <Input id="discipline" name="discipline" type="number" min="0" max="100" required placeholder="0-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="attendance">Kehadiran</Label>
                        <Input id="attendance" name="attendance" type="number" min="0" max="100" required placeholder="0-100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="behavior">Akhlak / Perilaku</Label>
                        <Input id="behavior" name="behavior" type="number" min="0" max="100" required placeholder="0-100" />
                    </div>
                </div>

                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? 'Menyimpan...' : 'Simpan Nilai'}
                </Button>
            </form>
        </div>
    )
}
