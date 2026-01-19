import prisma from '@/lib/prisma'
import { DeleteButton } from './DeleteButton'
import { ToggleStatusButton } from './ToggleStatusButton'
import { EditStudentModal } from './EditStudentModal'
import { deleteStudent } from './actions'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Prisma, StudentType } from '@prisma/client'

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
    searchParams: Promise<{ page?: string; q?: string, classId?: string, studentType?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const query = params?.q || '';
    const classId = params?.classId ? Number(params.classId) : undefined;
    const studentType = params?.studentType as StudentType | undefined;
    const pageSize = 10;

    const where: Prisma.StudentWhereInput = {
        AND: [
            query ? {
                OR: [
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { parent: { name: { contains: query, mode: 'insensitive' } } }
                ]
            } : {},
            classId ? { classId: classId } : {},
            studentType ? { studentType: studentType } : {}
        ]
    };

    const [students, classes, total, pendingCount] = await Promise.all([
        prisma.student.findMany({
            where,
            take: pageSize,
            skip: (page - 1) * pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                parent: {
                    include: {
                        user: true
                    }
                },
                class: true
            }
        }),
        prisma.masterClass.findMany({
            orderBy: { name: 'asc' }
        }),
        prisma.student.count({ where }),
        prisma.preUser.count({ where: { status: 'PENDING' } })
    ]);

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
                    <Link href="/dashboard/admin/classes" className={buttonVariants({ variant: 'outline' })}>
                        Kelola Kelas
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

            {/* Search Bar & Filter */}
            <form className="flex flex-col sm:flex-row gap-2 w-full max-w-4xl">
                <div className="flex-1 min-w-[300px]">
                    <Input name="q" placeholder="Cari nama santri atau orang tua..." defaultValue={query} className="bg-background w-full" />
                </div>
                <div className="flex gap-2 shrink-0">
                    <select
                        name="classId"
                        defaultValue={classId?.toString() || ""}
                        className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        name="studentType"
                        defaultValue={studentType || ""}
                        className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[150px]"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="INTERNAL">Internal</option>
                        <option value="EXTERNAL">External</option>
                    </select>

                    <Button type="submit" variant="secondary">Filter</Button>
                </div>
            </form>

            <div className="flex justify-end">
                <p className="text-sm text-muted-foreground">
                    Total Santri: <span className="font-medium text-foreground">{total}</span>
                </p>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-left caption-bottom">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="h-12 px-4 align-middle font-medium">NIS</th>
                                <th className="h-12 px-4 align-middle font-medium">Nama Santri</th>
                                <th className="h-12 px-4 align-middle font-medium">Kelas</th>
                                <th className="h-12 px-4 align-middle font-medium">Orang Tua</th>
                                <th className="h-12 px-4 align-middle font-medium">Umur</th>
                                <th className="h-12 px-4 align-middle font-medium">Tipe</th>
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
                                    <td className="p-4 align-middle">
                                        {s.class ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                {s.class.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">{s.parent.name}</td>
                                    <td className="p-4 align-middle">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {calculateAge(s.dateOfBirth)} tahun
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.studentType === 'EXTERNAL' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {s.studentType || 'INTERNAL'}
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
                                            <EditStudentModal student={s} classes={classes} />
                                            <DeleteButton action={deleteStudent.bind(null, s.id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada data santri ditemukan.</td>
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
                    <Link href={`?page=${page - 1}&q=${query}&classId=${classId || ''}&studentType=${studentType || ''}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Sebelumnya
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
                )}

                {(page * pageSize) < total ? (
                    <Link href={`?page=${page + 1}&q=${query}&classId=${classId || ''}&studentType=${studentType || ''}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Selanjutnya
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled>Selanjutnya</Button>
                )}
            </div>
        </div>
    )
}
