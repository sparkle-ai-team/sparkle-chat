"use client"
import { useEffect, useState } from "react"
import ChatUI from "@/components/ChatUI"
import ThemeToggle from "@/components/ThemeToggle"

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (typeof window !== "undefined" && (localStorage.getItem("theme") as "light" | "dark")) || "light"
  )

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">✨ Sparkle Chat</h1>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>
        <ChatUI />
        <footer className="mt-6 text-xs text-neutral-500">Built with Gemini • Deployed on Vercel</footer>
      </div>
    </main>
  )
}
