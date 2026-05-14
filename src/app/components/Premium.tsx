import { motion } from "motion/react";
import { Check, Zap, Eye, Filter, RotateCcw, TrendingUp, Crown, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast Reveal",
    description: "+50% velocidad de revelación progresiva",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Ver quién te dio like",
    description: "Descubre quién está interesado en ti",
  },
  {
    icon: <Filter className="w-6 h-6" />,
    title: "Filtros avanzados",
    description: "Filtra por carrera, año, intereses específicos",
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: "Rewind ilimitado",
    description: "Vuelve a ver perfiles que pasaste",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Boost mensual",
    description: "Aparece primero en las sugerencias",
  },
  {
    icon: <Crown className="w-6 h-6" />,
    title: "Badge Premium",
    description: "Destaca con un badge exclusivo",
  },
];

export function Premium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Sticky Header */}
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
          <p className="text-gray-600">Acelera tus conexiones auténticas</p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold">$4.99</span>
              <span className="text-purple-200">/mes</span>
            </div>
            <p className="text-purple-100">Cancela cuando quieras</p>
          </div>

          <button className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-xl">
            Empezar ahora
          </button>

          <p className="text-center text-purple-200 text-sm mt-4">
            ✨ 7 días de prueba gratis
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="ml-auto">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Comparación Gratis vs Premium
          </h3>
          <div className="space-y-3">
            <ComparisonRow feature="Matches por semana" free="5" premium="Ilimitado" />
            <ComparisonRow feature="Sugerencias de IA" free="3/semana" premium="Ilimitadas" />
            <ComparisonRow feature="Velocidad de revelación" free="Normal" premium="+50%" />
            <ComparisonRow feature="Ver likes" free="❌" premium="✅" />
            <ComparisonRow feature="Filtros avanzados" free="❌" premium="✅" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ComparisonRow({ feature, free, premium }: { feature: string; free: string; premium: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{feature}</span>
      <div className="flex items-center gap-8">
        <span className="text-sm text-gray-500 w-20 text-right">{free}</span>
        <span className="text-sm font-semibold text-purple-600 w-20 text-right">{premium}</span>
      </div>
    </div>
  );
}
