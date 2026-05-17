import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { userService } from "../../services/api";
import {
  Coffee,
  Gamepad,
  Mountain,
  Film,
  Music,
  Trophy,
  Laptop,
  BookOpen,
  Plane,
  Palette,
  Camera,
  PartyPopper,
  Lightbulb,
  Dumbbell,
  Tv,
  Pizza,
} from "lucide-react";

const INTERESTS = [
  { id: "food", label: "Comer", icon: Pizza },
  { id: "gaming", label: "Videojuegos", icon: Gamepad },
  { id: "hiking", label: "Senderismo", icon: Mountain },
  { id: "movies", label: "Cine", icon: Film },
  { id: "music", label: "Música", icon: Music },
  { id: "sports", label: "Deportes", icon: Trophy },
  { id: "tech", label: "Tecnología", icon: Laptop },
  { id: "study", label: "Estudiar en grupo", icon: BookOpen },
  { id: "travel", label: "Viajar", icon: Plane },
  { id: "art", label: "Arte", icon: Palette },
  { id: "photo", label: "Fotografía", icon: Camera },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "anime", label: "Anime", icon: Tv },
  { id: "party", label: "Fiesta", icon: PartyPopper },
  { id: "startup", label: "Emprendimiento", icon: Lightbulb },
  { id: "gym", label: "Gym", icon: Dumbbell },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const intereses = selected.map((id) => {
      const interest = INTERESTS.find((i) => i.id === id);
      return {
        tag: interest?.label.toLowerCase() || id,
        categoria: "general"
      };
    });

    try {
      await userService.agregarIntereses(userId, intereses);
      navigate("/completar-perfil");
    } catch (error) {
      console.error("Error guardando intereses:", error);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto py-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            ¿Qué te gusta hacer?
          </motion.h2>
          <p className="text-gray-600">
            Selecciona tus intereses para conectar con personas afines
          </p>
          <p className="text-sm text-purple-600 mt-2">
            {selected.length} seleccionados
          </p>
        </div>

        {/* Interest Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {INTERESTS.map((interest, index) => {
            const Icon = interest.icon;
            const isSelected = selected.includes(interest.id);

            return (
              <motion.button
                key={interest.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleInterest(interest.id)}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all
                  flex flex-col items-center gap-2
                  ${
                    isSelected
                      ? "bg-purple-600 border-purple-600 text-white shadow-lg scale-105"
                      : "bg-white border-gray-200 text-gray-700 hover:border-purple-300"
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">
                  {interest.label}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={`
            w-full py-4 rounded-2xl font-semibold text-lg transition-all
            ${
              selected.length > 0
                ? "bg-purple-600 text-white shadow-xl hover:bg-purple-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Continuar {selected.length > 0 && `(${selected.length})`}
        </motion.button>
      </motion.div>
    </div>
  );
}
