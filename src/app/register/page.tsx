import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Navbar />

            <main className="flex-1 container py-12 flex justify-center items-center">
                <RegisterForm />
            </main>

            <Footer />
        </div>
    )
}
