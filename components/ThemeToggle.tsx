"use client"
export default function ThemeToggle({
  theme,
  setTheme
}: {
  theme: "light" | "dark"
  setTheme: (t: "light" | "dark") => void
}) {
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-xl border px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
      aria-label="Toggle theme"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}
