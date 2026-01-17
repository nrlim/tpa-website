'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'

export default function LoginForm() {
    const [state, action, isPending] = useActionState(login, null)

    return (
        <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Login</h1>
                <p className="text-muted-foreground mt-2">Masuk ke Dashboard TPA Nurul Iman</p>
            </div>

            <form action={action} className="space-y-6">
                {state?.error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                        {state.error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput id="password" name="password" required />
                </div>

                <Button type="submit" className="w-full font-bold" disabled={isPending}>
                    {isPending ? 'Logging in...' : 'Login'}
                </Button>
            </form>
        </div>
    )
}
