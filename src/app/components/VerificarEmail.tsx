import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Mail, CheckCircle } from "lucide-react";
import { authService, userService } from "../../services/api";

export function VerificarEmail() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [error, setError] = useState("");
  const [verificado, setVerificado] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const email = localStorage.getItem("pendingEmail") || "";

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const nuevoCodigo = [...codigo];
    nuevoCodigo[index] = value.slice(-1);
    setCodigo(nuevoCodigo);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCodigo(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const handleVerificar = async () => {
    const codigoCompleto = codigo.join("");
    if (codigoCompleto.length !== 6) {
      setError("Ingresá el código completo de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.verificarCodigo({ email, codigo: codigoCompleto });

      // Ahora sí creamos el perfil, ya que el email está verificado
      const userId = localStorage.getItem("pendingUserId")!;
      const nombre = localStorage.getItem("pendingNombre")!;
      const edad = localStorage.getItem("pendingEdad")!;
      const universidad = localStorage.getItem("pendingUniversidad")!;
      const carrera = localStorage.getItem("pendingCarrera")!;

      await userService.crearPerfil({
        id: userId,
        email,
        nombre,
        edad: parseInt(edad),
        universidad,
        carrera,
      });

      // Login automático tras verificar
      const loginResp = await authService.login({
        email,
        password: localStorage.getItem("pendingPassword") || "",
      });

      localStorage.setItem("token", loginResp.data.token);
      localStorage.setItem("userId", loginResp.data.userId);
      localStorage.setItem("nombre", nombre);
      localStorage.setItem("email", email);

      // Limpiar datos temporales
      ["pendingUserId", "pendingEmail", "pendingNombre", "pendingEdad",
       "pendingUniversidad", "pendingCarrera", "pendingPassword"]
        .forEach(key => localStorage.removeItem(key));

      setVerificado(true);
      setTimeout(() => navigate("/verificar"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setReenviando(true);
    setMensajeReenvio("");
    setError("");

    try {
      await authService.reenviarCodigo({ email });
      setMensajeReenvio("Código reenviado. Revisá tu correo.");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al reenviar el código");
    } finally {
      setReenviando(false);
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
          <h2 className="text-3xl font-bold mb-2">¡Correo verificado!</h2>
          <p className="text-white/70">Ahora vamos a verificar tu carnet</p>
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Verificá tu correo</h1>
          <p className="text-white/70 mt-1">
            Enviamos un código de 6 dígitos a<br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-white text-sm">
              {error}
            </div>
          )}

          {mensajeReenvio && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-white text-sm">
              {mensajeReenvio}
            </div>
          )}

          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {codigo.map((digito, index) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digito}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-white text-2xl font-bold focus:outline-none focus:border-white/50"
              />
            ))}
          </div>

          <p className="text-white/50 text-xs text-center">
            El código expira en 10 minutos
          </p>

          <button
            onClick={handleVerificar}
            disabled={loading}
            className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>

          <button
            onClick={handleReenviar}
            disabled={reenviando}
            className="w-full bg-white/10 text-white py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {reenviando ? "Reenviando..." : "Reenviar código"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}