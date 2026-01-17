import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Star,
  Users,
  Heart,
  GraduationCap,
  Award,
  BookMarked,
  Clock,
  TrendingUp,
  CheckCircle,
  Quote
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-image.png"
              alt="TPA Nurul Iman Classroom"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-emerald-900/90" />
          </div>

          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/pattern-bg.png"
              alt="Islamic Pattern"
              fill
              className="object-cover mix-blend-overlay"
            />
          </div>

          {/* Content */}
          <div className="container relative z-10 py-20">
            <div className="max-w-4xl text-white">
              <div className="flex items-center gap-3 mb-6 animate-fade-in">
                <Image
                  src="/logo.png"
                  alt="TPA Nurul Iman Logo"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-2xl"
                />
                <div className="h-12 w-1 bg-secondary/80" />
                <div>
                  <p className="text-secondary font-semibold text-lg">Taman Pendidikan Al-Qur'an</p>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
                TPA Nurul Iman <span className="text-secondary">Baltic</span>
              </h1>

              <p className="text-xl md:text-2xl mb-4 text-white/95 animate-slide-up font-arabic leading-relaxed">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>

              <p className="text-xl md:text-2xl mb-10 text-white/90 animate-slide-up max-w-2xl leading-relaxed">
                Membangun Generasi Qur'ani yang Berakhlak Mulia, Cerdas, dan Berprestasi melalui Pendidikan Islami Berkualitas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6 font-bold shadow-2xl hover:shadow-secondary/50 transition-all hover:scale-105">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="#program">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary font-semibold transition-all hover:scale-105"
                  >
                    Lihat Program
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
        </section>



        {/* About Section */}
        <section id="about" className="section-padding bg-background">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-in-left">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <span className="text-primary font-semibold">Tentang Kami</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text pb-2">
                  Kenapa Memilih TPA Nurul Iman?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  TPA Nurul Iman Baltic adalah lembaga pendidikan Al-Qur'an yang berkomitmen untuk membentuk generasi Qur'ani dengan akhlak mulia dan prestasi gemilang.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Kurikulum Terpadu</h3>
                      <p className="text-muted-foreground">Pembelajaran Al-Qur'an (Iqro & Tilawati) dipadukan dengan hafalan, dinul islam, dan pendidikan karakter.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-secondary flex items-center justify-center shrink-0 shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Pengajar Berpengalaman</h3>
                      <p className="text-muted-foreground">Ustadz dan Ustadzah yang ramah, sabar, berpengalaman, dan tersertifikasi dalam mendidik anak sesuai usia.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Fasilitas Nyaman & Modern</h3>
                      <p className="text-muted-foreground">Lingkungan belajar yang kondusif, aman, menyenangkan, dan dilengkapi teknologi pembelajaran digital.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative animate-slide-in-right">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/students-learning.png"
                    alt="Santri TPA Nurul Iman"
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section id="program" className="py-8 md:py-12 lg:py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-primary font-semibold">Program Kami</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text pb-2">
                Program Unggulan TPA
              </h2>
              <p className="text-lg text-muted-foreground">
                Berbagai program berkualitas yang dirancang untuk mengembangkan potensi santri secara optimal
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Program 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border-2 border-transparent hover:border-primary/20">
                <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Baca Al-Qur'an</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Pembelajaran membaca Al-Qur'an dengan metode Iqro dan Tilawati yang mudah dipahami dan efektif untuk semua usia.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Metode Iqro & Tilawati</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Tajwid & Makharijul Huruf</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Tahsin Al-Qur'an</span>
                  </li>
                </ul>
              </div>

              {/* Program 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border-2 border-transparent hover:border-primary/20">
                <div className="w-16 h-16 rounded-xl bg-gradient-secondary flex items-center justify-center mb-6 shadow-lg">
                  <BookMarked className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Tahfidz Qur'an</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Program hafalan Al-Qur'an dengan target bertahap, muroja'ah rutin, dan sistem evaluasi yang terstruktur.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Hafalan Juz 30 (Juz Amma)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Target Hafalan Bertahap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Muroja'ah Rutin</span>
                  </li>
                </ul>
              </div>

              {/* Program 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border-2 border-transparent hover:border-primary/20">
                <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Akhlak & Adab</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Pembinaan karakter Islami, akhlak mulia, dan adab sesuai tuntunan Rasulullah SAW untuk kehidupan sehari-hari.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Pendidikan Karakter Islami</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Adab kepada Orang Tua</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Akhlak dalam Pergaulan</span>
                  </li>
                </ul>
              </div>

              {/* Program 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border-2 border-transparent hover:border-primary/20">
                <div className="w-16 h-16 rounded-xl bg-gradient-secondary flex items-center justify-center mb-6 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Dinul Islam</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Pembelajaran dasar-dasar agama Islam meliputi aqidah, fiqih ibadah, dan sejarah Islam dengan metode yang menyenangkan.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Aqidah & Tauhid</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Fiqih Ibadah</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Sejarah Islam</span>
                  </li>
                </ul>
              </div>

              {/* Program 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border-2 border-transparent hover:border-primary/20">
                <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Praktik Ibadah</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Bimbingan praktik ibadah sehari-hari dengan metode demonstrasi langsung agar santri terbiasa beribadah dengan benar.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Tata Cara Wudhu & Sholat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Doa-doa Harian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Praktik Langsung</span>
                  </li>
                </ul>
              </div>

              {/* Program 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover border-2 border-transparent hover:border-primary/20">
                <div className="w-16 h-16 rounded-xl bg-gradient-secondary flex items-center justify-center mb-6 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Monitoring Berkala</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Sistem evaluasi dan pelaporan perkembangan santri kepada orang tua secara berkala melalui platform digital.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Laporan Bulanan Digital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Evaluasi Perkembangan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">Konsultasi Orang Tua</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-primary font-semibold">Testimoni</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text pb-2">
                Apa Kata Orang Tua Santri?
              </h2>
              <p className="text-lg text-muted-foreground">
                Kepercayaan dan kepuasan orang tua adalah motivasi kami
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "Alhamdulillah, anak saya sekarang sudah lancar membaca Al-Qur'an dan hafal beberapa surat. Ustadzah-ustadzahnya sangat sabar dan profesional."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    AS
                  </div>
                  <div>
                    <p className="font-bold">Ibu Aminah S.</p>
                    <p className="text-sm text-muted-foreground">Orang Tua Santri</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "Fasilitasnya bagus, lingkungannya bersih dan nyaman. Yang paling penting, anak saya jadi lebih sopan dan rajin ibadah."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-bold">
                    MR
                  </div>
                  <div>
                    <p className="font-bold">Bapak Muhammad R.</p>
                    <p className="text-sm text-muted-foreground">Orang Tua Santri</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg card-hover">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "Sistem monitoring digitalnya sangat membantu. Saya bisa pantau perkembangan anak dari aplikasi. Sangat recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    SF
                  </div>
                  <div>
                    <p className="font-bold">Ibu Siti F.</p>
                    <p className="text-sm text-muted-foreground">Orang Tua Santri</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative section-padding overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary" />
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/pattern-bg.png"
              alt="Pattern"
              fill
              className="object-cover"
            />
          </div>

          <div className="container relative z-10 text-center text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Mari Bergabung Bersama Kami
            </h2>
            <p className="text-xl md:text-2xl mb-4 font-arabic">
              وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ
            </p>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              Berikan pendidikan agama terbaik untuk buah hati Anda sejak dini.
              Pendaftaran dibuka setiap saat dengan proses mudah dan cepat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8 py-6 font-bold text-lg shadow-2xl hover:scale-105 transition-all">
                  Daftar Santri Baru
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 font-semibold text-lg border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-all hover:scale-105"
                >
                  Login Dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-secondary" />
                  Jam Operasional
                </h3>
                <p className="text-white/80">Senin - Jumat: 15.00 - 17.30 WIB</p>
                <p className="text-white/80">Sabtu: 09.00 - 11.00 WIB</p>
              </div>

              <div className="glass-dark rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <Users className="w-6 h-6 text-secondary" />
                  Kontak
                </h3>
                <p className="text-white/80">WhatsApp: +62 812-3456-7890</p>
                <p className="text-white/80">Email: info@tpanuruliman.com</p>
              </div>

              <div className="glass-dark rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-secondary" />
                  Lokasi
                </h3>
                <p className="text-white/80">Masjid Nurul Iman</p>
                <p className="text-white/80">Baltic Area, Jakarta</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
