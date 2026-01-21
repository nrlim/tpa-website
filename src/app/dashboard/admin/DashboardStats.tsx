'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, GraduationCap, School, CreditCard } from 'lucide-react'

interface DashboardStatsProps {
    totalStudents: number
    pendingCount: number
    totalTeachers: number
    totalClasses: number
}

export function DashboardStats({ totalStudents, pendingCount, totalTeachers, totalClasses }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Santri
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        Santri aktif terdaftar
                    </p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Pendaftaran Baru
                    </CardTitle>
                    <UserPlus className={`h-4 w-4 ${pendingCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Menunggu konfirmasi
                    </p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Pengajar
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTeachers}</div>
                    <p className="text-xs text-muted-foreground">
                        Ustadz & Ustadzah
                    </p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Kelas Aktif
                    </CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalClasses}</div>
                    <p className="text-xs text-muted-foreground">
                        Rombongan belajar
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
