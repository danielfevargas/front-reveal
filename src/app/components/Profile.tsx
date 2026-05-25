import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Settings, Edit, Heart, ChevronLeft, ChevronRight,
  X, CheckCircle, Sparkles, Crown, GraduationCap, Camera, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "./BottomNav";
import { userService } from "../../services/api";

const CATEGORIA_ICONS: Record<string, string> = {
  musica: "🎵", deportes: "⚽", arte: "🎨", tecnologia: "💻",
  gastronomia: "🍕", viajes: "✈️", naturaleza: "🌿", cine: "🎬",
  libros: "📚", gaming: "🎮", moda: "👗", fotografia: "📸",
  fitness: "💪", ciencia: "🔬", politica: "🗳️", idiomas: "🌍",
};

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:    { label: "Gratis",   color: "bg-gray-100 text-gray-600" },
  plus:    { label: "Plus",     color: "bg-purple-100 text-purple-700" },
  premium: { label: "Premium",  color: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" },
};

function calcularCompletitud(perfil: any, intereses: any[]): number {
  let p = 0;
  if (perfil?.nombre) p += 20;
  if (perfil?.bio) p += 20;
  if (perfil?.foto_url || perfil?.fotos?.length > 0) p += 20;
  if (intereses.length >= 3) p += 20;
  if (perfil?.prompt_pregunta && perfil?.prompt_respuesta) p += 20;
  return p;
}

