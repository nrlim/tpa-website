import prisma from '@/lib/prisma'
import { AddClassModal } from './AddClassModal'
import { DeleteButton } from '../DeleteButton'
import { deleteClass } from './actions'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default async function ClassesPage() {
    const classes = await prisma.masterClass.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { students: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Kelas</h1>
                    <p className="text-muted-foreground">Atur daftar kelas untuk santri</p>
                </div>
                <AddClassModal />
            </div>

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <table className="w-full text-sm text-left caption-bottom">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                            <th className="h-12 px-4 align-middle font-medium">Nama Kelas</th>
                            <th className="h-12 px-4 align-middle font-medium">Deskripsi</th>
                            <th className="h-12 px-4 align-middle font-medium">Jumlah Santri</th>
                            <th className="h-12 px-4 align-middle font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada data kelas.</td>
                            </tr>
                        ) : (
                            classes.map((c) => (
                                <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{c.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{c.description || '-'}</td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {c._count.students} Santri
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <DeleteButton action={deleteClass.bind(null, c.id)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
