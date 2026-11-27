import "./style.css";

const $ = (selector) => document.querySelector(selector);
const state = { messages: [], busy: false, voice: true };
const chat = $("#chat");
const form = $("#chat-form");
const input = $("#message");
const sendButton = $("#send");
const status = $("#status");
const voiceToggle = $("#voice-toggle");

function addMessage(role, content, save = true) {
  const item = document.createElement("article");
  item.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "assistant" ? "🌸" : "☺";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = role === "assistant" ? "Hinata" : "Tú";
  const text = document.createElement("p");
  text.textContent = content;
  bubble.append(name, text);
  item.append(avatar, bubble);
  chat.append(item);
  chat.scrollTop = chat.scrollHeight;
  if (save) state.messages.push({ role, content });
  return item;
}

function setBusy(busy) {
  state.busy = busy;
  sendButton.disabled = busy;
  input.disabled = busy;
  sendButton.textContent = busy ? "…" : "Enviar";
}

function speak(text) {
  if (!state.voice || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.92;
  utterance.pitch = 1.18;
  const voices = window.speechSynthesis.getVoices();
  const spanish = voices.find((voice) => voice.lang.toLowerCase().startsWith("es") && /female|woman|sabina|helena|monica|paulina/i.test(voice.name))
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("es"));
  if (spanish) utterance.voice = spanish;
  window.speechSynthesis.speak(utterance);
}

async function checkStatus() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    status.textContent = data.ok
      ? (data.modelAvailable ? "IA local conectada" : "Ollama conectado · falta descargar el modelo")
      : "IA local desconectada";
    status.className = data.ok && data.modelAvailable ? "status online" : "status offline";
  } catch {
    status.textContent = "Servidor no disponible";
    status.className = "status offline";
  }
}

async function sendMessage(content) {
  const clean = content.trim();
  if (!clean || state.busy) return;
  addMessage("user", clean);
  input.value = "";
  setBusy(true);
  const pending = addMessage("assistant", "Estoy pensando un poquito… 🌷", false);
  pending.classList.add("pending");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: state.messages.slice(-20) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo obtener una respuesta.");
    pending.querySelector("p").textContent = data.reply;
    pending.classList.remove("pending");
    state.messages.push({ role: "assistant", content: data.reply });
    speak(data.reply);
  } catch (error) {
    pending.querySelector("p").textContent = `No pude conectar con mi IA local. ${error.message} 🌸`;
    pending.classList.remove("pending");
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});
voiceToggle.addEventListener("click", () => {
  state.voice = !state.voice;
  voiceToggle.textContent = state.voice ? "🔊 Voz activada" : "🔇 Voz desactivada";
  if (!state.voice && "speechSynthesis" in window) window.speechSynthesis.cancel();
});
$("#clear").addEventListener("click", () => {
  state.messages = [];
  chat.replaceChildren();
  addMessage("assistant", "¡Holiii! 🌸 Soy Hinata. ¿De qué te gustaría charlar hoy?");
});
$("#suggestions").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-message]");
  if (button) sendMessage(button.dataset.message);
});

addMessage("assistant", "¡Holiii! 🌸 Soy Hinata. Me alegra que estés aquí. Podemos conversar, resolver dudas o simplemente pasar un ratito hablando. ¿Cómo va tu día?");
checkStatus();
setInterval(checkStatus, 15000);