import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { Sparkles, Users, TrendingUp, MessageCircle, Settings, Crown, MapPin, X } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { userService } from "../../services/api";

const GOOGLE_API_KEY = "AIzaSyBsbzIDndMeF6J6qp8teCwtS1a8x7WyGoI";

/**
 * Pantalla principal de la app tras el login.
 *
 * Dos pestañas:
 *   "Sugerencias"  → candidatos de match calculados por intereses comunes (MatchCard)
 *   "Mis Matches"  → usuarios con like mutuo (MatchMutuoCard)
 *
 * Para cada match mutuo consulta el nivel de conexión de la sala vía HTTP
 * para determinar si mostrar la foto con o sin blur en el dashboard.
 *
 * Ciudad: se obtiene automáticamente con Geolocation + Google Geocoding API.
 * Si el usuario deniega el permiso, se muestra un modal con input manual.
 * La ciudad se persiste en localStorage para usarla en el chat (AI de lugares).
 */
export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"matches" | "discover">("matches");
  const [ciudad, setCiudad] = useState<string>("");
  const [ciudadInput, setCiudadInput] = useState<string>("");
  const [mostrarInputCiudad, setMostrarInputCiudad] = useState(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesMutuos, setMatchesMutuos] = useState<any[]>([]);
  const [cargandoMatches, setCargandoMatches] = useState(true);
  const [matchesVistos, setMatchesVistos] = useState(
    parseInt(localStorage.getItem("matchesVistos") || "0")
  );

  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "matches") setActiveTab("discover");
    else setActiveTab("matches");
  }, [location.search]);

  useEffect(() => {
    if (activeTab === "discover") {
      localStorage.setItem("matchesVistos", matchesMutuos.length.toString());
      setMatchesVistos(matchesMutuos.length);
    }
  }, [activeTab, matchesMutuos.length]);

  useEffect(() => {
    const ciudadGuardada = localStorage.getItem("ciudad");
    if (ciudadGuardada) {
      setCiudad(ciudadGuardada);
    } else {
      pedirUbicacion();
    }
  }, []);

  useEffect(() => {
    const cargarMatches = async () => {
      if (!userId) return;
      setCargandoMatches(true);
      try {
        const [respMatches, respMutuos] = await Promise.all([
          userService.obtenerMatches(userId),
          userService.obtenerMatchesMutuos(userId)
        ]);
        setMatches(respMatches.data.data || []);

        const mutuos = respMutuos.data.data || [];
        const mutuosConNivel = await Promise.all(
          mutuos.map(async (match: any) => {
            try {
              const salaId = [userId, match.id].sort().join('_');
              const respSala = await fetch(`http://localhost:3000/chat/sala/${salaId}`);
              const sala = await respSala.json();
              const nivel = sala.nivel || 1;
              return {
                ...match,
                nivel_conexion: nivel,
                foto_url: match.foto_url,
                foto_borrosa: nivel < 4
              };
          } catch {
            return { ...match, nivel_conexion: 1, foto_url: match.foto_url, foto_borrosa: true };
          }
        })
      );
      setMatchesMutuos(mutuosConNivel);
    } catch (error) {
      console.error("Error cargando matches:", error);
    } finally {
    setCargandoMatches(false);
    }
  };
  cargarMatches();
  }, [userId]);

  /** Solicita la ubicación del navegador y la convierte a nombre de ciudad con Google Geocoding */
  const pedirUbicacion = () => {
    setCargandoUbicacion(true);
    if (!navigator.geolocation) {
      setMostrarInputCiudad(true);
      setCargandoUbicacion(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const resp = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=es`
          );
          const data = await resp.json();

          if (data.results && data.results.length > 0) {
            let ciudadEncontrada = "";
            for (const result of data.results) {
              for (const component of result.address_components) {
                if (component.types.includes("locality") ||
                  component.types.includes("administrative_area_level_2")) {
                  ciudadEncontrada = component.long_name;
                  break;
                }
              }
              if (ciudadEncontrada) break;
            }

            if (ciudadEncontrada) {
              const ciudadCompleta = `${ciudadEncontrada}, Colombia`;
              setCiudad(ciudadCompleta);
              localStorage.setItem("ciudad", ciudadCompleta);
            } else {
              setMostrarInputCiudad(true);
            }
          } else {
            setMostrarInputCiudad(true);
          }
        } catch (error) {
          setMostrarInputCiudad(true);
        } finally {
          setCargandoUbicacion(false);
        }
      },
      () => {
        setCargandoUbicacion(false);
        setMostrarInputCiudad(true);
      }
    );
  };

  const guardarCiudadManual = () => {
    if (!ciudadInput.trim()) return;
    const ciudadCompleta = `${ciudadInput}, Colombia`;
    setCiudad(ciudadCompleta);
    localStorage.setItem("ciudad", ciudadCompleta);
    setMostrarInputCiudad(false);
  };

  const compatibilidadPromedio = matches.length > 0
    ? Math.round(matches.reduce((acc, m) => acc + (m.compatibilidad || 0), 0) / matches.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">REVEAL</span>
          </div>
          <div className="flex items-center gap-2">
            {ciudad && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                <span>{ciudad.split(",")[0]}</span>
              </div>
            )}
            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {cargandoUbicacion && (
        <div className="bg-purple-600 text-white text-center py-2 text-sm">
          📍 Obteniendo tu ubicación...
        </div>
      )}

      {mostrarInputCiudad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">¿En qué ciudad estás?</h3>
              <button onClick={() => setMostrarInputCiudad(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Necesitamos tu ciudad para recomendarte lugares cercanos cuando tengas buena conexión con alguien.
            </p>
            <input
              type="text"
              list="ciudades-colombia"
              value={ciudadInput}
              onChange={(e) => setCiudadInput(e.target.value)}
              placeholder="Ej: Ibagué, Bogotá, Medellín..."
              onKeyDown={(e) => e.key === "Enter" && guardarCiudadManual()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-400 mb-4"
            />
            <datalist id="ciudades-colombia">
              {["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Bucaramanga",
                "Pereira","Santa Marta","Ibagué","Manizales","Villavicencio","Pasto","Montería",
                "Valledupar","Armenia","Sincelejo","Popayán","Neiva","Tunja","Florencia",
                "Quibdó","Riohacha","San Andrés","Leticia","Yopal","Arauca","Mocoa",
                "Palmira","Buenaventura","Barrancabermeja","Girardot","Sogamoso","Duitama",
                "Zipaquirá","Fusagasugá","Facatativá","Bello","Itagüí","Envigado",
                "Soledad","Malambo","Soacha","Dosquebradas","Tuluá","Cartago"].map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <button
              onClick={guardarCiudadManual}
              disabled={!ciudadInput.trim()}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Confirmar ciudad
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <StatCard icon={<Users />} label="Sugerencias" value={matches.length.toString()} />
          <StatCard icon={<TrendingUp />} label="Compatibilidad Avg" value={`${compatibilidadPromedio}%`} />
          <StatCard icon={<MessageCircle />} label="Matches mutuos" value={matchesMutuos.length.toString()} />
        </motion.div>

        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === "matches"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Sugerencias
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all relative ${
              activeTab === "discover"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Mis Matches ❤️
            {matchesMutuos.length > matchesVistos && activeTab !== "discover" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {matchesMutuos.length - matchesVistos}
              </span>
            )}
          </button>
        </div>

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
                {matches.length > 0
                  ? `Tenés ${matches.length} sugerencias basadas en tus intereses. ¡Dale like a alguien hoy!`
                  : "Completá tu perfil y agregá intereses para encontrar matches compatibles."}
              </p>
            </div>
          </div>
        </motion.div>

        {activeTab === "matches" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {cargandoMatches ? (
              <div className="col-span-2 text-center py-10 text-gray-400">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Buscando matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay sugerencias todavía</p>
                <p className="text-xs mt-1">Agregá más intereses para encontrar matches</p>
              </div>
            ) : (
              matches.map((match, index) => (
                <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {matchesMutuos.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-400">
                <span className="text-4xl block mb-3">❤️</span>
                <p>No tenés matches mutuos todavía</p>
                <p className="text-xs mt-1">Dale like a alguien y esperá que te corresponda</p>
              </div>
            ) : (
              matchesMutuos.map((match, index) => (
                <MatchMutuoCard key={match.id} match={match} index={index} navigate={navigate} />
              ))
            )}
          </motion.div>
        )}
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => navigate("/premium")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-10"
      >
        <Crown className="w-7 h-7 text-white" />
      </motion.button>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-purple-600">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

/** Tarjeta de sugerencia de match (foto siempre borrosa — identidad anónima hasta el chat) */
function MatchCard({ match, index, navigate }: { match: any; index: number; navigate: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/perfil/${match.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-400">
        {match.foto_url ? (
          <img
            src={match.foto_url}
            alt="Foto"
            className="w-full h-full object-cover"
            style={{ filter: 'blur(15px)', transform: 'scale(1.1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-20">
            ?
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Compatibilidad</span>
            <span className="text-white font-bold">{match.compatibilidad}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${match.compatibilidad}%` }}
              transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
              className="bg-white h-full rounded-full"
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">Usuario anónimo</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">Activo</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{match.universidad}</p>
        <div className="flex flex-wrap gap-2">
          {match.intereses_comunes?.map((interest: string) => (
            <span key={interest} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Tarjeta de match mutuo — foto con/sin blur según el nivel de conexión de la sala */
function MatchMutuoCard({ match, index, navigate }: { match: any; index: number; navigate: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/chat/${match.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-purple-200"
    >
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-400">
        {match.foto_url ? (
          <img
            src={match.foto_url}
            alt="Foto"
            className="w-full h-full object-cover"
            style={match.foto_borrosa ? { filter: 'blur(15px)', transform: 'scale(1.1)' } : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-20">
            ?
          </div>
        )}
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          ❤️ Match mutuo
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{match.nombre || "Usuario anónimo"}</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">Activo</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{match.universidad}</p>
        <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/perfil/${match.id}`); }}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          👤 perfil
        </button>
        <button
          onClick={() => navigate(`/chat/${match.id}`)}
          className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          💬 Chatear
        </button>
        </div>
      </div>
    </motion.div>
  );
}
