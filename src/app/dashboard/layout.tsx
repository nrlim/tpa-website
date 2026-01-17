import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import prisma from '@/lib/prisma'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user role for customized UI
    // Use try-catch or safe access as prisma might fail if user not synced (rare but possible)
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true }
    })

    // If check role and redirect? Maybe not in layout to avoid infinite loops if paths are mixed. 
    // Individual pages protect themselves or middleware does.

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b bg-background sticky top-0 z-10 px-6 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="TPA Nurul Iman Logo"
                            width={50}
                            height={50}
                            className="object-contain transition-transform group-hover:scale-110"
                        />
                        <div className="hidden lg:block">
                            <p className="font-bold text-primary text-lg leading-tight">TPA Nurul Iman</p>
                            <p className="text-xs text-muted-foreground">Baltic Area</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium hidden md:inline-block">{dbUser?.email || user.email}</span>
                    <form action={signOut}>
                        <Button variant="outline" size="sm" className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-transparent">
                            Logout
                        </Button>
                    </form>
                </div>
            </header>
            <main className="flex-1 bg-muted/20 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
