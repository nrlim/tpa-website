'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function MobileMenu({ user }: { user: boolean }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link
                        href="/"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="#about"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsOpen(false)}
                    >
                        About
                    </Link>
                    <Link
                        href="#program"
                        className="text-sm font-medium p-2 hover:bg-muted rounded-md"
                        onClick={() => setIsOpen(false)}
                    >
                        Program
                    </Link>

                    <div className="h-px bg-border my-2" />

                    {!user && (
                        <>
                            <Link
                                href="/login"
                                className="w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <Button variant="ghost" className="w-full justify-start">Login</Button>
                            </Link>
                            <Link
                                href="/register"
                                className="w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <Button className="w-full">Register Now</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
