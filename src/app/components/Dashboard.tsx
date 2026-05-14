import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, Users, TrendingUp, MessageCircle, Settings, Crown } from "lucide-react";
import { BottomNav } from "./BottomNav";

const MATCHES = [
  {
    id: 1,
    name: "María",
    university: "Universidad de los Andes",
    compatibility: 87,
    interests: ["Café", "Tecnología", "Fotografía"],
    blurLevel: 80,
    revealStage: 45,
  },
  {
    id: 2,
    name: "Carlos",
    university: "Universidad Nacional",
    compatibility: 92,
    interests: ["Videojuegos", "Anime", "Música"],
    blurLevel: 60,
    revealStage: 65,
  },
  {
    id: 3,
    name: "Ana",
    university: "Universidad Javeriana",
    compatibility: 78,
    interests: ["Senderismo", "Viajar", "Arte"],
    blurLevel: 95,
    revealStage: 25,
  },
  {
    id: 4,
    name: "Diego",
    university: "Universidad del Rosario",
    compatibility: 85,
    interests: ["Gym", "Deportes", "Emprendimiento"],
    blurLevel: 90,
    revealStage: 35,
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"matches" | "discover">("matches");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">REVEAL</span>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <StatCard icon={<Users />} label="Matches" value="12" />
          <StatCard icon={<TrendingUp />} label="Compatibilidad Avg" value="84%" />
          <StatCard icon={<MessageCircle />} label="Conversaciones" value="5" />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === "matches"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Tus Matches
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === "discover"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Descubrir
          </button>
        </div>

        {/* AI Insight Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 mb-6 text-white"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Sugerencia de IA</h3>
              <p className="text-sm text-white/90">
                Carlos tiene 92% de compatibilidad contigo. Ya llevan 3 días conversando.
                ¿Qué tal sugerir ir por café? ☕
              </p>
            </div>
          </div>
        </motion.div>

        {/* Matches Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {MATCHES.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
          ))}
        </motion.div>
      </div>

      {/* Premium Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => navigate("/premium")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-10"
      >
        <Crown className="w-7 h-7 text-white" />
      </motion.button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-purple-600">
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function MatchCard({ match, index, navigate }: { match: any; index: number; navigate: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/chat/${match.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-400">
        {/* Blurred profile image placeholder */}
        <div
          className="absolute inset-0 backdrop-blur-xl bg-white/10"
          style={{ backdropFilter: `blur(${match.blurLevel}px)` }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-20">
            {match.name[0]}
          </div>
        </div>

        {/* Reveal progress */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Revelación</span>
            <span className="text-white font-bold">{match.revealStage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${match.revealStage}%` }}
              transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
              className="bg-white h-full rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{match.name}</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">Activo</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{match.university}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {match.compatibility}% compatible
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {match.interests.map((interest: string) => (
            <span key={interest} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
