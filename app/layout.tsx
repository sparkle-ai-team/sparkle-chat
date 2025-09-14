import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sparkle Chat",
  description: "Gemini-powered chat with a polished UX"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
