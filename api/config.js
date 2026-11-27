export default function handler(_req, res) {
  res.status(200).json({
    assistantName: "Hinata",
    model: process.env.OLLAMA_MODEL || "qwen2.5:1.5b",
    voice: "speechSynthesis",
    localInference: false,
    hosting: "vercel"
  });
}