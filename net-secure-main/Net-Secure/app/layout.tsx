import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SecureShield - Professional Security Tools",
  description: "Professional-grade security and privacy tools with zero data transmission",
  keywords: "security, privacy, encryption, password, analysis, visualization, entropy, homoglyph, binary",
  authors: [{ name: "SecureShield Team" }],
  creator: "SecureShield",
  publisher: "SecureShield",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://secureshield.com",
    title: "SecureShield - Professional Security Tools",
    description: "Professional-grade security and privacy tools with zero data transmission",
    siteName: "SecureShield",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureShield - Professional Security Tools",
    description: "Professional-grade security and privacy tools with zero data transmission",
    creator: "@secureshield",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

