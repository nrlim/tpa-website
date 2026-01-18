import prisma from '@/lib/prisma'
import { DeleteButton } from './DeleteButton'
import { ToggleStatusButton } from './ToggleStatusButton'
import { EditStudentModal } from './EditStudentModal'
import { deleteStudent } from './actions'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

export default async function AdminDashboard({
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
            { parent: { name: { contains: query, mode: 'insensitive' as const } } }
        ]
    } : {};


    const students = await prisma.student.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
            parent: {
                include: {
                    user: true
                }
            }
        }
    })

    const total = await prisma.student.count({ where })
    const pendingCount = await prisma.preUser.count({ where: { status: 'PENDING' } })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Data Santri</h1>
                <div className="flex gap-2 flex-wrap">
                    <Link href="/dashboard/admin/registrations" className={buttonVariants({ variant: pendingCount > 0 ? 'default' : 'outline' })}>
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold text-white bg-red-500 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                        Pendaftaran Menunggu
                    </Link>
                    <Link href="/dashboard/admin/payments" className={buttonVariants({ variant: 'outline' })}>
                        Kelola Pembayaran
                    </Link>
                    <Link href="/dashboard/admin/teachers" className={buttonVariants({ variant: 'outline' })}>
                        Kelola Pengajar
                    </Link>
                    <Link href="/register" className={buttonVariants()}>
                        Tambah Santri
                    </Link>
                </div>
            </div>

            {/* Search Bar */}
            <form className="flex gap-2 max-w-md">
                <Input name="q" placeholder="Cari nama santri atau orang tua..." defaultValue={query} className="bg-background" />
                <Button type="submit" variant="secondary">Cari</Button>
            </form>

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left caption-bottom">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="h-12 px-4 align-middle font-medium">NIS</th>
                                <th className="h-12 px-4 align-middle font-medium">Nama Santri</th>
                                <th className="h-12 px-4 align-middle font-medium">Orang Tua</th>
                                <th className="h-12 px-4 align-middle font-medium">Umur</th>
                                <th className="h-12 px-4 align-middle font-medium">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">
                                        {s.nis ? (
                                            <span className="font-mono text-xs font-semibold text-muted-foreground">{s.nis}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Belum ada</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle font-medium">{s.fullName}</td>
                                    <td className="p-4 align-middle">{s.parent.name}</td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {calculateAge(s.dateOfBirth)} tahun
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.parent.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.parent.user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <ToggleStatusButton studentId={s.id} isActive={s.parent.user.isActive} />
                                            <EditStudentModal student={s} />
                                            <DeleteButton action={deleteStudent.bind(null, s.id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada data santri ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-sm text-muted-foreground mr-4">
                    Halaman {page} dari {Math.ceil(total / pageSize) || 1}
                </div>
                {page > 1 ? (
                    <Link href={`?page=${page - 1}&q=${query}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Sebelumnya
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
                )}

                {(page * pageSize) < total ? (
                    <Link href={`?page=${page + 1}&q=${query}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Selanjutnya
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled>Selanjutnya</Button>
                )}
            </div>
        </div>
    )
}
