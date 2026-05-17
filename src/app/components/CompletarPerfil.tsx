import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { User, FileText, ArrowRight } from "lucide-react";
import { userService } from "../../services/api";

export function CompletarPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    bio: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleContinuar = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      await userService.actualizarPerfil(userId, {
        bio: form.bio,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError("Error guardando el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-3xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Completá tu perfil</h1>
          <p className="text-gray-500 mt-1">Cuéntales algo sobre vos</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-purple-400" />
            </div>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
              Subir foto (próximamente)
            </button>
          </div>

          {/* Bio */}
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">
              Bio
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Cuéntanos algo sobre ti... tus hobbies, qué buscas, qué te apasiona"
                rows={4}
                maxLength={200}
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>
            <p className="text-gray-400 text-xs text-right mt-1">
              {form.bio.length}/200
            </p>
          </div>

          <button
            onClick={handleContinuar}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Guardando..." : (
              <>
                Ir al Dashboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Completar después
          </button>
        </div>
      </motion.div>
    </div>
  );
}