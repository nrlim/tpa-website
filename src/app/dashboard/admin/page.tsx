import prisma from '@/lib/prisma'
import { Prisma, StudentType } from '@prisma/client'
import { AdminDashboardView } from './AdminDashboardView'

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

    const [students, classes, totalStudents, pendingCount, totalTeachers, totalClasses] = await Promise.all([
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
        prisma.student.count(), // Total ALL students for stats
        prisma.preUser.count({ where: { status: 'PENDING' } }),
        prisma.teacher.count(),
        prisma.masterClass.count()
    ]);

    // Count for current filter (used for pagination)
    const filteredTotal = await prisma.student.count({ where });

    return (
        <AdminDashboardView
            students={students}
            classes={classes}
            totalStudents={totalStudents}
            pendingCount={pendingCount}
            totalTeachers={totalTeachers}
            totalClasses={totalClasses}
            filteredTotal={filteredTotal}
            page={page}
            pageSize={pageSize}
            filters={{
                q: query,
                classId: params?.classId,
                studentType: params?.studentType
            }}
        />
    )
}
