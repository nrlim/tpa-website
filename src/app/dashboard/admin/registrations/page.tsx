import { getPendingRegistrations, getRegistrationStats } from './actions'
import { PendingRegistrationCard } from './PendingRegistrationCard'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function RegistrationsPage() {
    const [pendingRegistrations, statsData] = await Promise.all([
        getPendingRegistrations(),
        getRegistrationStats()
    ])

    const stats = {
        pending: statsData.pending,
        total: statsData.total
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Pendaftaran Menunggu Persetujuan</h1>
                <p className="text-muted-foreground mt-2">
                    Kelola pendaftaran santri baru dan permintaan penambahan santri
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Menunggu Persetujuan</p>
                            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 font-medium">Total Pendaftaran</p>
                            <p className="text-3xl font-bold text-green-700">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border-2 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-muted rounded-lg">
                            <XCircle className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Perlu Perhatian</p>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Registrations List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Daftar Pendaftaran</h2>
                    {stats.pending > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {stats.pending} menunggu review
                        </Badge>
                    )}
                </div>

                {pendingRegistrations.length === 0 ? (
                    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                            Tidak Ada Pendaftaran Menunggu
                        </h3>
                        <p className="text-muted-foreground">
                            Semua pendaftaran telah diproses
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingRegistrations.map((registration) => (
                            <PendingRegistrationCard
                                key={registration.id}
                                registration={registration}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
