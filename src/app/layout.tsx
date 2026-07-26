import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SinoTech Voyage",
  description: "Технологический туризм по Китаю",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerLocale = (await headers()).get("x-locale") ?? "";
  const lang = isLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
