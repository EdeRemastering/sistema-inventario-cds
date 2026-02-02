export type GroqChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function groqChatCompletion(input: {
  messages: GroqChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no está configurado");

  const model = input.model ?? process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: input.messages,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.max_tokens ?? 400,
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `Error Groq (${res.status})`;
    throw new Error(msg);
  }

  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq no devolvió contenido");
  return String(content);
}

