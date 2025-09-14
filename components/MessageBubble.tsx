"use client"
import { useState } from "react"
export type Role = "user" | "assistant" | "system"

export default function MessageBubble({
  role, text, time, isStreaming, onRetry, onDelete
}: {
  role: Role
  text: string
  time?: string
  isStreaming?: boolean
  onRetry?: () => void
  onDelete?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isUser = role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border text-sm whitespace-pre-wrap leading-relaxed ${isUser ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"}`}>
        <div className="text-xs opacity-70 mb-1">
          {role === "assistant" ? "Sparkle" : role === "user" ? "You" : "System"}{time ? ` • ${time}` : ""}
        </div>
        <div>{text}</div>
        <div className="mt-2 flex gap-2 text-[11px] opacity-70">
          <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false), 1200) }}>📋 {copied ? "Copied" : "Copy"}</button>
          {onRetry && <button onClick={onRetry}>↻ Retry</button>}
          {onDelete && <button onClick={onDelete}>🗑 Delete</button>}
          {isStreaming && <span>⌛ typing…</span>}
        </div>
      </div>
    </div>
  )
}
