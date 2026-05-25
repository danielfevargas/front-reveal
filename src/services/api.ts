import axios from 'axios';

/**
 * Cliente HTTP base para todos los servicios del backend.
 * La URL base se configura en la variable de entorno VITE_API_URL.
 * En producción apunta al API Gateway en Railway; en desarrollo a localhost:3000.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor global de peticiones.
 * Inyecta automáticamente en cada request:
 *   - Authorization: Bearer <token>    (JWT del usuario autenticado)
 *   - x-solicitante-id: <userId>       (para que user-service aplique privacidad progresiva)
 * Ambos valores se leen de localStorage.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    config.headers['x-solicitante-id'] = userId;
  }
  return config;
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const authService = {
  /** Registra un nuevo usuario y devuelve el userId */
  register: (data: any) => api.post('/auth/register', data),
  /** Login con email/contraseña; devuelve JWT + userId */
  login: (data: any) => api.post('/auth/login', data),
};

// ─── USER ────────────────────────────────────────────────────────────────────

export const userService = {
  /** Crea el perfil inicial tras el registro */
  crearPerfil: (data: any) => api.post('/users', data),

  /** Obtiene el perfil aplicando privacidad según el nivel de conexión de la sala */
  obtenerPerfil: (id: string) => api.get(`/users/${id}`),

  /**
   * Obtiene el perfil pasando el nivel explícitamente en el header.
   * Usado desde PerfilPublico cuando ya conocemos el nivel de la sala.
   */
  obtenerPerfilConNivel: (id: string, nivel: number) => api.get(`/users/${id}`, {
    headers: { 'x-nivel-privacidad': nivel.toString() }
  }),

  /** Actualiza nombre, bio, foto, prompt, etc. */
  actualizarPerfil: (id: string, data: any) => api.put(`/users/${id}`, data),

  /** Reemplaza la lista completa de intereses del usuario */
  agregarIntereses: (id: string, intereses: any[]) => api.post(`/users/${id}/intereses`, { intereses }),

  /** Actualiza el array de URLs de fotos de Cloudinary */
  actualizarFotos: (id: string, fotos: string[]) => api.put(`/users/${id}/fotos`, { fotos }),

  /** Registra un like; responde si hubo match mutuo */
  darLike: (id: string, otroId: string) => api.post(`/users/${id}/like/${otroId}`),

  /** Usuarios con los que hay like mutuo (aparecen en "Mis Matches") */
  obtenerMatchesMutuos: (id: string) => api.get(`/users/${id}/matches/mutuos`),

  /** Candidatos de match calculados por el algoritmo de intereses comunes */
  obtenerMatches: (id: string) => api.get(`/users/${id}/matches`),

  bloquearUsuario: (id: string, bloqueadoId: string) => api.post(`/users/${id}/bloquear/${bloqueadoId}`),
  desbloquearUsuario: (id: string, bloqueadoId: string) => api.delete(`/users/${id}/bloquear/${bloqueadoId}`),
  obtenerBloqueados: (id: string) => api.get(`/users/${id}/bloqueados`),
  obtenerIntereses: (id: string) => api.get(`/users/${id}/intereses`),
  obtenerPreferencias: (id: string) => api.get(`/users/${id}/preferencias`),
  actualizarPreferencias: (id: string, data: any) => api.put(`/users/${id}/preferencias`, data),
};

// ─── CHAT ────────────────────────────────────────────────────────────────────

export const chatService = {
  /**
   * Obtiene el estado HTTP de la sala (nivel, blur, puntaje, lugares).
   * Usado al montar Chat para cargar los lugares persistidos independientemente
   * del socket, garantizando que se muestren aunque el socket tarde en conectar.
   */
  obtenerSala: (salaId: string) => api.get(`/chat/sala/${salaId}`),
};

// ─── DOCUMENTO ───────────────────────────────────────────────────────────────

export const documentoService = {
  /** Sube la imagen del carnet para OCR/QR en document-service */
  verificarCarnet: (formData: FormData) => api.post('/documento/verificar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
