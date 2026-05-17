import { motion } from "motion/react";
import { Sparkles, Heart, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">REVEAL</h1>
          <p className="text-white/80 text-lg">Conexiones reales, reveladas gradualmente</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 space-y-4"
        >
          <Feature icon={<Heart />} text="Conoce por personalidad, no por apariencia" />
          <Feature icon={<Shield />} text="Privacidad progresiva con IA" />
          <Feature icon={<Zap />} text="Matches inteligentes según tus gustos" />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/register")}
            className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl"
          >
            Comenzar
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-white/10 backdrop-blur-lg text-white py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all"
          >
            Ya tengo cuenta
          </button>
        </motion.div>

        <p className="text-white/60 text-sm text-center mt-6">
          Solo para estudiantes universitarios verificados
        </p>
      </motion.div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}