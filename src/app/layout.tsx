import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TPA Nurul Iman Baltic",
  description: "Website Pendaftaran Santri Baru TPA Nurul Iman Baltic",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "TPA Nurul Iman Baltic",
    description: "Website Pendaftaran Santri Baru TPA Nurul Iman Baltic",
    url: "https://tpanuruliman.com", // Replace with your actual domain
    siteName: "TPA Nurul Iman Baltic",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Logo TPA Nurul Iman Baltic",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  metadataBase: new URL("https://tpanuruliman.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
