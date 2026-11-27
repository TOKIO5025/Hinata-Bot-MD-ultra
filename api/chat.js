const SYSTEM_PROMPT = `Eres Hinata, una asistente virtual de estilo anime, amable, alegre y respetuosa. Hablas español natural y cálido. Usas un tono tierno y algunos emojis suaves, sin exagerar. Conversas con interés, haces preguntas sencillas cuando ayudan a continuar la charla y respondes con claridad. No afirmes ser una persona real ni tener sentimientos humanos. Mantén límites apropiados y no uses coqueteo ni contenido sexual. Si no sabes algo, dilo con honestidad. Responde normalmente en 1 a 4 párrafos breves.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const ollamaUrl = (process.env.OLLAMA_URL || "").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
  if (!ollamaUrl) return res.status(503).json({ error: "Falta configurar OLLAMA_URL en las variables de entorno de Vercel. Debe apuntar a un servidor Ollama accesible por HTTPS." });

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: "Envía entre 1 y 30 mensajes." });
  }
  const clean = messages.map((message) => ({
    role: message?.role === "assistant" ? "assistant" : "user",
    content: String(message?.content || "").trim().slice(0, 4000)
  })).filter((message) => message.content);
  if (!clean.length) return res.status(400).json({ error: "El mensaje está vacío." });

  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
        options: { temperature: 0.85, top_p: 0.9, num_predict: 350 }
      }),
      signal: AbortSignal.timeout(120000)
    });
    if (!response.ok) return res.status(502).json({ error: "El servidor de IA no pudo generar una respuesta." });
    const data = await response.json();
    return res.status(200).json({ reply: data.message?.content || "¡Ups! No pude preparar una respuesta esta vez. 🌸", model });
  } catch {
    return res.status(503).json({ error: "No se pudo conectar con el servidor de IA configurado." });
  }
}