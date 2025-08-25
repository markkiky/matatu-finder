import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Matatu Finder - Find Your Route in Nairobi",
  description:
    "Find the right matatu stage and route to travel from your location to any destination in Nairobi. Get real-time fare estimates and travel tips.",
  generator: "v0.app",
  keywords: ["matatu", "nairobi", "transport", "routes", "kenya", "public transport"],
  authors: [{ name: "Matatu Finder Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#BF4209",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#BF4209" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all duration-200"
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  )
}
