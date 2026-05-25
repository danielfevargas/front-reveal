import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { User, FileText, ArrowLeft, Camera, X, ChevronLeft, ChevronRight, MessageCircle, GraduationCap } from "lucide-react";
import { userService } from "../../services/api";

const CLOUDINARY_CLOUD_NAME = "dlw3wukbx";
const CLOUDINARY_UPLOAD_PRESET = "reveal_profiles";
const MAX_FOTOS = 3;

const PROMPTS = [
  "Me vas a caer bien si...",
  "La conversación perfecta incluye...",
  "Mi guilty pleasure es...",
  "Nunca podría salir con alguien que...",
  "Lo más loco que haría por...",
  "Me pone de buen humor...",
  "Mi forma de conquistar es...",
  "El plan perfecto para mí sería...",
  "Soy adicto/a a...",
  "Lo que nadie sabe de mí es...",
];

export function CompletarPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fotoVisor, setFotoVisor] = useState<number | null>(null);
  const [mostrarPrompts, setMostrarPrompts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    carrera: "",
    universidad: "",
    bio: "",
    prompt_pregunta: "",
    prompt_respuesta: "",
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const resp = await userService.obtenerPerfil(userId);
        const data = resp.data.data;
        if (data) {
          setForm({
            nombre: data.nombre || "",
            edad: data.edad ? String(data.edad) : "",
            carrera: data.carrera || "",
            universidad: data.universidad || "",
            bio: data.bio || "",
            prompt_pregunta: data.prompt_pregunta || "",
            prompt_respuesta: data.prompt_respuesta || "",
          });
          const fotosData = data.fotos?.length > 0 ? data.fotos : (data.foto_url ? [data.foto_url] : []);
          setFotos(fotosData);
          setPreviews(fotosData);
        }
      } catch (e) {
        console.error("Error cargando perfil:", e);
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSeleccionarFoto = () => {
    if (fotos.length >= MAX_FOTOS) return;
    fileInputRef.current?.click();
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const index = fotos.length;
    const previewUrl = URL.createObjectURL(file);
    setPreviews(prev => [...prev, previewUrl]);
    setUploadingIndex(index);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "reveal/perfiles");

      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await resp.json();

      if (data.secure_url) {
        setFotos(prev => [...prev, data.secure_url]);
      } else {
        setError("Error subiendo la foto");
        setPreviews(prev => prev.slice(0, -1));
      }
    } catch {
      setError("Error subiendo la foto");
      setPreviews(prev => prev.slice(0, -1));
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const eliminarFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const datosActualizar: any = {
        nombre: form.nombre.trim(),
        carrera: form.carrera.trim(),
        universidad: form.universidad.trim(),
        bio: form.bio.trim(),
        foto_url: fotos[0] || null,
      };

      if (form.edad) datosActualizar.edad = parseInt(form.edad);
      if (form.prompt_pregunta) datosActualizar.prompt_pregunta = form.prompt_pregunta;
      if (form.prompt_respuesta) datosActualizar.prompt_respuesta = form.prompt_respuesta;

      await userService.actualizarPerfil(userId, datosActualizar);

      if (fotos.length > 0) {
        await userService.actualizarFotos(userId, fotos);
      }

      // actualizar nombre en localStorage
      localStorage.setItem("nombre", form.nombre.trim());

      setGuardado(true);
      setTimeout(() => navigate("/profile"), 1000);
    } catch {
      setError("Error guardando el perfil");
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-600 text-sm font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="max-w-md mx-auto flex items-center gap-3 py-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Editar perfil</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-white rounded-3xl p-6 shadow-xl space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {guardado && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium text-center">
              ✅ Perfil guardado correctamente
            </div>
          )}

          {/* Fotos */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-3 block">
              📸 Fotos ({fotos.length}/{MAX_FOTOS})
            </label>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Foto ${index + 1}`}
                    onClick={() => uploadingIndex === null && setFotoVisor(index)}
                    className="w-full h-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  />
                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {uploadingIndex !== index && (
                    <button
                      onClick={() => eliminarFoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Principal
                    </div>
                  )}
                </div>
              ))}
              {fotos.length < MAX_FOTOS && (
                <button
                  onClick={handleSeleccionarFoto}
                  disabled={uploadingIndex !== null}
                  className="aspect-square border-2 border-dashed border-purple-300 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
                >
                  <Camera className="w-6 h-6 text-purple-400" />
                  <span className="text-xs text-purple-400">Agregar</span>
                </button>
              )}
            </div>
            <p className="text-gray-400 text-xs">La primera foto es tu foto principal</p>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />

          {/* Nombre */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-1 block">Nombre completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.nombre}
                onChange={e => handleChange("nombre", e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Edad */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-1 block">Edad</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🎂</span>
              <input
                type="number"
                value={form.edad}
                onChange={e => handleChange("edad", e.target.value)}
                placeholder="Tu edad"
                min={16}
                max={60}
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Universidad */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-1 block">Universidad</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.universidad}
                onChange={e => handleChange("universidad", e.target.value)}
                placeholder="Tu universidad"
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Carrera */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-1 block">Carrera</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.carrera}
                onChange={e => handleChange("carrera", e.target.value)}
                placeholder="Tu carrera"
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-1 block">Bio</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={form.bio}
                onChange={e => handleChange("bio", e.target.value)}
                placeholder="Cuéntanos algo sobre ti... tus hobbies, qué buscas, qué te apasiona"
                rows={3}
                maxLength={200}
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>
            <p className="text-gray-400 text-xs text-right mt-1">{form.bio.length}/200</p>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-gray-700 text-sm font-semibold mb-2 block">
              💬 Prompt — genera conversación ✨
            </label>
            {!form.prompt_pregunta ? (
              <button
                onClick={() => setMostrarPrompts(true)}
                className="w-full border-2 border-dashed border-purple-300 rounded-xl p-4 text-purple-500 text-sm hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
              >
                + Elegir una pregunta
              </button>
            ) : (
              <div className="border border-purple-200 rounded-xl overflow-hidden">
                <div className="bg-purple-50 px-4 py-2 flex items-center justify-between">
                  <span className="text-purple-700 text-sm font-medium">
                    💬 {form.prompt_pregunta}
                  </span>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, prompt_pregunta: "", prompt_respuesta: "" }))}
                    className="text-purple-400 hover:text-purple-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={form.prompt_respuesta}
                  onChange={e => handleChange("prompt_respuesta", e.target.value)}
                  placeholder="Tu respuesta..."
                  rows={2}
                  maxLength={150}
                  className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none resize-none text-sm"
                />
                <p className="text-gray-400 text-xs text-right px-4 pb-2">
                  {form.prompt_respuesta.length}/150
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleGuardar}
            disabled={loading || uploadingIndex !== null}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : "Guardar cambios"}
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
          >
            Cancelar
          </button>
        </div>
      </motion.div>

      {/* Modal selector de prompts */}
      <AnimatePresence>
        {mostrarPrompts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMostrarPrompts(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Elige una pregunta</h3>
                <button onClick={() => setMostrarPrompts(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2">
                {PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => {
                      handleChange("prompt_pregunta", prompt);
                      setMostrarPrompts(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-sm text-gray-700"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visor de fotos */}
      <AnimatePresence>
        {fotoVisor !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFotoVisor(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={previews[fotoVisor]}
              alt="Foto ampliada"
              className="max-w-full max-h-full rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            {previews.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setFotoVisor((fotoVisor - 1 + previews.length) % previews.length); }}
                  className="absolute left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setFotoVisor((fotoVisor + 1) % previews.length); }}
                  className="absolute right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            <button
              onClick={() => setFotoVisor(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute bottom-6 flex gap-2">
              {previews.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === fotoVisor ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
