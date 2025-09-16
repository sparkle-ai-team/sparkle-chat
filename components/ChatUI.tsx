"use client"
import { useEffect, useRef, useState } from "react"
import MessageBubble, { type Role } from "./MessageBubble"
import ControlsBar from "./ControlsBar"
import QuickChips from "./QuickChips"

export type Message = { id: string; role: Role; text: string; time?: string }

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("sparkle:messages") || "[]") } catch { return [] }
  })
  const [systemPrompt, setSystemPrompt] = useState<string>("You are a concise, helpful assistant.")
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => { localStorage.setItem("sparkle:messages", JSON.stringify(messages)) }, [messages])

  const add = (m: Message) => setMessages(prev => [...prev, m])
  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  async function send(input: string) {
    // Slash commands
    if (input.startsWith("/")) {
      const cmd = input.slice(1).trim()
      if (cmd === "clear") { setMessages([]); return }
      if (cmd === "undo") { setMessages(prev => prev.slice(0, -1)); return }
      if (cmd === "help") { add({ id: crypto.randomUUID(), role: "assistant", text: "Commands: /clear, /undo, /help", time: now() }); return }
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: input, time: now() }
    add(userMsg)

    const aborter = new AbortController(); controllerRef.current = aborter
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, history: messages, input }),
      signal: aborter.signal
    })

    if (!res.ok || !res.body) {
      add({ id: crypto.randomUUID(), role: "assistant", text: `⚠️ Error: ${res.status} ${res.statusText}`, time: now() })
      return
    }

    // stream
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let acc = ""
    const aiId = crypto.randomUUID()
    add({ id: aiId, role: "assistant", text: "", time: now() })

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      acc += decoder.decode(value)
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: acc } : m))
    }
  }

  function retry(index: number) {
    const msg = messages[index - 1]?.text || ""
    if (msg) send(msg)
  }

  async function onUpload(files: FileList) {
    const texts: string[] = []
    for (const f of Array.from(files)) {
      const t = await f.text()
      texts.push(`FILE: ${f.name}\n\n${t.substring(0, 10000)}`)
    }
    if (texts.length) send(`Consider these files and answer:\n\n${texts.join("\n\n---\n\n")}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <QuickChips onPick={(p)=>send(p)} />
      <div className="flex-1 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-neutral-500 mb-3">Say hi to Sparkle ✨ — try a quick prompt below or type your own.</div>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            text={m.text}
            time={m.time}
            isStreaming={i === messages.length - 1 && m.role === "assistant" && m.text.endsWith("…")}
            onRetry={() => retry(i)}
            onDelete={() => setMessages(prev => prev.filter(x => x.id !== m.id))}
          />
        ))}
      </div>
      <ControlsBar
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        onSend={send}
        onUpload={onUpload}
      />
      <div className="mt-2 text-[11px] text-neutral-500">
        Tip: use <code>/clear</code>, <code>/undo</code>, <code>/help</code>. Your chat is stored locally only.
      </div>
    </div>
  )
}
