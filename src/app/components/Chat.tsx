import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send, Info, Sparkles, Lock, Unlock } from "lucide-react";

const MESSAGES = [
  { id: 1, text: "Hola! Vi que también te gusta el café ☕", sender: "them", time: "10:30" },
  { id: 2, text: "Sí! Me encanta. ¿Tienes algún lugar favorito?", sender: "me", time: "10:32" },
  {
    id: 3,
    text: "Hay uno cerca de la universidad que tiene el mejor capuchino",
    sender: "them",
    time: "10:33",
  },
  { id: 4, text: "Suena genial! También me gusta la fotografía, vi que lo tienes en tu perfil", sender: "me", time: "10:35" },
  {
    id: 5,
    text: "Sí! Llevo mi cámara a todos lados. ¿Qué tipo de fotos te gusta tomar?",
    sender: "them",
    time: "10:36",
  },
];

const MATCH_DATA = {
  1: {
    name: "María",
    revealStage: 45,
    blurLevel: 80,
    university: "Universidad de los Andes",
    compatibility: 87,
    unlockedInfo: ["Nombre", "Intereses comunes"],
    lockedInfo: ["Foto completa", "Edad", "Carrera", "Redes sociales"],
  },
  2: {
    name: "Carlos",
    revealStage: 65,
    blurLevel: 60,
    university: "Universidad Nacional",
    compatibility: 92,
    unlockedInfo: ["Nombre", "Intereses comunes", "Universidad"],
    lockedInfo: ["Foto completa", "Edad", "Carrera"],
  },
};

export function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const matchData = MATCH_DATA[id as keyof typeof MATCH_DATA] || MATCH_DATA[1];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: message,
          sender: "me",
          time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Blurred avatar */}
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg"
              style={{ filter: `blur(${matchData.blurLevel / 20}px)` }}
            >
              {matchData.name[0]}
            </div>
            {matchData.revealStage < 75 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">{matchData.name}</h3>
            <p className="text-xs text-gray-500">Revelación {matchData.revealStage}%</p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Info className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* AI Progress Banner */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white overflow-hidden"
      >
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <p>
            ¡La IA detecta buena conexión! Sigue conversando para revelar más información.
            <span className="font-semibold ml-1">+5% en 10 mensajes</span>
          </p>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${matchData.revealStage}%` }}
            className="bg-white h-full rounded-full"
          />
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.sender === "me"
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === "me" ? "text-purple-200" : "text-gray-500"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
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

      {/* Info Sidebar */}
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
                <h3 className="text-lg font-bold text-gray-900">Información de Perfil</h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Profile preview */}
              <div className="mb-6">
                <div
                  className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-5xl font-bold mb-4"
                  style={{ filter: `blur(${matchData.blurLevel / 20}px)` }}
                >
                  {matchData.name[0]}
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{matchData.name}</h4>
                  <p className="text-sm text-purple-600 font-medium">
                    {matchData.compatibility}% compatible
                  </p>
                </div>
              </div>

              {/* Unlocked info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-green-600" />
                  Información desbloqueada
                </h4>
                <div className="space-y-2">
                  {matchData.unlockedInfo.map((info) => (
                    <div key={info} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {info}
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Bloqueado
                </h4>
                <div className="space-y-2">
                  {matchData.lockedInfo.map((info) => (
                    <div key={info} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      {info}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-900">
                  💡 Sigue conversando para desbloquear más información. La IA analizará la
                  calidad de tu conexión.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
