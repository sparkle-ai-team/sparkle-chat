import { GoogleGenerativeAI } from "@google/generative-ai"

export function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("Missing GEMINI_API_KEY")
  return new GoogleGenerativeAI(key)
}


