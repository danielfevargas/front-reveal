# 🎓 REVEAL - Red Social Universitaria

> Plataforma universitaria con privacidad progresiva e IA de compatibilidad.

## 🚀 Inicio rápido

### Requisitos previos
- [Node.js](https://nodejs.org/) v18 o superior
- [pnpm](https://pnpm.io/) v8 o superior (`npm install -g pnpm`)

### Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📋 Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Genera el build de producción en `/dist` |
| `pnpm preview` | Vista previa del build de producción |

## 🗂 Estructura del proyecto

```
src/
├── app/
│   ├── App.tsx                  # Router principal
│   └── components/
│       ├── ui/                  # Componentes shadcn/ui
│       ├── figma/               # Utilidades de imágenes
│       ├── Welcome.tsx          # /
│       ├── Onboarding.tsx       # /onboarding
│       ├── Dashboard.tsx        # /dashboard
│       ├── Chat.tsx             # /chat/:id
│       ├── Profile.tsx          # /profile
│       ├── Premium.tsx          # /premium
│       ├── Settings.tsx         # /settings
│       └── BottomNav.tsx        # Navegación inferior
├── styles/
│   ├── index.css                # Entrada de estilos
│   ├── tailwind.css             # Config Tailwind v4
│   ├── theme.css                # Variables CSS / colores
│   └── fonts.css                # Tipografías
└── main.tsx                     # Entry point
```

## 🔌 Conectar el backend

Las llamadas a la API se harán usando `VITE_API_URL` del archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Cuando tengas el backend listo, centraliza las llamadas en `src/services/` y reemplaza los datos mock en los componentes.

## 🛠 Stack tecnológico

- **React 18** + **TypeScript**
- **Vite 6** — bundler ultrarrápido
- **Tailwind CSS v4** — estilos utilitarios
- **shadcn/ui** + **Radix UI** — componentes accesibles
- **React Router v7** — navegación SPA
- **Lucide React** — iconos
- **Motion** — animaciones
