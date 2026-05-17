import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Welcome } from "./components/Welcome";
import { Register } from "./components/Register";
import { VerificarCarnet } from "./components/VerificarCarnet";
import { CompletarPerfil } from "./components/CompletarPerfil";
import { Login } from "./components/Login";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { Profile } from "./components/Profile";
import { Premium } from "./components/Premium";
import { Settings } from "./components/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/verificar" element={<VerificarCarnet />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

