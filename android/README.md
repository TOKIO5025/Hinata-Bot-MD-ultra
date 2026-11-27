# Hinata AI para Android 🌸

Esta carpeta contiene una aplicación Android nativa. La generación de texto usa LiteRT-LM en el propio dispositivo; no llama a la API web de Hinata ni a Vercel.

## Requisitos

- Android 8.0 (API 26) o superior.
- Recomendado: 8 GB de RAM o más. Con 12 GB, el modelo pequeño seleccionado es una opción razonable, aunque el rendimiento también depende del procesador y del espacio libre.
- Al menos 1.5 GB libres para el modelo y archivos temporales.
- Internet solo para conseguir el archivo del modelo la primera vez. Después de importarlo, el chat funciona sin conexión.

## Modelo recomendado

Usa **Gemma 3 1B IT, cuantizado int4** desde el repositorio de LiteRT Community:

- Repositorio: https://huggingface.co/litert-community/Gemma3-1B-IT
- Archivo sugerido: `gemma3-1b-it-int4.litertlm` (aprox. 584 MB).
- La descarga está sujeta a las condiciones de licencia Gemma. Lee y acepta esas condiciones en Hugging Face antes de descargar.

Descarga el archivo completo y guárdalo en el teléfono. Abre Hinata AI, pulsa **Importar modelo de IA** y selecciona el archivo `.litertlm`. La app lo copia a su almacenamiento privado y lo carga localmente. No borres el archivo original hasta que termine la importación.

## Crear el APK

Cada cambio en `android/**` ejecuta el workflow **Build Hinata Android APK** en GitHub Actions. También puedes abrir la pestaña Actions del repositorio y ejecutar manualmente ese workflow.

Cuando termine correctamente:
1. Abre la ejecución más reciente del workflow.
2. En **Artifacts**, descarga `Hinata-AI-debug-APK`.
3. Extrae el ZIP y encontrarás `app-debug.apk`.
4. Instala el APK en tu Android. Android puede pedir autorización para instalar aplicaciones descargadas fuera de Play Store.

El APK generado por Actions es de depuración. Para distribuirlo públicamente se debe configurar una clave de firma privada y generar una versión release.

## Privacidad y limitaciones

- El texto se procesa localmente con LiteRT-LM.
- La aplicación no envía mensajes a Vercel ni a un servicio de inferencia remoto.
- La voz usa TextToSpeech de Android; la voz exacta depende de los motores e idiomas instalados en el teléfono.
- El modelo no se incluye dentro del APK porque pesa cientos de MB.
- La aplicación solicita permiso de Internet para que Android pueda resolver servicios del sistema si se necesita; la inferencia del chat no realiza peticiones de red.

## Tecnología

- Kotlin / Android
- LiteRT-LM Kotlin API
- Gemma 3 1B IT int4
- Android TextToSpeech
