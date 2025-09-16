import { NextRequest } from "next/server"
import { getGeminiClient } from "../../../lib/gemini"  // from app/api/chat to lib = ../../../

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, history = [], input = "" } = await req.json()
    if (!input || typeof input !== "string") return new Response("Bad Request", { status: 400 })
    if (input.length > 8000) return new Response("Input too long", { status: 413 })

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const parts = [
      { role: "user", parts: [{ text: `SYSTEM: ${systemPrompt || "You are a helpful assistant."}` }] },
      ...history.map((m: any) => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.text }]
      })),
      { role: "user", parts: [{ text: input }] }
    ] as any

    const result = await model.generateContentStream({ contents: parts })

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const t = chunk.text()
          controller.enqueue(new TextEncoder().encode(t))
        }
        controller.close()
      }
    })

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
  } catch (e: any) {
    return new Response(`Server error: ${e.message}`, { status: 500 })
  }
}
