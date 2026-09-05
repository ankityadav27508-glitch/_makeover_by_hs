import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Studio — Interactive Image Editor",
  description:
    "Upload a photo and edit it in your browser. Adjust exposure, color, and filters on a live canvas, then export your result.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#232326",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
