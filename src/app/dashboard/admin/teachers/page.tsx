import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { deleteTeacher } from './actions'
import { DeleteButton } from '../DeleteButton'

export default async function TeachersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams;
    const query = params?.q || '';

    const teachers = await prisma.teacher.findMany({
        where: {
            name: { contains: query, mode: 'insensitive' }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Data Pengajar (Ustadz/Ustadzah)</h1>
                <Link href="/dashboard/admin/teachers/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pengajar
                </Link>
            </div>

            {/* Search Bar */}
            <form className="flex gap-2 max-w-md">
                <Input name="q" placeholder="Cari nama pengajar..." defaultValue={query} className="bg-background" />
                <Button type="submit" variant="secondary">Cari</Button>
            </form>

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="h-12 px-4 align-middle font-medium">Nama Lengkap</th>
                                <th className="h-12 px-4 align-middle font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => (
                                <tr key={teacher.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{teacher.name}</td>
                                    <td className="p-4 align-middle text-right">
                                        <DeleteButton action={deleteTeacher.bind(null, teacher.id)} />
                                    </td>
                                </tr>
                            ))}
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="p-8 text-center text-muted-foreground">Tidak ada data pengajar ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
