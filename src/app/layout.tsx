import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallBanner from "./InstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "দাওয়াতুস সুন্নাহ | আসসুন্নাহ ফাউন্ডেশন",
  description: "আসসুন্নাহ ফাউন্ডেশনের একটি দাওয়াতি উদ্যোগ",
  manifest: "/manifest.json",
  themeColor: "#00a651",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00a651" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="দাওয়াতুস সুন্নাহ" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <InstallBanner />
      </body>
    </html>
  );
}