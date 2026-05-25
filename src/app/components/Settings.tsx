import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, User, Bell, Shield, CreditCard, HelpCircle,
  LogOut, Crown, ChevronRight, Mail, Lock, Eye, Globe,
  Smartphone, Heart, GraduationCap, Calendar,
} from "lucide-react";
import { userService } from "../../services/api";

/**
 * Pantalla de configuración y preferencias del usuario.
 *
 * Secciones:
 *   - Cuenta: editar perfil, email, contraseña, 2FA
 *   - Preferencias de búsqueda: filtros de matching (universidad, rango de edad, visibilidad de edad)
 *   - Privacidad y Seguridad: toggles de revelación progresiva e incógnito
 *   - Notificaciones: toggles de distintos tipos de alerta
 *   - Suscripción: plan actual y acceso a Premium
 *   - Soporte y Legal: ayuda, términos, privacidad
 *
 * Las preferencias de búsqueda son persistidas en el backend (user-service)
 * y usadas por GetMatches para filtrar candidatos.
 */
export function Settings() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "";
  const email = localStorage.getItem("email") || "tu@universidad.edu.co";

  const [soloMiUniversidad, setSoloMiUniversidad] = useState(false);
  const [edadMinima, setEdadMinima] = useState(16);
  const [edadMaxima, setEdadMaxima] = useState(30);
  const [mostrarEdad, setMostrarEdad] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const resp = await userService.obtenerPreferencias(userId);
        console.log("Preferencias cargadas:", resp.data);
        const p = resp.data.data;
        if (p) {
          setSoloMiUniversidad(p.solo_mi_universidad ?? false);
          setEdadMinima(p.edad_minima ?? 16);
          setEdadMaxima(p.edad_maxima ?? 30);
          setMostrarEdad(p.mostrar_mi_edad ?? true);
        }
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      } finally {
        setCargando(false);
      }
    };
    if (userId) cargar();
  }, [userId]);

  const guardar = async () => {
    if (edadMaxima < edadMinima) {
      setMensaje("❌ La edad máxima no puede ser menor a la mínima");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }
    setGuardando(true);
    try {
      const resp = await userService.actualizarPreferencias(userId, {
        solo_mi_universidad: soloMiUniversidad,
        edad_minima: edadMinima,
        edad_maxima: edadMaxima,
        mostrar_mi_edad: mostrarEdad,
      });
      console.log("Preferencias guardadas:", resp.data);
      setMensaje("✅ Preferencias guardadas");
    } catch (error) {
      console.error("Error guardando:", error);
      setMensaje("❌ Error al guardar");
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <span className="font-semibold text-gray-900">Configuración</span>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 pb-20">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/premium")}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 mb-6 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Actualizar a Premium</h3>
                <p className="text-white/90 text-sm">Matches ilimitados, Fast Reveal y más</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Cuenta</h3>
          </div>
          <SettingItem icon={<User className="w-5 h-5" />} title="Editar Perfil" description="Nombre, bio, foto y más" onClick={() => navigate("/profile")} />
          <SettingItem icon={<Mail className="w-5 h-5" />} title="Email" description={email} verified />
          <SettingItem icon={<Lock className="w-5 h-5" />} title="Cambiar Contraseña" description="Actualizar tu contraseña" />
          <SettingItem icon={<Smartphone className="w-5 h-5" />} title="Verificación en Dos Pasos" description="Aumenta la seguridad de tu cuenta" toggle toggleValue={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Preferencias de búsqueda</h3>
            <p className="text-xs text-gray-500 mt-1">Define quién aparece en tus sugerencias</p>
          </div>

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Solo mi universidad</h4>
                <p className="text-sm text-gray-600">
                  {soloMiUniversidad ? "Solo ves personas de tu universidad" : "Ves personas de todas las universidades"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSoloMiUniversidad(!soloMiUniversidad)}
              className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-4 relative ${soloMiUniversidad ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${soloMiUniversidad ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Rango de edad</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Mostrar personas entre{" "}
                  <span className="font-semibold text-purple-600">{edadMinima}</span>
                  {" "}y{" "}
                  <span className="font-semibold text-purple-600">{edadMaxima}</span>
                  {" "}años
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Edad mínima</span>
                      <span className="font-semibold text-purple-600">{edadMinima} años</span>
                    </div>
                    <input
                      type="range" min={16} max={edadMaxima} value={edadMinima}
                      onChange={(e) => setEdadMinima(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>16</span><span>{edadMaxima}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Edad máxima</span>
                      <span className="font-semibold text-purple-600">{edadMaxima} años</span>
                    </div>
                    <input
                      type="range" min={edadMinima} max={60} value={edadMaxima}
                      onChange={(e) => setEdadMaxima(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{edadMinima}</span><span>60</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Mostrar mi edad</h4>
                <p className="text-sm text-gray-600">
                  {mostrarEdad ? "Tu edad es visible para otros" : "Tu edad está oculta"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMostrarEdad(!mostrarEdad)}
              className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-4 relative ${mostrarEdad ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${mostrarEdad ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="px-6 py-4">
            {mensaje && (
              <p className={`text-sm text-center mb-3 font-medium ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                {mensaje}
              </p>
            )}
            <button
              onClick={guardar}
              disabled={guardando}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : "Guardar preferencias"}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Privacidad y Seguridad</h3>
          </div>
          <SettingItem icon={<Shield className="w-5 h-5" />} title="Revelación Progresiva" description="Tu perfil se revela gradualmente" toggle toggleValue={true} />
          <SettingItem icon={<Globe className="w-5 h-5" />} title="Modo Incógnito" description="Navega sin aparecer en sugerencias" toggle toggleValue={false} premium />
          <SettingItem icon={<Heart className="w-5 h-5" />} title="Mostrar Distancia" description="Muestra qué tan cerca están los matches" toggle toggleValue={true} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          </div>
          <SettingItem icon={<Bell className="w-5 h-5" />} title="Nuevos Matches" description="Recibe notificaciones de nuevos matches" toggle toggleValue={true} />
          <SettingItem icon={<Bell className="w-5 h-5" />} title="Mensajes" description="Notificaciones de nuevos mensajes" toggle toggleValue={true} />
          <SettingItem icon={<Bell className="w-5 h-5" />} title="Sugerencias de IA" description="Recibe recomendaciones personalizadas" toggle toggleValue={true} />
          <SettingItem icon={<Bell className="w-5 h-5" />} title="Eventos Universitarios" description="Notificaciones de eventos en tu campus" toggle toggleValue={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Suscripción</h3>
          </div>
          <SettingItem icon={<CreditCard className="w-5 h-5" />} title="Plan Actual" description="Plan Gratuito" onClick={() => navigate("/premium")} />
          <SettingItem icon={<Crown className="w-5 h-5" />} title="Actualizar a Premium" description="Desbloquea todas las funciones" onClick={() => navigate("/premium")} highlight />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Soporte y Legal</h3>
          </div>
          <SettingItem icon={<HelpCircle className="w-5 h-5" />} title="Centro de Ayuda" description="Preguntas frecuentes y guías" />
          <SettingItem icon={<Shield className="w-5 h-5" />} title="Términos y Condiciones" description="Lee nuestros términos de servicio" />
          <SettingItem icon={<Shield className="w-5 h-5" />} title="Política de Privacidad" description="Cómo protegemos tus datos" />
          <SettingItem icon={<Mail className="w-5 h-5" />} title="Contactar Soporte" description="support@reveal.app" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button
            onClick={handleCerrarSesion}
            className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-3 text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
          <p className="text-center text-gray-400 text-sm mt-6">
            REVEAL v1.0.0 • Hecho con 💜 para conexiones auténticas
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/** Fila reutilizable para las secciones de configuración */
function SettingItem({
  icon, title, description, onClick, toggle = false,
  toggleValue = false, verified = false, premium = false, highlight = false,
}: {
  icon: React.ReactNode; title: string; description: string;
  onClick?: () => void; toggle?: boolean; toggleValue?: boolean;
  verified?: boolean; premium?: boolean; highlight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`px-6 py-4 border-b border-gray-100 last:border-0 flex items-center justify-between ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      } transition-colors ${highlight ? "bg-purple-50" : ""}`}
    >
      <div className="flex items-start gap-4 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          highlight ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {verified && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verificado</span>
            )}
            {premium && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />Premium
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {toggle ? (
        <div className={`w-12 h-7 rounded-full transition-colors ${toggleValue ? "bg-purple-600" : "bg-gray-300"} relative flex-shrink-0 ml-4`}>
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${toggleValue ? "translate-x-6" : "translate-x-1"}`} />
        </div>
      ) : onClick ? (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
      ) : null}
    </div>
  );
}