function CompletionRing({ percent, children }: { percent: number; children: React.ReactNode }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <motion.circle
          cx="72" cy="72" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (percent / 100) * circ }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<any>(null);
  const [intereses, setIntereses] = useState<any[]>([]);
  const [matchesMutuos, setMatchesMutuos] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotoVisor, setFotoVisor] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const cargar = async () => {
      try {
        const rPerfil = await userService.obtenerPerfil(userId);
        setPerfil(rPerfil.data.data);
      } catch (e) {
        console.error("Error cargando perfil:", e);
      } finally {
        setLoading(false);
      }

      // datos secundarios: si fallan no rompen la pantalla
      const [rIntereses, rMutuos, rMatches] = await Promise.allSettled([
        userService.obtenerIntereses(userId),
        userService.obtenerMatchesMutuos(userId),
        userService.obtenerMatches(userId),
      ]);
      if (rIntereses.status === "fulfilled") setIntereses(rIntereses.value.data.data || []);
      if (rMutuos.status === "fulfilled") setMatchesMutuos(rMutuos.value.data.data || []);
      if (rMatches.status === "fulfilled") setMatches(rMatches.value.data.data || []);
    };

    cargar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-600 font-medium text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const fotos: string[] = perfil?.fotos?.length > 0 ? perfil.fotos : (perfil?.foto_url ? [perfil.foto_url] : []);
  const completitud = calcularCompletitud(perfil, intereses);
  const inicial = perfil?.nombre?.[0]?.toUpperCase() || "?";
  const plan = perfil?.plan || "free";
  const planBadge = PLAN_BADGE[plan] || PLAN_BADGE.free;
  const miembroDesde = perfil?.creado_en
    ? new Date(perfil.creado_en).toLocaleDateString("es", { month: "long", year: "numeric" })
    : null;

  // Intereses agrupados por categoría
  const interesesPorCategoria = intereses.reduce((acc: Record<string, string[]>, i: any) => {
    const cat = i.categoria || "otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(i.tag);
    return acc;
  }, {});

  // Logros dinámicos
  const logros = [
    { emoji: "✅", label: "Verificado", activo: perfil?.verificado },
    { emoji: "💜", label: "Perfil completo", activo: completitud === 100 },
    { emoji: "❤️", label: "Primer match", activo: matchesMutuos.length >= 1 },
    { emoji: "💬", label: "Conversador", activo: matchesMutuos.length >= 3 },
    { emoji: "🔥", label: "Racha activa", activo: true },
    { emoji: "👑", label: "Premium", activo: plan !== "free" },
  ];

  const itemsIncompletos = [
    { campo: "Bio", completo: !!perfil?.bio, ruta: "/completar-perfil" },
    { campo: "Foto de perfil", completo: fotos.length > 0, ruta: "/completar-perfil" },
    { campo: "Intereses (mín. 3)", completo: intereses.length >= 3, ruta: "/completar-perfil" },
    { campo: "Prompt personal", completo: !!(perfil?.prompt_pregunta && perfil?.prompt_respuesta), ruta: "/completar-perfil" },
  ].filter(i => !i.completo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Mi Perfil</span>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-28 space-y-4">

        {/* Tarjeta principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >
          {/* Cover animado */}
          <div className="relative h-36 bg-gradient-to-br from-purple-600 via-indigo-500 to-purple-800 overflow-hidden">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-8 w-40 h-40 bg-white/10 rounded-full"
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full"
            />
            <div className="absolute bottom-3 right-4">
              <button
                onClick={() => navigate("/completar-perfil")}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
              >
                <Edit className="w-3 h-3" />
                Editar perfil
              </button>
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar + info principal */}
            <div className="flex items-end gap-4 -mt-16 mb-3">
              <CompletionRing percent={completitud}>
                {fotos.length > 0 ? (
                  <img
                    src={fotos[0]}
                    alt="Foto"
                    onClick={() => setFotoVisor(0)}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div
                    onClick={() => navigate("/completar-perfil")}
                    className="w-28 h-28 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl border-4 border-white shadow-xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity gap-1"
                  >
                    <span className="text-white text-3xl font-bold">{inicial}</span>
                    <Camera className="w-4 h-4 text-white/70" />
                  </div>
                )}
              </CompletionRing>

              <div className="flex-1 pb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {perfil?.nombre || "Sin nombre"}
                  </h2>
                  {perfil?.verificado && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${planBadge.color}`}>
                    {plan === "premium" && <Crown className="w-3 h-3 inline mr-1" />}
                    {planBadge.label}
                  </span>
                  {miembroDesde && (
                    <span className="text-xs text-gray-400">· Desde {miembroDesde}</span>
                  )}
                </div>
              </div>
            </div>

            {/* % completitud */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-600">Completitud del perfil</span>
                <span className={`text-xs font-bold ${completitud === 100 ? "text-green-600" : "text-purple-600"}`}>
                  {completitud}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completitud}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                  className={`h-full rounded-full ${completitud === 100 ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"}`}
                />
              </div>
            </div>

            {/* Info básica */}
            <div className="flex flex-wrap gap-2 mb-4">
              {perfil?.universidad && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{perfil.universidad}</span>
                </div>
              )}
              {perfil?.carrera && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <span>📚 {perfil.carrera}</span>
                </div>
              )}
              {perfil?.edad && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <span>🎂 {perfil.edad} años</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {perfil?.bio ? (
              <p className="text-gray-700 text-sm leading-relaxed mb-4 bg-gray-50 rounded-2xl p-4">
                {perfil.bio}
              </p>
            ) : (
              <button
                onClick={() => navigate("/completar-perfil")}
                className="w-full text-left mb-4 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Agregar una bio...
              </button>
            )}

            {/* Prompt */}
            {perfil?.prompt_pregunta && perfil?.prompt_respuesta ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100"
              >
                <p className="text-purple-600 text-xs font-semibold mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {perfil.prompt_pregunta}
                </p>
                <p className="text-gray-800 font-medium text-sm">"{perfil.prompt_respuesta}"</p>
              </motion.div>
            ) : (
              <button
                onClick={() => navigate("/completar-perfil")}
                className="w-full text-left border-2 border-dashed border-purple-100 rounded-2xl p-4 text-sm text-purple-300 hover:border-purple-300 hover:text-purple-500 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Agregar un prompt personal...
              </button>
            )}
          </div>
        </motion.div>

        {/* Alerta de completitud */}
        {itemsIncompletos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  Completá tu perfil para más matches
                </p>
                <div className="space-y-1.5">
                  {itemsIncompletos.map(item => (
                    <button
                      key={item.campo}
                      onClick={() => navigate(item.ruta)}
                      className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 transition-colors"
                    >
                      <div className="w-4 h-4 border-2 border-amber-400 rounded-full flex-shrink-0" />
                      {item.campo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard
            emoji="❤️"
            label="Matches"
            value={matchesMutuos.length.toString()}
            color="bg-red-50 text-red-500"
          />
          <StatCard
            emoji="✨"
            label="Sugerencias"
            value={matches.length.toString()}
            color="bg-purple-50 text-purple-500"
          />
          <StatCard
            emoji="🎯"
            label="Intereses"
            value={intereses.length.toString()}
            color="bg-blue-50 text-blue-500"
          />
        </motion.div>

        {/* Intereses */}
        {intereses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Mis intereses</h3>
              <button
                onClick={() => navigate("/completar-perfil")}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Editar
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(interesesPorCategoria).map(([cat, tags]) => (
                <div key={cat}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {CATEGORIA_ICONS[cat.toLowerCase()] || "✨"} {cat}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(tags as string[]).map(tag => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-xl text-sm font-medium capitalize"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/completar-perfil")}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-purple-200 flex flex-col items-center gap-2 hover:border-purple-400 transition-colors"
          >
            <span className="text-3xl">🎯</span>
            <p className="font-medium text-gray-700">Agregar intereses</p>
            <p className="text-xs text-gray-400">Los intereses mejoran tus matches hasta un 80%</p>
          </motion.button>
        )}

        {/* Fotos */}
        {fotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Mis fotos <span className="text-gray-400 font-normal text-sm">({fotos.length})</span>
              </h3>
              <button
                onClick={() => navigate("/completar-perfil")}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                Editar
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFotoVisor(index)}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm"
                >
                  <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate("/completar-perfil")}
                className="aspect-square rounded-xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-1 hover:border-purple-400 transition-colors"
              >
                <Camera className="w-5 h-5 text-purple-300" />
                <span className="text-xs text-purple-300">Agregar</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Logros */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Logros</h3>
          <div className="grid grid-cols-3 gap-3">
            {logros.map((logro, i) => (
              <motion.div
                key={logro.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`rounded-2xl p-3 text-center transition-all ${
                  logro.activo
                    ? "bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
                    : "bg-gray-50 opacity-40"
                }`}
              >
                <div className={`text-2xl mb-1 ${!logro.activo ? "grayscale" : ""}`}>
                  {logro.emoji}
                </div>
                <p className="text-xs font-medium text-gray-700 leading-tight">{logro.label}</p>
                {logro.activo && (
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mx-auto mt-1.5" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Badge verificación */}
        {perfil?.verificado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">Estudiante verificado</p>
              <p className="text-xs text-green-600">Tu carnet universitario fue verificado ✅</p>
            </div>
          </motion.div>
        )}

        {/* Banner Premium */}
        {plan === "free" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            onClick={() => navigate("/premium")}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 flex items-center justify-between hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Actualizar a Premium</p>
                <p className="text-white/75 text-xs">Matches ilimitados y más</p>
              </div>
            </div>
            <Heart className="w-5 h-5 text-white/70" />
          </motion.button>
        )}
      </div>

      <BottomNav />

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
              alt="Foto ampliada"
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

            <div className="absolute bottom-6 flex gap-2">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setFotoVisor(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === fotoVisor ? "bg-white w-5" : "bg-white/40"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ emoji, label, value, color }: {
  emoji: string; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2 text-xl`}>
        {emoji}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
