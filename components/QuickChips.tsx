"use client"
const presets = ["Summarize this page", "Draft a friendly email", "Explain like I'm 12", "Give me next steps"]
export default function QuickChips({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {presets.map((p) => (
        <button key={p} onClick={() => onPick(p)} className="text-xs rounded-full border px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {p}
        </button>
      ))}
    </div>
  )
}
