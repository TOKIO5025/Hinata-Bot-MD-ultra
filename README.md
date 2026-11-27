# Hinata AI 🌸

Asistente web de estilo anime, amable y conversacional. La generación de texto se ejecuta localmente mediante Ollama; la voz utiliza la síntesis de voz del navegador.

## Requisitos

- Node.js 20 o superior.
- Ollama instalado y ejecutándose.
- Un equipo con memoria suficiente para ejecutar el modelo elegido.

## Instalación

```bash
git clone https://github.com/TOKIO5025/Hinata-Bot-MD-ultra.git
cd Hinata-Bot-MD-ultra
npm install
ollama pull qwen2.5:1.5b
npm run dev
```

Abre http://localhost:5173. El servidor API estará en http://localhost:3000.

Para iniciar la versión compilada:

```bash
npm run build
npm start
```

## Configuración

Copia `.env.example` a `.env` y ajusta:

- `PORT`: puerto del servidor web/API (3000 por defecto).
- `OLLAMA_URL`: dirección local de Ollama.
- `OLLAMA_MODEL`: nombre exacto del modelo descargado.

Puedes cambiar el modelo con `ollama pull nombre-del-modelo` y actualizar `OLLAMA_MODEL`.

## API HTTP

### GET /api/health

Comprueba si Ollama está disponible y si el modelo configurado está descargado.

### GET /api/config

Devuelve el nombre del asistente, modelo y modo local.

### POST /api/chat

Petición:

```json
{
  "messages": [
    { "role": "user", "content": "Hola Hinata" }
  ]
}
```

Respuesta:

```json
{
  "reply": "¡Holiii! Qué gusto saludarte. 🌸",
  "model": "qwen2.5:1.5b"
}
```

El endpoint acepta hasta 30 mensajes por petición y limita cada mensaje a 4.000 caracteres.

## Voz

El botón de voz activa o desactiva la lectura de respuestas con `SpeechSynthesis`. La voz concreta depende de las voces instaladas en el navegador/dispositivo; el proyecto selecciona una voz española disponible y ajusta el tono y la velocidad. No incluye una voz de personaje clonada.

## Privacidad y límites

- La inferencia de texto se realiza en el Ollama local configurado.
- Las conversaciones no se guardan en una base de datos; el historial vive en la memoria de la página y se pierde al recargar.
- Para uso público, añade autenticación, límites de peticiones y protección contra abuso antes de exponer el servidor a Internet.
- La primera descarga del modelo requiere Internet. Después, Ollama puede ejecutarlo localmente.

## Licencia

MIT