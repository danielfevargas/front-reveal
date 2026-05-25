import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Welcome } from "./components/Welcome";
import { Register } from "./components/Register";
import { Login } from "./components/Login";
import { VerificarCarnet } from "./components/VerificarCarnet";
import { CompletarPerfil } from "./components/CompletarPerfil";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { Profile } from "./components/Profile";
import { Premium } from "./components/Premium";
import { Settings } from "./components/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PerfilPublico } from "./components/PerfilPublico";

/**
 * Árbol de rutas de la SPA.
 *
 * Rutas públicas (sin autenticación):
 *   /          → Welcome
 *   /login     → Login
 *   /register  → Register
 *
 * Rutas protegidas (requieren token en localStorage):
 *   /verificar          → VerificarCarnet (subir carnet universitario)
 *   /onboarding         → Onboarding (tutoral inicial)
 *   /completar-perfil   → CompletarPerfil (foto, bio, intereses)
 *   /dashboard          → Dashboard (sugerencias y matches)
 *   /chat/:id           → Chat (chat en tiempo real con match)
 *   /profile            → Profile (editar perfil propio)
 *   /premium            → Premium (planes de suscripción)
 *   /settings           → Settings (preferencias y cuenta)
 *   /perfil/:id         → PerfilPublico (ver perfil ajeno con privacidad progresiva)
 *
 * Cualquier ruta no definida redirige a /.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route path="/verificar" element={<ProtectedRoute><VerificarCarnet /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/completar-perfil" element={<ProtectedRoute><CompletarPerfil /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/perfil/:id" element={<ProtectedRoute><PerfilPublico /></ProtectedRoute>} />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
