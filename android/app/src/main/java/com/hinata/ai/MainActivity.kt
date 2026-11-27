package com.hinata.ai

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.EditText
import android.widget.ScrollView
import android.widget.Switch
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.google.ai.edge.litertlm.Contents
import com.google.ai.edge.litertlm.Conversation
import com.google.ai.edge.litertlm.ConversationConfig
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.SamplerConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var status: TextView
    private lateinit var chat: TextView
    private lateinit var input: EditText
    private lateinit var send: Button
    private lateinit var importButton: Button
    private lateinit var scroll: ScrollView
    private lateinit var voiceSwitch: Switch
    private var tts: TextToSpeech? = null
    private var engine: Engine? = null
    private var conversation: Conversation? = null
    private var busy = false
    private val modelFile by lazy { File(filesDir, "hinata-model.litertlm") }

    private val systemPrompt = """
        Eres Hinata, una asistente virtual amable, dulce, respetuosa y alegre.
        Hablas siempre en español natural, con ternura moderada y algunos emojis florales.
        Ayudas con preguntas, estudio, programación y conversación cotidiana.
        Respondes con claridad, sin fingir ser una persona real ni afirmar que tienes sentimientos humanos.
        Mantén las respuestas útiles y no demasiado largas.
    """.trimIndent()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        status = findViewById(R.id.status)
        chat = findViewById(R.id.chat)
        input = findViewById(R.id.messageInput)
        send = findViewById(R.id.send)
        importButton = findViewById(R.id.importModel)
        scroll = findViewById(R.id.chatScroll)
        voiceSwitch = findViewById(R.id.voiceSwitch)
        tts = TextToSpeech(this, this)
        importButton.setOnClickListener { chooseModel() }
        send.setOnClickListener { sendMessage() }
        if (modelFile.exists() && modelFile.length() > 100_000_000L) loadModel()
    }

    private fun chooseModel() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        startActivityForResult(intent, REQUEST_MODEL)
    }

    @Deprecated("Using the document picker for compatibility")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_MODEL && resultCode == RESULT_OK) {
            val uri: Uri = data?.data ?: return
            lifecycleScope.launch {
                setBusy(true, "Copiando modelo al almacenamiento privado…")
                try {
                    withContext(Dispatchers.IO) {
                        contentResolver.openInputStream(uri).use { source ->
                            requireNotNull(source) { "No se pudo leer el archivo." }
                            modelFile.outputStream().use { target -> source.copyTo(target) }
                        }
                    }
                    loadModel()
                } catch (failure: Exception) {
                    status.text = "No se pudo importar: ${failure.message}"
                } finally {
                    setBusy(false)
                }
            }
        }
    }

    private fun loadModel() {
        lifecycleScope.launch {
            setBusy(true, "Cargando el modelo local…")
            try {
                withContext(Dispatchers.IO) {
                    conversation?.close()
                    engine?.close()
                    val newEngine = Engine(EngineConfig(modelPath = modelFile.absolutePath))
                    newEngine.initialize()
                    val newConversation = newEngine.createConversation(
                        ConversationConfig(
                            systemInstruction = Contents.of(systemPrompt),
                            samplerConfig = SamplerConfig(topK = 40, topP = 0.9, temperature = 0.8)
                        )
                    )
                    engine = newEngine
                    conversation = newConversation
                }
                status.text = "IA local lista · funciona sin Internet 🌸"
                append("\nHinata: ¡Ya estoy lista! Podemos conversar sin conexión. 🌷\n")
            } catch (failure: Exception) {
                status.text = "Error al cargar el modelo: ${failure.message}"
            } finally {
                setBusy(false)
            }
        }
    }

    private fun sendMessage() {
        val text = input.text.toString().trim()
        val activeConversation = conversation
        if (text.isEmpty() || busy) return
        if (activeConversation == null) {
            status.text = "Importa primero un modelo .litertlm compatible."
            return
        }
        input.setText("")
        append("\nTú: $text\nHinata: ")
        setBusy(true, "Hinata está pensando…")
        lifecycleScope.launch {
            try {
                val answer = withContext(Dispatchers.IO) {
                    val output = StringBuilder()
                    activeConversation.sendMessageAsync(text).collect { part ->
                        output.append(part.toString())
                    }
                    output.toString().trim()
                }
                val cleanAnswer = answer.ifBlank { "¡Aquí estoy! ¿Puedes repetirlo, por favor? 🌸" }
                append("$cleanAnswer\n")
                if (voiceSwitch.isChecked) tts?.speak(cleanAnswer, TextToSpeech.QUEUE_FLUSH, null, "hinata-reply")
                status.text = "IA local lista · sin conexión"
            } catch (failure: Exception) {
                append("No pude generar la respuesta: ${failure.message}\n")
                status.text = "Ocurrió un error con el modelo."
            } finally {
                setBusy(false)
            }
        }
    }

    private fun append(text: String) {
        chat.append(text)
        scroll.post { scroll.fullScroll(ScrollView.FOCUS_DOWN) }
    }

    private fun setBusy(value: Boolean, message: String? = null) {
        busy = value
        send.isEnabled = !value
        importButton.isEnabled = !value
        message?.let { status.text = it }
    }

    override fun onInit(statusCode: Int) {
        if (statusCode == TextToSpeech.SUCCESS) {
            tts?.language = Locale("es", "ES")
            tts?.setSpeechRate(0.92f)
            tts?.setPitch(1.15f)
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        conversation?.close()
        engine?.close()
        super.onDestroy()
    }

    companion object { private const val REQUEST_MODEL = 42 }
}
