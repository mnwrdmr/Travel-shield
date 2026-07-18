import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { TravelProvider } from "@/context/TravelContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Shield - Havayolu Tuzaklarına Karşı Koruma",
  description: "Ryanair, Wizz Air ve Trenitalia gibi havayollarının gizli kural labirentlerini yapay zeka ile analiz eden bilet koruma sistemi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <TravelProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </TravelProvider>
      </body>
    </html>
  );
}

