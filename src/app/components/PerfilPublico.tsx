import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Heart, X, MessageCircle, ShieldOff, Lock, CheckCircle, GraduationCap, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { userService } from "../../services/api";

const NIVEL_DESBLOQUEOS = [
  { nivel: 1, emoji: "🏫", label: "Universidad" },
  { nivel: 2, emoji: "💬", label: "Bio y prompt" },
  { nivel: 3, emoji: "👤", label: "Nombre y carrera" },
  { nivel: 4, emoji: "📸", label: "Foto real" },
  { nivel: 5, emoji: "✨", label: "Perfil completo" },
];

/**
 * Pantalla de perfil ajeno con privacidad progresiva.
 *
 * Al cargar:
 *  1. Consulta el nivel de la sala entre el usuario actual y el perfil visto.
 *  2. Llama a user-service con ese nivel para obtener solo los campos que
 *     corresponden revelar.
 *
 * Niveles de revelación:
 *   Nivel 1 → Solo universidad (anónimo)
 *   Nivel 2 → Bio, prompt y foto con blur fuerte
 *   Nivel 3 → Primer nombre, carrera, foto con blur suave
 *   Nivel 4 → Nombre completo, foto real
 *   Nivel 5 → Perfil completo + galería de fotos adicionales
 *
 * Acciones disponibles:
 *   - Like (con límite de 5 diarios en plan free)
 *   - Ir al chat (si hay match mutuo)
 *   - Bloquear usuario
 *   - Visor de fotos tipo lightbox (nivel 5)
 */
