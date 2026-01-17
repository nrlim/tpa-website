import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function TeacherDashboard({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const query = params?.q || '';
    const pageSize = 10;

    const where = query ? {
        OR: [
            { fullName: { contains: query, mode: 'insensitive' as const } },
            { parentName: { contains: query, mode: 'insensitive' as const } }
        ]
    } : {};

    const students = await prisma.student.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { fullName: 'asc' }
    })

    const total = await prisma.student.count({ where })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Daftar Santri</h1>
            </div>

            {/* Search Bar */}
            <form className="flex gap-2 max-w-md">
                <Input name="q" placeholder="Cari nama santri..." defaultValue={query} className="bg-background" />
                <Button type="submit" variant="secondary">Cari</Button>
            </form>

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left caption-bottom">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="h-12 px-4 align-middle font-medium">Nama Lengkap</th>
                                <th className="h-12 px-4 align-middle font-medium">Orang Tua</th>
                                <th className="h-12 px-4 align-middle font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{s.fullName}</td>
                                    <td className="p-4 align-middle">{s.parentName}</td>
                                    <td className="p-4 align-middle text-right">
                                        <Link href={`/dashboard/teacher/student/${s.id}`} className={buttonVariants({ size: 'sm', variant: 'default' })}>
                                            Input Nilai
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-muted-foreground">Tidak ada data santri.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                {/* ... reuse pagination logic ... */}
                {page > 1 && <Link href={`?page=${page - 1}&q=${query}`}><Button variant="outline" size="sm">Prev</Button></Link>}
                {(page * pageSize) < total && <Link href={`?page=${page + 1}&q=${query}`}><Button variant="outline" size="sm">Next</Button></Link>}
            </div>
        </div>
    )
}
