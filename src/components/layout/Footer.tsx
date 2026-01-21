import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            {/* Logo placeholder - using text if image fails to load in dark mode context, but image is preferred */}
                            <div className="font-bold text-2xl text-white">
                                TPA Nurul Iman
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Membangun Generasi Qur'ani yang Berakhlak Mulia, Cerdas, dan Berprestasi melalui Pendidikan Islami Berkualitas.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-primary">Quick Links</h3>
                        <ul className="space-y-3 text-slate-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
                            <li><Link href="#about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                            <li><Link href="#program" className="hover:text-white transition-colors">Program</Link></li>
                            <li><Link href="/register" className="hover:text-white transition-colors">Pendaftaran</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-primary">Program</h3>
                        <ul className="space-y-3 text-slate-400">
                            <li><span className="hover:text-white transition-colors cursor-default">Baca Al-Qur'an</span></li>
                            <li><span className="hover:text-white transition-colors cursor-default">Tahfidz Qur'an</span></li>
                            <li><span className="hover:text-white transition-colors cursor-default">Dinul Islam</span></li>
                            <li><span className="hover:text-white transition-colors cursor-default">Praktik Ibadah</span></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-primary">Hubungi Kami</h3>
                        <div className="space-y-4 text-slate-400">
                            <p className="flex items-start gap-3">
                                <span className="text-white font-semibold min-w-[60px]">Alamat:</span>
                                <span>Majelis Nurul Iman, Baltic Area, Kab Bekasi</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="text-white font-semibold min-w-[60px]">Email:</span>
                                <span>tpanurulimanbaltic@gmail.com</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} TPA Nurul Iman Baltic. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