export function PerfilPublico() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarMatch, setMostrarMatch] = useState(false);
  const [mostrarLimite, setMostrarLimite] = useState(false);
  const [mostrarBloquear, setMostrarBloquear] = useState(false);
  const [esMatch, setEsMatch] = useState(false);
  const [nivelSala, setNivelSala] = useState(1);
  const [fotoVisor, setFotoVisor] = useState<number | null>(null);

  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    const cargar = async () => {
      try {
        let nivel = 1;
        try {
          const salaId = [userId, id].sort().join('_');
          const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat/sala/${salaId}`);
          if (resp.ok) {
            const data = await resp.json();
            nivel = data.nivel || 1;
          }
        } catch { /* sin sala aún */ }

        setNivelSala(nivel);
        const resp = await userService.obtenerPerfilConNivel(id!, nivel);
        setPerfil({ ...resp.data.data, nivel_conexion: nivel });
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) cargar();
  }, [id, userId]);

  const handleLike = async () => {
    try {
      const resp = await userService.darLike(userId, id!);
      if (resp.data.limite) { setMostrarLimite(true); return; }
      setEsMatch(resp.data.data.match);
      setMostrarMatch(true);
    } catch (error: any) {
      if (error.response?.data?.limite) setMostrarLimite(true);
    }
  };

  const handleBloquear = async () => {
    try {
      await userService.bloquearUsuario(userId, id!);
      setMostrarBloquear(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error bloqueando:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-600 text-sm">Cargando perfil...</p>
      </div>
    </div>
  );

  const fotoDesbloqueada = nivelSala >= 4;
  const nombreVisible = nivelSala >= 2;
  const infoVisible = nivelSala >= 2;
  const todoVisible = nivelSala >= 5;
  const esMatchMutuo = nivelSala >= 2;

  const fotos: string[] = perfil?.fotos?.length > 0
    ? perfil.fotos
    : (perfil?.foto_url ? [perfil.foto_url] : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-8">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Perfil</span>
          <button onClick={() => setMostrarBloquear(true)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors">
            <ShieldOff className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Banner nivel */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Nivel de conexión</span>
            <span className="font-bold text-lg">Nivel {nivelSala} / 5</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(nivelSala / 5) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-white h-full rounded-full"
            />
          </div>
          <div className="flex justify-between">
            {NIVEL_DESBLOQUEOS.map(item => (
              <div key={item.nivel} className="flex flex-col items-center gap-1">
                <div className={`text-base ${nivelSala >= item.nivel ? "opacity-100" : "opacity-30"}`}>
                  {nivelSala >= item.nivel ? <CheckCircle className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-white" />}
                </div>
                <span className={`text-[10px] ${nivelSala >= item.nivel ? "text-white" : "text-white/40"}`}>
                  {item.emoji}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Foto principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="relative h-72 bg-gradient-to-br from-purple-400 to-indigo-400">
            {perfil?.foto_url ? (
              <img
                src={perfil.foto_url}
                alt="Foto"
                className="w-full h-full object-cover"
                style={{
                  filter: fotoDesbloqueada ? 'none' : 'blur(7px)',
                  transform: fotoDesbloqueada ? 'none' : 'scale(1.1)'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-8xl font-bold opacity-20">?</div>
            )}

            {!fotoDesbloqueada && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                  <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Foto bloqueada</p>
                  <p className="text-white/70 text-xs mt-1">Se desbloquea en nivel 4</p>
                </div>
              </div>
            )}

            {perfil?.compatibilidad && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-purple-700 font-bold text-sm">{perfil.compatibilidad}% compatible</span>
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Nombre e info básica */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {nombreVisible ? (perfil?.nombre || "Usuario") : "Usuario anónimo"}
              </h2>

              <div className="flex flex-wrap gap-2 mt-2">
                {(nivelSala >= 3 ? perfil?.universidad : null) && (
                  <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {perfil.universidad}
                  </span>
                )}
                {nivelSala < 3 && (
                  <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {perfil?.universidad || "Universidad 🔒"}
                  </span>
                )}
                {nivelSala >= 3 && perfil?.carrera && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    📚 {perfil.carrera}
                  </span>
                )}
                {todoVisible && perfil?.edad && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    🎂 {perfil.edad} años
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {infoVisible && perfil?.bio && (
              <p className="text-gray-700 text-sm leading-relaxed mb-4 bg-gray-50 rounded-2xl p-4">
                {perfil.bio}
              </p>
            )}

            {/* Prompt */}
            {infoVisible && perfil?.prompt_pregunta && perfil?.prompt_respuesta && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-purple-100">
                <p className="text-purple-600 text-xs font-semibold mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {perfil.prompt_pregunta}
                </p>
                <p className="text-gray-800 font-medium text-sm">"{perfil.prompt_respuesta}"</p>
              </div>
            )}

            {/* Intereses en común */}
            {perfil?.intereses_comunes?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">En común</p>
                <div className="flex flex-wrap gap-2">
                  {perfil.intereses_comunes.map((interes: string) => (
                    <span key={interes} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium">
                      {interes}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje de qué falta desbloquear */}
            {!infoVisible && (
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Lock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm font-medium">Seguí chateando para revelar más</p>
                <p className="text-gray-400 text-xs mt-1">Al nivel 2 se desbloquea la bio y el prompt</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Galería de fotos adicionales — solo nivel 5 */}
        {todoVisible && fotos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-gray-900">Fotos ({fotos.length})</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Nivel 5 desbloqueado</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setFotoVisor(index)}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                >
                  <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Próximos desbloqueos */}
        {nivelSala < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Próximos desbloqueos</h3>
            <div className="space-y-2">
              {NIVEL_DESBLOQUEOS.filter(d => d.nivel > nivelSala).map(item => (
                <div key={item.nivel} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">Se desbloquea en nivel {item.nivel}</p>
                  </div>
                  <Lock className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Botones acción */}
        {esMatchMutuo ? (
          <button
            onClick={() => navigate(`/chat/${id}`)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-semibold text-white hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Ir al chat
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-4 bg-white rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Pasar
            </button>
            <button
              onClick={handleLike}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-semibold text-white hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Match ❤️
            </button>
          </div>
        )}
      </div>

      {/* Visor de fotos */}
      <AnimatePresence>
        {fotoVisor !== null && fotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFotoVisor(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={fotos[fotoVisor]}
              alt="Foto"
              className="max-w-full max-h-full rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            {fotos.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setFotoVisor((fotoVisor - 1 + fotos.length) % fotos.length); }}
                  className="absolute left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setFotoVisor((fotoVisor + 1) % fotos.length); }}
                  className="absolute right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            <button
              onClick={() => setFotoVisor(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <AnimatePresence>
        {mostrarBloquear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bloquear usuario</h2>
              <p className="text-gray-500 mb-6">Este usuario no podrá ver tu perfil ni aparecerá en tus sugerencias.</p>
              <button onClick={handleBloquear} className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold hover:bg-red-600 transition-colors mb-3">Sí, bloquear</button>
              <button onClick={() => setMostrarBloquear(false)} className="w-full text-gray-400 text-sm hover:text-gray-600">Cancelar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarLimite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Límite alcanzado</h2>
              <p className="text-gray-500 mb-6">Alcanzaste los 5 likes diarios del plan gratuito.</p>
              <button onClick={() => navigate("/premium")} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold hover:bg-purple-700 transition-colors mb-3">👑 Ver Premium</button>
              <button onClick={() => setMostrarLimite(false)} className="w-full text-gray-400 text-sm hover:text-gray-600">Cerrar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
              {esMatch ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Es un Match!</h2>
                  <p className="text-gray-500 mb-6">Los dos se dieron like. ¡Empiecen a chatear!</p>
                  <button onClick={() => navigate(`/chat/${id}`)} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" /> Chatear ahora
                  </button>
                  <button onClick={() => navigate("/dashboard")} className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600">Volver</button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">💜</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Like enviado!</h2>
                  <p className="text-gray-500 mb-6">Si la otra persona también te da like, ¡será un Match!</p>
                  <button onClick={() => navigate("/dashboard")} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold hover:bg-purple-700 transition-colors">Volver</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
