# Hinata AI Web 🌸

Versión web independiente del proyecto Hinata. Se añadió en `web-hinata/` para conservar intactos los archivos de la aplicación Android y el proyecto principal.

## Ejecutar
Abre `index.html` con Chrome, Firefox o Edge. No requiere instalación, paquetes, cuenta ni clave API.

## Funciones
- Interfaz adaptable a móvil y escritorio.
- Chat con respuestas locales programadas en `app.js`.
- Lectura en voz alta con SpeechSynthesis del navegador.
- Botones con mensajes sugeridos y opción para limpiar el chat.

## Limitaciones del modo local
No es un modelo generativo: utiliza patrones y respuestas predefinidas, por lo que no comprende cualquier tema. No envía los mensajes a servidores. La voz y su acento dependen de las voces instaladas en el dispositivo; el tono está ajustado para sonar más agudo y suave, pero no garantiza una voz de personaje anime.

## Archivos
- `index.html`: estructura.
- `styles.css`: diseño.
- `app.js`: respuestas y voz.
