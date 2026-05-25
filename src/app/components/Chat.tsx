import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send, Info, Sparkles, Lock, Mic, MicOff, Image, Video, Ban, MapPin, ChevronDown } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { userService, chatService } from "../../services/api";

/**
 * URL del chat-service con Socket.IO.
 * Se conecta DIRECTAMENTE (no pasa por el API Gateway) porque WebSockets
 * no son manejados por el gateway HTTP.
 */
const CHAT_URL = import.meta.env.VITE_CHAT_URL || "http://localhost:3005";
const CLOUDINARY_CLOUD_NAME = "dlw3wukbx";
const CLOUDINARY_UPLOAD_PRESET = "reveal_profiles";

interface Mensaje {
  id: number;
  tipo: "texto" | "audio" | "foto" | "video";
  text?: string;
  url?: string;
  sender: "me" | "them";
  time: string;
}

/**
 * Pantalla principal del chat en tiempo real entre dos usuarios con match mutuo.
 *
 * Funcionalidades:
 * - Socket.IO: mensajes de texto, audio, foto y video en tiempo real.
 * - Privacidad progresiva: el perfil del otro usuario se revela según el nivel.
 * - Barra de progreso animada con el puntaje de conexión calculado por la IA.
 * - Panel de lugares recomendados (nivel >= 4) con links a Google Maps.
 * - Grabación de audio con MediaRecorder (nivel >= 3).
 * - Upload de fotos/videos a Cloudinary (nivel >= 4 y >= 5).
 * - Bloqueo de usuario desde el chat.
 *
 * Carga de estado al montar:
 * - HTTP (chatService.obtenerSala): garantiza que nivel, blur y lugares
 *   persistan aunque el servidor se haya reiniciado.
 * - Socket evento 'estado_sala': sincroniza tras la reconexión.
 * - Intereses comunes: se calculan dinámicamente comparando los intereses
 *   de ambos usuarios desde la BD antes de emitir el evento 'unirse'.
 */
