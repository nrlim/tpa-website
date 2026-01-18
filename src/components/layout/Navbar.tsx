import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { MobileMenu } from "./MobileMenu"

export async function Navbar() {
    // Check if user is logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let homeLink = "/"

    // If user is logged in, get their role and set home link to dashboard
    if (user) {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { role: true }
        })

        if (dbUser?.role) {
            switch (dbUser.role.name) {
                case 'admin':
                    homeLink = '/dashboard/admin'
                    break
                case 'teacher':
                    homeLink = '/dashboard/teacher'
                    break
                case 'parent':
                    homeLink = '/dashboard/parent'
                    break
                default:
                    homeLink = '/'
            }
        }
    }

    return (
        <nav className="border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sticky top-0 z-50 shadow-sm">
            <div className="container flex h-20 items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={homeLink} className="flex items-center gap-3 group">
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

                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className="text-sm font-semibold transition-all hover:text-primary relative group"
                    >
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <a
                        href="#about"
                        className="text-sm font-semibold transition-all hover:text-primary relative group scroll-smooth"
                    >
                        Tentang
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </a>
                    <a
                        href="#program"
                        className="text-sm font-semibold transition-all hover:text-primary relative group scroll-smooth"
                    >
                        Program
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </a>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        // Show dashboard link if logged in
                        <Link href={homeLink}>
                            <Button size="sm" className="font-semibold px-6 shadow-md hover:shadow-lg transition-all">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        // Show login/register if not logged in - Hidden on mobile
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-semibold">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="font-semibold px-6 shadow-md hover:shadow-lg transition-all">
                                    Daftar Sekarang
                                </Button>
                            </Link>
                        </div>
                    )}
                    <MobileMenu user={!!user} />
                </div>
            </div>
        </nav>
    )
}
