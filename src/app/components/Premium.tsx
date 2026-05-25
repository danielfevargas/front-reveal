import { motion } from "motion/react";
import { Check, Eye, Users, MessageCircle, Heart, Crown, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router";

const PLAN_PLUS = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Matches ilimitados",
    description: "Sin límite diario de conversaciones nuevas",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Ver otras universidades",
    description: "Conecta con estudiantes de cualquier universidad del país",
  },
];

const PLAN_PREMIUM = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Matches ilimitados",
    description: "Sin límite diario de conversaciones nuevas",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Ver otras universidades",
    description: "Conecta con estudiantes de cualquier universidad del país",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Confirmación de lectura",
    description: "Sabé si la otra persona leyó tu mensaje ✓✓",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "3 Super Likes por día",
    description: "Destacate ante alguien especial antes de que la IA los conecte",
  },
];

/**
 * Pantalla de planes de suscripción.
 *
 * Planes disponibles:
 *   REVEAL Plus    ($9.900/mes)  — Matches ilimitados + otras universidades
 *   REVEAL Premium ($19.900/mes) — Plus + confirmación de lectura + Super Likes
 *
 * Incluye tabla comparativa Gratis vs Plus vs Premium.
 * Los botones de compra aún no tienen integración de pagos.
 */
export function Premium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Premium</span>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">REVEAL Premium</h1>
          <p className="text-gray-600">Potenciá tus conexiones auténticas</p>
        </motion.div>

        {/* Plan Plus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 mb-4 shadow-sm border-2 border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">REVEAL Plus</h2>
              <p className="text-gray-500 text-sm">Para empezar</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-600">$9.900</span>
                <span className="text-gray-400 text-sm">/mes</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {PLAN_PLUS.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full bg-purple-100 text-purple-700 py-3 rounded-2xl font-semibold hover:bg-purple-200 transition-all">
            Elegir Plus
          </button>
        </motion.div>

        {/* Plan Premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">REVEAL Premium</h2>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Recomendado</span>
              </div>
              <p className="text-purple-200 text-sm">La experiencia completa</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$19.900</span>
                <span className="text-purple-200 text-sm">/mes</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {PLAN_PREMIUM.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-purple-200">{feature.description}</p>
                </div>
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full bg-white text-purple-600 py-3 rounded-2xl font-semibold hover:bg-purple-50 transition-all shadow-xl">
            Elegir Premium
          </button>

          <p className="text-center text-purple-200 text-xs mt-3">
            ✨ 7 días de prueba gratis · Cancela cuando quieras
          </p>
        </motion.div>

        {/* Comparación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Gratis vs Plus vs Premium
          </h3>
          <div className="space-y-3">
            <ComparisonRow feature="Matches diarios" free="5" plus="Ilimitados" premium="Ilimitados" />
            <ComparisonRow feature="Otras universidades" free="❌" plus="✅" premium="✅" />
            <ComparisonRow feature="Confirmación lectura" free="❌" plus="❌" premium="✅" />
            <ComparisonRow feature="Super Likes" free="❌" plus="❌" premium="3/día" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ComparisonRow({
  feature, free, plus, premium
}: {
  feature: string; free: string; plus: string; premium: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{feature}</span>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 w-16 text-center">{free}</span>
        <span className="text-xs text-purple-500 w-16 text-center">{plus}</span>
        <span className="text-xs font-semibold text-purple-700 w-16 text-center">{premium}</span>
      </div>
    </div>
  );
}
