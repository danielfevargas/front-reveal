import { motion } from "motion/react";
import { ArrowLeft, Settings, Edit, Star, TrendingUp, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "./BottomNav";

const USER_DATA = {
  name: "Sofía García",
  university: "Universidad de los Andes",
  major: "Ingeniería de Sistemas",
  year: "3er año",
  age: 21,
  bio: "Amante del café, la tecnología y la fotografía. Siempre buscando nuevas aventuras y personas con buena vibra ☕📸",
  interests: [
    "Café",
    "Tecnología",
    "Fotografía",
    "Cine",
    "Música",
    "Viajar",
  ],
  stats: {
    matches: 12,
    avgCompatibility: 84,
    conversations: 5,
    successfulPlans: 3,
  },
};

export function Profile() {
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
          <span className="font-semibold text-gray-900">Mi Perfil</span>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6"
        >
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600" />

          {/* Avatar & Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16 mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-bold">
                S
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{USER_DATA.name}</h2>
                    <p className="text-gray-600">{USER_DATA.university}</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">📚 {USER_DATA.major}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">🎓 {USER_DATA.year}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{USER_DATA.bio}</p>

            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              {USER_DATA.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="Matches"
            value={USER_DATA.stats.matches.toString()}
            color="bg-red-100 text-red-600"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Compatibilidad"
            value={`${USER_DATA.stats.avgCompatibility}%`}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Conversaciones"
            value={USER_DATA.stats.conversations.toString()}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Planes exitosos"
            value={USER_DATA.stats.successfulPlans.toString()}
            color="bg-purple-100 text-purple-600"
          />
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Logros</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Achievement emoji="🔥" label="Racha 5 días" />
            <Achievement emoji="💬" label="Conversadora" />
            <Achievement emoji="⭐" label="Top Match" />
            <Achievement emoji="🎯" label="Compatibilidad Alta" />
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Configuración de Privacidad</h3>
          <div className="space-y-4">
            <PrivacySetting
              label="Revelación progresiva activa"
              description="Tu perfil se revela gradualmente según la IA"
              enabled={true}
            />
            <PrivacySetting
              label="Visible para mi universidad"
              description="Solo estudiantes de tu universidad pueden verte"
              enabled={true}
            />
            <PrivacySetting
              label="Sugerencias de IA"
              description="Recibe recomendaciones inteligentes de matches"
              enabled={true}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function Achievement({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-xs font-medium text-gray-700">{label}</p>
    </div>
  );
}

function PrivacySetting({
  label,
  description,
  enabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div
        className={`w-12 h-7 rounded-full transition-colors ${
          enabled ? "bg-purple-600" : "bg-gray-300"
        } relative flex-shrink-0 ml-4`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
    </div>
  );
}
