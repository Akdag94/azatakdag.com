import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://azatakdag.com"),
  title: "Azat Akdağ — Full-Stack Web Developer",
  description: "Personal website of Azat Akdağ. Full-stack web developer working with React, Node.js and Python. Building ERP systems, digital platforms and AI-powered products.",
  keywords: ["Azat Akdağ", "full-stack developer", "react", "node.js", "python", "greennova", "azap online", "ERP", "agritech"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Azat Akdağ",
  },
  openGraph: {
    title: "Azat Akdağ — Full-Stack Web Developer",
    description: "Personal website of Azat Akdağ.",
    url: "https://azatakdag.com",
    siteName: "Azat Akdağ",
    images: [{ url: "/icon.png", width: 1024, height: 1024 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Azat Akdağ",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-black">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