export function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nivel, setNivel] = useState(2);
  const [blur, setBlur] = useState(20);
  const [puntaje, setPuntaje] = useState(0);
  const [razon, setRazon] = useState("");
  const [lugares, setLugares] = useState<any[]>([]);
  const [showLugares, setShowLugares] = useState(false);
  const [lugaresExpandido, setLugaresExpandido] = useState(false);
  const [perfilOtro, setPerfilOtro] = useState<any>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaBloqueada, setMediaBloqueada] = useState<string | null>(null);
  const [mostrarBloquear, setMostrarBloquear] = useState(false);
  const [grabandoAudio, setGrabandoAudio] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const userId = localStorage.getItem("userId") || "";
  const otroUserId = id || "";
  const nombrePropio = localStorage.getItem("nombre") || "Yo";

  /** Recarga el perfil del otro usuario cada vez que cambia el nivel de conexión */
  useEffect(() => {
    const cargarPerfilOtro = async () => {
      try {
        const resp = await userService.obtenerPerfilConNivel(otroUserId, nivel);
        setPerfilOtro(resp.data.data);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };
    if (otroUserId) cargarPerfilOtro();
  }, [otroUserId, nivel]);

  /**
   * Carga el estado de la sala vía HTTP al montar el componente.
   * Garantiza que nivel, blur y lugares persistan aunque el servidor
   * se haya reiniciado y el socket llegue tarde o sin datos.
   */
  useEffect(() => {
    if (!userId || !otroUserId) return;
    const salaId = [userId, otroUserId].sort().join("_");
    chatService.obtenerSala(salaId).then((resp) => {
      const data = resp.data;
      if (data.nivel) setNivel(data.nivel);
      if (data.blur) setBlur(data.blur);
      if (data.puntaje !== undefined) setPuntaje(data.puntaje);
      const lugaresArr = Array.isArray(data.lugares) ? data.lugares : [];
      if (lugaresArr.length > 0) {
        setLugares(lugaresArr);
        setLugaresExpandido(true);
      }
    }).catch(() => {});
  }, [userId, otroUserId]);

  /**
   * Conecta Socket.IO y registra todos los handlers de eventos del chat.
   *
   * Antes de conectar, carga los intereses de ambos usuarios desde la BD
   * y calcula la intersección (intereses en común). Estos se envían al
   * servidor en el evento 'unirse' para que la IA los use como contexto
   * al analizar la conexión entre los usuarios.
   */
  useEffect(() => {
    if (!userId || !otroUserId) return;

    const iniciarSocket = async () => {
      // Cargar intereses reales de ambos usuarios y calcular los comunes
      let interesesComunes: string[] = [];
      try {
        const [respMios, respOtro] = await Promise.all([
          userService.obtenerIntereses(userId),
          userService.obtenerIntereses(otroUserId)
        ]);
        const mios = respMios.data.data.map((i: any) => i.tag);
        const otros = respOtro.data.data.map((i: any) => i.tag);
        interesesComunes = mios.filter((tag: string) => otros.includes(tag));
        console.log("Intereses comunes:", interesesComunes);
      } catch (e) {
        console.error("Error cargando intereses:", e);
      }

      const s = io(CHAT_URL);
      setSocket(s);

      s.emit("unirse", {
        user_id: userId,
        otro_user_id: otroUserId,
        intereses_comunes: interesesComunes,
        ciudad: localStorage.getItem("ciudad") || "Ibagué, Colombia"
      });

      s.on("estado_sala", (data) => {
        setNivel(data.nivel);
        setBlur(data.blur);
        if (data.puntaje !== undefined) setPuntaje(data.puntaje);
        const lugaresArr = Array.isArray(data.lugares) ? data.lugares : [];
        if (lugaresArr.length > 0) {
          setLugares(lugaresArr);
          setLugaresExpandido(true);
        }
      });

      s.on("historial_mensajes", (historial) => {
        setMessages(historial.map((m: any, i: number) => ({
          id: i + 1,
          tipo: m.tipo,
          text: m.tipo === "texto" ? m.texto : undefined,
          url: m.tipo !== "texto" ? m.url : undefined,
          sender: (m.user_id === userId || m.autor === userId || m.autor === nombrePropio) ? "me" : "them",
          time: new Date(m.timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
        })));
      });

      s.on("nuevo_mensaje", (msg) => {
        setMessages((prev) => [...prev, {
          id: prev.length + 1,
          tipo: msg.tipo || "texto",
          text: msg.tipo === "texto" ? msg.texto : undefined,
          url: msg.tipo !== "texto" ? msg.url : undefined,
          sender: (msg.user_id === userId || msg.autor === userId || msg.autor === nombrePropio) ? "me" : "them",
          time: new Date(msg.timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
        }]);
      });

      s.on("actualizacion_nivel", (data) => {
        setNivel(data.nivel);
        setBlur(data.blur);
        setPuntaje(data.puntaje);
        setRazon(data.razon);
      });

      s.on("recomendacion_lugares", (data) => {
        const lugaresArr = Array.isArray(data.lugares) ? data.lugares : [];
        setLugares(lugaresArr);
        setShowLugares(true);
        setLugaresExpandido(true);
      });

      s.on("media_bloqueada", (data) => {
        setMediaBloqueada(data.mensaje);
        setTimeout(() => setMediaBloqueada(null), 3000);
      });
    };

    iniciarSocket();

    return () => {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
    };
  }, [userId, otroUserId]);

  /** Auto-scroll al último mensaje */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;
    socket.emit("mensaje", {
      user_id: userId,
      otro_user_id: otroUserId,
      texto: message,
      autor: nombrePropio
    });
    setMessage("");
  };

  const handleBloquear = async () => {
    try {
      await userService.bloquearUsuario(userId, otroUserId);
      setMostrarBloquear(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error bloqueando:", error);
    }
  };

  /**
   * Inicia la grabación de audio con el micrófono del dispositivo.
   * Detecta el MIME type soportado para compatibilidad entre navegadores
   * (webm/opus en Chrome, mp4 en iOS Safari).
   */
  const iniciarGrabacion = async () => {
    if (nivel < 3) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        const audioFile = new File([audioBlob], `audio.${extension}`, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        await subirMedia(audioFile, "audio");
      };

      mediaRecorder.start(100);
      setGrabandoAudio(true);
    } catch (err) {
      console.error("Error accediendo al micrófono:", err);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabandoAudio) {
      mediaRecorderRef.current.stop();
      setGrabandoAudio(false);
    }
  };

  /**
   * Sube un archivo de audio/foto/video a Cloudinary y emite el evento
   * 'mensaje_media' al servidor via socket para distribuirlo a la sala.
   */
  const subirMedia = async (file: File, tipo: "foto" | "audio" | "video") => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "reveal/chat");

      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${tipo === "foto" ? "image" : "video"}/upload`,
        { method: "POST", body: formData }
      );
      const data = await resp.json();

      if (data.secure_url && socket) {
        socket.emit("mensaje_media", {
          user_id: userId,
          otro_user_id: otroUserId,
          tipo,
          url: data.secure_url,
          autor: nombrePropio
        });
      }
    } catch (err) {
      console.error("Error subiendo media:", err);
    } finally {
      setUploadingMedia(false);
    }
  };

  const revealStage = Math.min(100, puntaje);
  const esBorrosa = perfilOtro?.foto_borrosa === true;
  const tienefoto = !!perfilOtro?.foto_url;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/perfil/${otroUserId}`)}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative">
            {tienefoto ? (
              <img
                src={perfilOtro.foto_url}
                alt="Foto"
                className="w-12 h-12 rounded-full object-cover"
                style={{ filter: esBorrosa ? `blur(3px)` : "none" }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg">
                {perfilOtro?.nombre?.[0] || "?"}
              </div>
            )}
            {nivel < 4 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              {nivel >= 4
                ? perfilOtro?.nombre || "Usuario"
                : nivel >= 2
                ? perfilOtro?.nombre
                  ? `${perfilOtro.nombre.split(" ")[0]}`
                  : "Usuario anónimo"
                : "Usuario anónimo"}
            </h3>
            <p className="text-xs text-gray-500">Nivel {nivel} · Puntaje {puntaje}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarBloquear(true)}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <Ban className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Banner nivel de conexión */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-white">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="opacity-90 line-clamp-1">
              {razon || "Conversá para que la IA analice tu conexión"}
            </span>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
            Nv. {nivel} · {puntaje}pts
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <motion.div
            animate={{ width: `${revealStage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-white"
          />
        </div>
      </div>

      {/* Toast media bloqueada */}
      <AnimatePresence>
        {mediaBloqueada && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm text-center"
          >
            {mediaBloqueada}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel lugares recomendados */}
      <AnimatePresence>
        {lugares.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-green-200 bg-green-50 overflow-hidden"
          >
            <button
              onClick={() => setLugaresExpandido((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2 font-semibold text-green-800">
                <MapPin className="w-4 h-4 text-green-600" />
                {lugares.length} lugares recomendados para ustedes
              </span>
              <ChevronDown
                className={`w-4 h-4 text-green-600 transition-transform ${lugaresExpandido ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {lugaresExpandido && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pb-3 space-y-2"
                >
                  {lugares.map((l: any, i: number) => (
                    <a
                      key={i}
                      href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(l.nombre + " " + (l.direccion || ""))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow active:scale-95"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{l.nombre}</p>
                        <p className="text-xs text-gray-500">{l.direccion}</p>
                        {l.descripcion && (
                          <p className="text-xs text-gray-400 mt-0.5">{l.descripcion}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-green-600 font-medium flex-shrink-0 mt-0.5">
                        Ver mapa →
                      </span>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4"
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <p className="text-gray-700 font-semibold">¡Empezá la conversación!</p>
            <p className="text-xs text-gray-400 mt-1">La IA analiza la conexión cada 5 mensajes</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            {msg.tipo === "texto" && (
              <div
                className={`max-w-[75%] px-4 py-2.5 shadow-sm ${
                  msg.sender === "me"
                    ? "bg-purple-600 text-white rounded-2xl rounded-br-md"
                    : "bg-white text-gray-900 rounded-2xl rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    msg.sender === "me" ? "text-purple-200" : "text-gray-400"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            )}

            {msg.tipo === "foto" && (
              <div
                className={`max-w-[65%] rounded-2xl overflow-hidden shadow-sm ${
                  msg.sender === "me" ? "rounded-br-md" : "rounded-bl-md"
                }`}
              >
                <img src={msg.url} alt="Foto" className="w-full object-cover" />
                <p
                  className={`text-[10px] px-3 py-1 text-right ${
                    msg.sender === "me" ? "bg-purple-600 text-purple-200" : "bg-white text-gray-400"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            )}

            {msg.tipo === "audio" && (
              <AudioBurbuja url={msg.url!} sender={msg.sender} time={msg.time} />
            )}

            {msg.tipo === "video" && (
              <div
                className={`max-w-[65%] rounded-2xl overflow-hidden shadow-sm ${
                  msg.sender === "me" ? "rounded-br-md" : "rounded-bl-md"
                }`}
              >
                <video controls src={msg.url} className="w-full rounded-2xl" />
                <p
                  className={`text-[10px] px-3 py-1 text-right ${
                    msg.sender === "me" ? "bg-purple-600 text-purple-200" : "bg-white text-gray-400"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex gap-2 mb-2">
          <button
            onMouseDown={iniciarGrabacion}
            onMouseUp={detenerGrabacion}
            onTouchStart={iniciarGrabacion}
            onTouchEnd={detenerGrabacion}
            disabled={nivel < 3 || uploadingMedia}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              grabandoAudio
                ? "bg-red-500 text-white animate-pulse"
                : nivel >= 3
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {grabandoAudio ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            {grabandoAudio ? "Grabando..." : nivel >= 3 ? "Audio" : "🔒 Nivel 3"}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={nivel < 4 || uploadingMedia}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              nivel >= 4
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Image className="w-3 h-3" />
            {nivel >= 4 ? "Foto" : "🔒 Nivel 4"}
          </button>

          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={nivel < 5 || uploadingMedia}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              nivel >= 5
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Video className="w-3 h-3" />
            {nivel >= 5 ? "Video" : "🔒 Nivel 5"}
          </button>

          {uploadingMedia && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
              Subiendo...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) subirMedia(f, "foto");
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) subirMedia(f, "video");
          e.target.value = "";
        }}
      />

      <AnimatePresence>
        {mostrarBloquear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bloquear usuario</h2>
              <p className="text-gray-500 mb-6">
                Este usuario no podrá ver tu perfil ni aparecerá en tus sugerencias.
              </p>
              <button
                onClick={handleBloquear}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold hover:bg-red-600 transition-colors mb-3"
              >
                Sí, bloquear
              </button>
              <button
                onClick={() => setMostrarBloquear(false)}
                className="w-full text-gray-400 text-sm hover:text-gray-600"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Información</h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {tienefoto ? (
                <img
                  src={perfilOtro.foto_url}
                  alt="Foto"
                  className="w-32 h-32 mx-auto rounded-2xl object-cover mb-4"
                  style={{ filter: esBorrosa ? `blur(8px)` : "none" }}
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-5xl font-bold mb-4">
                  {perfilOtro?.nombre?.[0] || "?"}
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-purple-600 font-medium">Nivel {nivel} de conexión</p>
                <p className="text-sm text-gray-500 mt-1">{razon}</p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-gray-700">Próximos desbloqueos:</p>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    nivel >= 3 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  {nivel >= 3 ? "✅ Audios desbloqueados" : "🔒 Audios — Nivel 3"}
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    nivel >= 4 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <Image className="w-3 h-3" />
                  {nivel >= 4 ? "✅ Fotos desbloqueadas" : "🔒 Fotos — Nivel 4"}
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    nivel >= 5 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <Video className="w-3 h-3" />
                  {nivel >= 5 ? "✅ Videos desbloqueados" : "🔒 Videos — Nivel 5"}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-900">
                  💡 A mayor conexión, más información se revela automáticamente.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Burbuja de mensaje de audio con controles de reproducción.
 * Muestra barra de progreso clickeable, tiempo transcurrido y duración total.
 * Usa un elemento <audio> nativo con ref para controlar reproducción.
 */
function AudioBurbuja({ url, sender, time }: { url: string; sender: "me" | "them"; time: string }) {
  const [playing, setPlaying] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTiempo = (seg: number) => {
    if (!seg || isNaN(seg) || !isFinite(seg)) return "0:00";
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        sender === "me"
          ? "bg-purple-600 text-white rounded-br-sm"
          : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
      }`}
    >
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => {
          if (audioRef.current) setProgreso(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuracion(audioRef.current.duration);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgreso(0);
        }}
      />

      <div className="flex items-center gap-3 min-w-[180px]">
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            sender === "me" ? "bg-white/20 hover:bg-white/30" : "bg-purple-100 hover:bg-purple-200"
          } transition-colors`}
        >
          {playing ? (
            <svg
              className={`w-4 h-4 ${sender === "me" ? "text-white" : "text-purple-600"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              className={`w-4 h-4 ml-0.5 ${sender === "me" ? "text-white" : "text-purple-600"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div
            className={`w-full h-1.5 rounded-full cursor-pointer ${
              sender === "me" ? "bg-white/30" : "bg-gray-200"
            }`}
            onClick={(e) => {
              if (!audioRef.current || !duracion) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              audioRef.current.currentTime = pct * duracion;
              setProgreso(pct * duracion);
            }}
          >
            <div
              className={`h-full rounded-full transition-all ${
                sender === "me" ? "bg-white" : "bg-purple-600"
              }`}
              style={{ width: duracion ? `${(progreso / duracion) * 100}%` : "0%" }}
            />
          </div>
          <div
            className={`flex justify-between text-xs mt-1 ${
              sender === "me" ? "text-purple-200" : "text-gray-400"
            }`}
          >
            <span>{formatTiempo(progreso)}</span>
            <span>{duracion > 0 ? formatTiempo(duracion) : "..."}</span>
          </div>
        </div>

        <Mic
          className={`w-4 h-4 flex-shrink-0 ${
            sender === "me" ? "text-purple-200" : "text-gray-400"
          }`}
        />
      </div>

      <p className={`text-xs mt-1 ${sender === "me" ? "text-purple-200" : "text-gray-500"}`}>
        {time}
      </p>
    </div>
  );
}