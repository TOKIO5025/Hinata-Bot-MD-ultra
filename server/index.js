import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: "32kb" }));

const SYSTEM_PROMPT = `Eres Hinata, una asistente virtual de estilo anime, amable, alegre y respetuosa. Hablas español natural y cálido. Usas un tono tierno y algunos emojis suaves, sin exagerar. Conversas con interés, haces preguntas sencillas cuando ayudan a continuar la charla y respondes con claridad. No afirmes ser una persona real ni tener sentimientos humanos. Mantén límites apropiados y no uses coqueteo ni contenido sexual. Si no sabes algo, dilo con honestidad. Responde normalmente en 1 a 4 párrafos breves.`;

app.get("/api/health", async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error("Ollama no respondió correctamente");
    const data = await response.json();
    const models = (data.models || []).map((item) => item.name);
    res.json({ ok: true, ollama: true, model: MODEL, modelAvailable: models.some((name) => name === MODEL || name.startsWith(MODEL + ":")), models });
  } catch {
    res.status(503).json({ ok: false, ollama: false, model: MODEL, message: "No se pudo conectar con Ollama. Comprueba que esté iniciado." });
  }
});

app.get("/api/config", (_req, res) => {
  res.json({ assistantName: "Hinata", model: MODEL, voice: "speechSynthesis", localInference: true });
});

app.post("/api/chat", async (req, res) => {
  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: "Envía entre 1 y 30 mensajes." });
  }
  const clean = messages.map((message) => ({
    role: message?.role === "assistant" ? "assistant" : "user",
    content: String(message?.content || "").trim().slice(0, 4000)
  })).filter((message) => message.content);

  if (!clean.length || clean.some((message) => !message.content)) {
    return res.status(400).json({ error: "El mensaje está vacío." });
  }

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
        options: { temperature: 0.85, top_p: 0.9, num_predict: 350 }
      }),
      signal: AbortSignal.timeout(120000)
    });
    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Ollama no pudo generar la respuesta.", detail: detail.slice(0, 300) });
    }
    const data = await response.json();
    res.json({ reply: data.message?.content || "¡Ups! No pude preparar una respuesta esta vez. 🌸", model: MODEL });
  } catch (error) {
    res.status(503).json({ error: "No se pudo conectar con el modelo local. Revisa que Ollama esté iniciado y que el modelo esté descargado." });
  }
});

app.use(express.static(path.resolve(__dirname, "../dist")));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => console.log(`🌸 Hinata AI disponible en http://localhost:${PORT}`));