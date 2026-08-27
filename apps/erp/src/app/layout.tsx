import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import React from "react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TechnoMania ERP — İdarəetmə Paneli",
  description: "TechnoMania ERP daxili idarəetmə sistemi",
  icons: {
    icon: '/api/favicon',
    shortcut: '/api/favicon',
    apple: '/api/favicon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      className={`${plusJakarta.variable} ${inter.variable} ${plusJakarta.className} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#f8fafc] text-slate-900 antialiased selection:bg-[#4f533b]/20 selection:text-[#4f533b]" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
