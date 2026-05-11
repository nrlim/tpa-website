import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CertificateGenerator } from './CertificateGenerator'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
    title: 'Generate Sertifikat | TPA Nurul Iman',
    description: 'Generate sertifikat massal dari template untuk seluruh santri.',
}

export default async function CertificatesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Generate Sertifikat</h1>
                    <p className="text-muted-foreground">
                        Upload file CSV berisi daftar nama, lalu generate sertifikat secara massal dan unduh sebagai ZIP.
                    </p>
                </div>
            </div>
            <CertificateGenerator />
        </div>
    )
}
