"use client"
import { useRef, useState } from "react"

const SYSTEM_PRESETS = [
  { id: "helpful", name: "Helpful general", prompt: "You are a concise, helpful assistant." },
  { id: "friendly", name: "Friendly coach", prompt: "You are encouraging, upbeat, and give step-by-step help." },
  { id: "strict",  name: "No-fluff expert", prompt: "You answer directly and avoid small talk." }
]

export default function ControlsBar({
  systemPrompt, setSystemPrompt, onSend, disabled, onUpload
}: {
  systemPrompt: string
  setSystemPrompt: (s: string) => void
  onSend: (input: string) => void
  disabled?: boolean
  onUpload: (files: FileList) => void
}) {
  const [input, setInput] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="sticky bottom-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur py-3">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs">Tone:</label>
        <select
          className="text-xs rounded-lg border px-2 py-1 bg-white dark:bg-neutral-800"
          value={systemPrompt}
          onChange={(e)=>setSystemPrompt(e.target.value)}
        >
          {SYSTEM_PRESETS.map(p => <option key={p.id} value={p.prompt}>{p.name}</option>)}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Type a message… (use /help, /clear, /undo)"
          className="flex-1 min-h-[48px] max-h-[160px] rounded-xl border p-3 bg-white dark:bg-neutral-800"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if (input.trim()) { onSend(input); setInput("") }
            }
          }}
        />
        <button
          onClick={() => { fileRef.current?.click() }}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Attach files"
        >📎</button>
        <input ref={fileRef} type="file" className="hidden" multiple onChange={(e)=> e.target.files && onUpload(e.target.files)} />
        <button
          disabled={disabled}
          onClick={()=>{ if (input.trim()) { onSend(input); setInput("") } }}
          className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >Send</button>
      </div>
    </div>
  )
}

