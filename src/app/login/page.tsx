import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import LoginForm from './LoginForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Navbar />

            <main className="flex-1 container py-20 flex justify-center items-center">
                <LoginForm />
            </main>

            <Footer />
        </div>
    )
}
