import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Crown,
  ChevronRight,
  Mail,
  Lock,
  Eye,
  Globe,
  Smartphone,
  Heart,
} from "lucide-react";

export function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
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
        {/* Premium Banner */}
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
                <h3 className="text-white font-bold text-lg mb-1">
                  Actualizar a Premium
                </h3>
                <p className="text-white/90 text-sm">
                  Matches ilimitados, Fast Reveal y más
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Cuenta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Cuenta</h3>
          </div>
          <SettingItem
            icon={<User className="w-5 h-5" />}
            title="Editar Perfil"
            description="Nombre, bio, foto y más"
            onClick={() => navigate("/profile")}
          />
          <SettingItem
            icon={<Mail className="w-5 h-5" />}
            title="Email"
            description="sofia.garcia@uniandes.edu.co"
            verified
          />
          <SettingItem
            icon={<Lock className="w-5 h-5" />}
            title="Cambiar Contraseña"
            description="Actualizar tu contraseña"
          />
          <SettingItem
            icon={<Smartphone className="w-5 h-5" />}
            title="Verificación en Dos Pasos"
            description="Aumenta la seguridad de tu cuenta"
            toggle
            toggleValue={false}
          />
        </motion.div>

        {/* Privacidad */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Privacidad y Seguridad</h3>
          </div>
          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            title="Revelación Progresiva"
            description="Tu perfil se revela gradualmente"
            toggle
            toggleValue={true}
          />
          <SettingItem
            icon={<Eye className="w-5 h-5" />}
            title="Visible Para"
            description="Solo mi universidad"
          />
          <SettingItem
            icon={<Globe className="w-5 h-5" />}
            title="Modo Incógnito"
            description="Navega sin aparecer en sugerencias"
            toggle
            toggleValue={false}
            premium
          />
          <SettingItem
            icon={<Heart className="w-5 h-5" />}
            title="Mostrar Distancia"
            description="Muestra qué tan cerca están los matches"
            toggle
            toggleValue={true}
          />
        </motion.div>

        {/* Notificaciones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          </div>
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            title="Nuevos Matches"
            description="Recibe notificaciones de nuevos matches"
            toggle
            toggleValue={true}
          />
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            title="Mensajes"
            description="Notificaciones de nuevos mensajes"
            toggle
            toggleValue={true}
          />
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            title="Sugerencias de IA"
            description="Recibe recomendaciones personalizadas"
            toggle
            toggleValue={true}
          />
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            title="Eventos Universitarios"
            description="Notificaciones de eventos en tu campus"
            toggle
            toggleValue={false}
          />
        </motion.div>

        {/* Suscripción */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Suscripción</h3>
          </div>
          <SettingItem
            icon={<CreditCard className="w-5 h-5" />}
            title="Plan Actual"
            description="Plan Gratuito"
            onClick={() => navigate("/premium")}
          />
          <SettingItem
            icon={<Crown className="w-5 h-5" />}
            title="Actualizar a Premium"
            description="Desbloquea todas las funciones"
            onClick={() => navigate("/premium")}
            highlight
          />
        </motion.div>

        {/* Soporte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Soporte y Legal</h3>
          </div>
          <SettingItem
            icon={<HelpCircle className="w-5 h-5" />}
            title="Centro de Ayuda"
            description="Preguntas frecuentes y guías"
          />
          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            title="Términos y Condiciones"
            description="Lee nuestros términos de servicio"
          />
          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            title="Política de Privacidad"
            description="Cómo protegemos tus datos"
          />
          <SettingItem
            icon={<Mail className="w-5 h-5" />}
            title="Contactar Soporte"
            description="support@reveal.app"
          />
        </motion.div>

        {/* Cerrar Sesión */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-3 text-red-600 font-medium hover:bg-red-50 transition-colors">
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

function SettingItem({
  icon,
  title,
  description,
  onClick,
  toggle = false,
  toggleValue = false,
  verified = false,
  premium = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  verified?: boolean;
  premium?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`px-6 py-4 border-b border-gray-100 last:border-0 flex items-center justify-between ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      } transition-colors ${highlight ? "bg-purple-50" : ""}`}
    >
      <div className="flex items-start gap-4 flex-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            highlight ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {verified && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Verificado
              </span>
            )}
            {premium && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {toggle ? (
        <div
          className={`w-12 h-7 rounded-full transition-colors ${
            toggleValue ? "bg-purple-600" : "bg-gray-300"
          } relative flex-shrink-0 ml-4`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              toggleValue ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
      ) : onClick ? (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
      ) : null}
    </div>
  );
}
