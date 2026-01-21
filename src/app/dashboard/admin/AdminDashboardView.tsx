'use client'

import { DashboardStats } from './DashboardStats'
import { StudentReportButton } from './StudentReportButton'
import { DeleteButton } from './DeleteButton'
import { ToggleStatusButton } from './ToggleStatusButton'
import { EditStudentModal } from './EditStudentModal'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, CreditCard, Settings, UserPlus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { deleteStudent } from './actions'
import { StudentType } from '@prisma/client'
import { MasterClass } from '@prisma/client'

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

type StudentWithRelations = {
    id: string
    nis: string | null
    fullName: string
    dateOfBirth: Date
    classId: number | null
    studentType: StudentType | null
    class: MasterClass | null
    parent: {
        name: string
        phoneNumber: string
        address: string
        user: {
            isActive: boolean
        }
    }
}

interface AdminDashboardViewProps {
    students: StudentWithRelations[]
    classes: MasterClass[]
    totalStudents: number
    pendingCount: number
    totalTeachers: number
    totalClasses: number
    filteredTotal: number
    page: number
    pageSize: number
    filters: {
        q?: string
        classId?: string
        studentType?: string
    }
}

export function AdminDashboardView({
    students,
    classes,
    totalStudents,
    pendingCount,
    totalTeachers,
    totalClasses,
    filteredTotal,
    page,
    pageSize,
    filters
}: AdminDashboardViewProps) {
    const { q, classId, studentType } = filters

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">
                    Selamat datang di panel administrasi TPA Nurul Iman.
                </p>
            </div>

            {/* Stats Overview */}
            <DashboardStats
                totalStudents={totalStudents}
                pendingCount={pendingCount}
                totalTeachers={totalTeachers}
                totalClasses={totalClasses}
            />

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Link href="/register" className="group">
                    <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Plus className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                Tambah Santri
                            </CardTitle>
                            <CardDescription>Input data santri baru</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/payments" className="group">
                    <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                Kelola Pembayaran
                            </CardTitle>
                            <CardDescription>Cek status SPP & konfirmasi</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/registrations" className="group">
                    <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden">
                        {pendingCount > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulse" />}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserPlus className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                Pendaftaran
                            </CardTitle>
                            <CardDescription>Approval santri baru ({pendingCount})</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/classes" className="group">
                    <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                Kelola Kelas
                            </CardTitle>
                            <CardDescription>Atur rombel & jadwal</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            {/* Main Content: Data Santri */}
            <Card className="border shadow-sm">
                <CardHeader className="border-b bg-muted/20 px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl">Data Santri</CardTitle>
                            <CardDescription>Manajemen data seluruh santri aktif</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/dashboard/admin/teachers" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                                <Settings className="mr-2 h-4 w-4" />
                                Pengajar
                            </Link>
                        </div>
                    </div>

                    {/* Filter Section within Header */}
                    <div className="mt-4 flex flex-col gap-4">
                        <form className="flex flex-col gap-4 w-full">
                            <div className="w-full">
                                <Input name="q" placeholder="Cari nama santri atau orang tua..." defaultValue={q} className="bg-background w-full" />
                            </div>
                            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
                                <select
                                    name="classId"
                                    defaultValue={classId || ""}
                                    className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-[150px]"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                    ))}
                                </select>

                                <select
                                    name="studentType"
                                    defaultValue={studentType || ""}
                                    className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-[130px]"
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="INTERNAL">Internal</option>
                                    <option value="EXTERNAL">External</option>
                                </select>

                                <Button type="submit" variant="secondary" className="col-span-2 sm:col-span-1 w-full sm:w-auto">Filter</Button>
                                <div className="col-span-2 sm:col-span-1 sm:w-auto flex justify-end sm:block">
                                    <StudentReportButton filters={filters} />
                                </div>
                            </div>
                        </form>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left caption-bottom">
                            <thead className="bg-muted/30 text-muted-foreground border-b">
                                <tr>
                                    <th className="h-12 px-6 align-middle font-medium">NIS</th>
                                    <th className="h-12 px-6 align-middle font-medium">Nama Santri</th>
                                    <th className="h-12 px-6 align-middle font-medium">Kelas</th>
                                    <th className="h-12 px-6 align-middle font-medium">Orang Tua</th>
                                    <th className="h-12 px-6 align-middle font-medium">Umur</th>
                                    <th className="h-12 px-6 align-middle font-medium">Tipe</th>
                                    <th className="h-12 px-6 align-middle font-medium">Status</th>
                                    <th className="h-12 px-6 align-middle font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map(s => (
                                    <tr key={s.id} className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-6 align-middle">
                                            {s.nis ? (
                                                <span className="font-mono text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-1 rounded">{s.nis}</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Belum ada</span>
                                            )}
                                        </td>
                                        <td className="p-6 align-middle font-medium text-foreground">{s.fullName}</td>
                                        <td className="p-6 align-middle">
                                            {s.class ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm">{s.class.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="p-6 align-middle text-muted-foreground">{s.parent.name}</td>
                                        <td className="p-6 align-middle">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                {calculateAge(s.dateOfBirth)} th
                                            </span>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.studentType === 'EXTERNAL' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {s.studentType || 'INTERNAL'}
                                            </span>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${s.parent.user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-sm text-muted-foreground">{s.parent.user.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle text-right">
                                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 table-hover-trigger">
                                                <ToggleStatusButton studentId={s.id} isActive={s.parent.user.isActive} />
                                                {/* @ts-ignore - complex type matching for student prop */}
                                                <EditStudentModal student={s} classes={classes} />
                                                <DeleteButton action={deleteStudent.bind(null, s.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Users className="h-8 w-8 opacity-20" />
                                                <p>Tidak ada data santri ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4 pb-20 sm:pb-0">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Menampilkan {students.length > 0 ? (page - 1) * pageSize + 1 : 0} hingga {Math.min(page * pageSize, filteredTotal)} dari {filteredTotal} santri
                </p>
                <div className="flex items-center space-x-2">
                    {page > 1 ? (
                        <Link href={`?page=${page - 1}&q=${q}&classId=${classId || ''}&studentType=${studentType || ''}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            Sebelumnya
                        </Link>
                    ) : (
                        <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
                    )}

                    {(page * pageSize) < filteredTotal ? (
                        <Link href={`?page=${page + 1}&q=${q}&classId=${classId || ''}&studentType=${studentType || ''}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            Selanjutnya
                        </Link>
                    ) : (
                        <Button variant="outline" size="sm" disabled>Selanjutnya</Button>
                    )}
                </div>
            </div>

            <style jsx global>{`
                tr:hover .table-hover-trigger {
                    opacity: 1;
                }
                .table-hover-trigger {
                    opacity: 0.6;
                }
            `}</style>
        </div>
    )
}
