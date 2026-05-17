import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Shield, Upload, Camera, CheckCircle } from "lucide-react";
import { documentoService } from "../../services/api";

export function VerificarCarnet() {
  const navigate = useNavigate();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"qr" | "carnet">("qr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificado, setVerificado] = useState(false);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleVerificar = async () => {
    if (!archivo) {
      setError("Por favor seleccioná una imagen");
      return;
    }

    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");

    if (!userId || !email) {
      setError("Sesión expirada, iniciá sesión de nuevo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("email", email);
      formData.append("tipo", tipo);
      formData.append("archivo", archivo);

      await documentoService.verificarCarnet(formData);
      setVerificado(true);

      setTimeout(() => navigate("/onboarding"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "No pudimos verificar tu carnet");
    } finally {
      setLoading(false);
    }
  };

  if (verificado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-white"
        >
          <CheckCircle className="w-24 h-24 mx-auto mb-4 text-green-400" />
          <h2 className="text-3xl font-bold mb-2">¡Verificado!</h2>
          <p className="text-white/70">Tu carnet universitario fue confirmado</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-3xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Verificá tu carnet</h1>
          <p className="text-white/70 mt-1">Confirmá que sos estudiante universitario</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-white text-sm">
              {error}
            </div>
          )}

          {/* Selector tipo */}
          <div className="flex gap-2 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setTipo("qr")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                tipo === "qr" ? "bg-white text-purple-600" : "text-white"
              }`}
            >
              📱 Código QR
            </button>
            <button
              onClick={() => setTipo("carnet")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                tipo === "carnet" ? "bg-white text-purple-600" : "text-white"
              }`}
            >
              🪪 Carnet físico
            </button>
          </div>

          {/* Preview */}
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Carnet"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={() => { setArchivo(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-white/30 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-white/50 transition-all">
              <Camera className="w-10 h-10 text-white/50" />
              <span className="text-white/70 text-sm text-center">
                {tipo === "qr" 
                  ? "Tomá una foto del código QR de tu carnet digital"
                  : "Tomá una foto de tu carnet universitario físico"
                }
              </span>
              <span className="text-white/50 text-xs">JPG o PNG</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleArchivo}
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={handleVerificar}
            disabled={loading || !archivo}
            className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Verificando..."
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Verificar carnet
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/onboarding")}
            className="w-full text-white/50 text-sm hover:text-white transition-colors"
          >
            Verificar más tarde
          </button>
        </div>
      </motion.div>
    </div>
  );
}