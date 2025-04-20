import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Net-Secure",
  description: "Professional-grade security and privacy tools with zero data transmission",
  keywords: "security, privacy, encryption, password, analysis, visualization, entropy, homoglyph, binary",
  authors: [{ name: "Net-Secure Team" }],
  creator: "Net-Secure",
  publisher: "Net-Secure",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://net-secure.netlify.app/",
    title: "Net-Secure - Professional Security Tools",
    description: "Professional-grade security and privacy tools with zero data transmission",
    siteName: "Net-Secure",
  },
  twitter: {
    card: "summary_large_image",
    title: "Net-Secure - Professional Security Tools",
    description: "Professional-grade security and privacy tools with zero data transmission",
    creator: "@AFP",
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
          <SidebarProvider defaultOpen={true}>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

