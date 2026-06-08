import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

// Lazily instantiated so the module loads fine without a key
let _client: Groq | null = null;

export function getGroqClient(): Groq | null {
  if (!apiKey) return null;
  if (!_client) _client = new Groq({ apiKey });
  return _client;
}

export const MODEL = "llama-3.3-70b-versatile";

export const isMockMode = () => !apiKey;
