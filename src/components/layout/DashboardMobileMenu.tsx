'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface DashboardMobileMenuProps {
    role?: string
}

export function DashboardMobileMenu({ role }: DashboardMobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Define links based on role
    const getLinks = () => {
        switch (role) {
            case 'admin':
                return [
                    { href: '/dashboard/admin', label: 'Dashboard' },
                    { href: '/dashboard/admin/registrations', label: 'Pendaftaran' },
                    { href: '/dashboard/admin/classes', label: 'Data Kelas' },
                    { href: '/dashboard/admin/payments', label: 'Data Pembayaran' },
                    { href: '/dashboard/admin/teachers', label: 'Data Pengajar' },
                    { href: '/register', label: 'Tambah Santri Baru' },
                ]
            case 'teacher':
                return [
                    { href: '/dashboard/teacher', label: 'Dashboard' },
                    // Add more if teacher has subpages
                ]
            case 'parent':
                return [
                    { href: '/dashboard/parent', label: 'Dashboard' },
                    // Add more if parent has subpages
                ]
            default:
                return [
                    { href: '/dashboard', label: 'Dashboard' },
                ]
        }
    }

    const links = getLinks()

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[80%] rounded-xl sm:max-w-[425px] top-[5%] translate-y-0">
                <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Menu ({role || 'User'})
                    </p>
                    <nav className="flex flex-col gap-2">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/* Logout is handled in the main header, but we could duplicate it here if needed. 
                            For now, keeping it minimal. 
                        */}
                    </nav>
                </div>
            </DialogContent>
        </Dialog>
    )
}
