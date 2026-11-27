export default async function handler(_req, res) {
  const ollamaUrl = (process.env.OLLAMA_URL || "").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
  if (!ollamaUrl) return res.status(200).json({ ok: false, ollama: false, model, message: "Falta configurar OLLAMA_URL en Vercel." });
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Ollama no disponible");
    const data = await response.json();
    const models = (data.models || []).map((item) => item.name);
    return res.status(200).json({ ok: true, ollama: true, model, modelAvailable: models.some((name) => name === model || name.startsWith(model + ":")), models });
  } catch {
    return res.status(503).json({ ok: false, ollama: false, model, message: "No se pudo conectar con Ollama." });
  }
}