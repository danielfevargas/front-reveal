import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Settings, Edit, Star, TrendingUp, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "./BottomNav";
import { userService } from "../../services/api";

export function Profile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<any>(null);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const resp = await userService.obtenerPerfil(userId);
        const data = resp.data.data;
        setPerfil(data);
        setIntereses([]);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-purple-600 font-semibold">Cargando perfil...</div>
      </div>
    );
  }

  const inicial = perfil?.nombre?.[0]?.toUpperCase() || "?";

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

      <div className="max-w-4xl mx-auto p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6"
        >
          <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600" />

          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16 mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-bold">
                {inicial}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{perfil?.nombre || "Usuario"}</h2>
                    <p className="text-gray-600">{perfil?.universidad || ""}</p>
                  </div>
                  <button
                    onClick={() => navigate("/completar-perfil")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">📚 {perfil?.carrera || "Carrera no especificada"}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">🎂 {perfil?.edad ? `${perfil.edad} años` : ""}</span>
              </div>
            </div>

            {perfil?.bio && (
              <p className="text-gray-700 mb-4">{perfil.bio}</p>
            )}

            {intereses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {intereses.map((interest: string) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium capitalize"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <StatCard icon={<Heart className="w-5 h-5" />} label="Matches" value="0" color="bg-red-100 text-red-600" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Compatibilidad" value="—" color="bg-green-100 text-green-600" />
          <StatCard icon={<Star className="w-5 h-5" />} label="Conversaciones" value="0" color="bg-blue-100 text-blue-600" />
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Planes exitosos" value="0" color="bg-purple-100 text-purple-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Logros</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Achievement emoji="🔥" label="Racha 5 días" />
            <Achievement emoji="💬" label="Conversador" />
            <Achievement emoji="⭐" label="Top Match" />
            <Achievement emoji="🎯" label="Compatibilidad Alta" />
          </div>
        </motion.div>

        {perfil?.verificado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-green-50 rounded-2xl p-4 shadow-sm flex items-center gap-3"
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Estudiante verificado</p>
              <p className="text-sm text-green-600">Tu carnet universitario fue verificado exitosamente</p>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string; }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>{icon}</div>
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