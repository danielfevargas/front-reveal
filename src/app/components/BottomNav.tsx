import { useNavigate, useLocation } from "react-router";
import { Home, Search, Heart, User } from "lucide-react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-20">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          <NavItem
            icon={<Home className="w-6 h-6" />}
            label="Inicio"
            active={isActive("/dashboard")}
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<Search className="w-6 h-6" />}
            label="Descubrir"
            active={false}
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<Heart className="w-6 h-6" />}
            label="Matches"
            active={false}
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<User className="w-6 h-6" />}
            label="Perfil"
            active={isActive("/profile")}
            onClick={() => navigate("/profile")}
          />
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        active
          ? "text-purple-600"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className={active ? "scale-110" : ""}>{icon}</div>
      <span className="text-xs font-medium">{label}</span>
      {active && (
        <div className="w-1 h-1 bg-purple-600 rounded-full absolute -bottom-1" />
      )}
    </button>
  );
}
