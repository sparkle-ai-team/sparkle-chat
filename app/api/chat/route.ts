import { NextRequest } from "next/server"

export const runtime = "nodejs" // Node runtime works best when proxying streams

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, history = [], input = "" } = await req.json()
    if (!input || typeof input !== "string") return new Response("Bad Request", { status: 400 })

    const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434"
    const model = process.env.OLLAMA_MODEL || "llama3"

    // Build chat messages for Ollama
    const messages = [
      { role: "system", content: systemPrompt || "You are a helpful assistant." },
      ...history.map((m: any) => ({ role: m.role, content: m.text })),
      { role: "user", content: input }
    ]

    // Ask Ollama to stream chat tokens
    const upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true })
    })

    if (!upstream.ok || !upstream.body) {
      const msg = await upstream.text().catch(() => upstream.statusText)
      return new Response(`Upstream error: ${msg}`, { status: upstream.status })
    }

    // Convert Ollama's SSE stream into plain text chunks
    const out = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)

          // Each SSE line looks like: "data: {...}\n"
          for (const line of chunk.split("\n")) {
            const s = line.trim()
            if (!s.startsWith("data:")) continue
            const payload = s.slice(5).trim()
            if (payload === "" || payload === "[DONE]") continue
            try {
              const json = JSON.parse(payload)
              const delta =
                (json?.message && json.message.content) ??
                json?.response ??
                ""
              if (delta) controller.enqueue(encoder.encode(delta))
            } catch {
              // ignore heartbeat/non-JSON lines
            }
          }
        }
        controller.close()
      }
    })

    return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
  } catch (e: any) {
    return new Response(`Server error: ${e.message}`, { status: 500 })
  }
}

