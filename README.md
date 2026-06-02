# TopGap — Scouting Tool

**Herramienta de análisis y scouting para Top Laners de League of Legends.**  
Compara el rendimiento de dos jugadores usando datos reales de la API de Riot Games y genera un análisis inteligente con IA.

> Desarrollado por **Oscar Julian Toro Arroyave** · Estructura de Datos 2026  
> Universidad de Antioquia

---

## Demo en producción

🔗 **[mvp-toplaners-i5jc.vercel.app](https://mvp-toplaners-i5jc.vercel.app)**

---

## ¿Qué hace la aplicación?

TopGap permite a un scout o analista de esports comparar dos jugadores de Top Lane ingresando su nombre de invocador. La app consulta en tiempo real las últimas partidas ranked de cada jugador a través de la API oficial de Riot Games, calcula un **TopGap Score** ponderado por 5 dimensiones de rendimiento, genera una comparación visual y produce un análisis en lenguaje natural. Cada usuario puede guardar los análisis que le interesen en su historial personal.

---

## Arquitectura del sistema

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│   Frontend · Vercel          │         │   Backend · Railway           │
│                             │         │                              │
│  Next.js 15 + React 19      │──HTTPS──▶  Express (Node.js)          │
│  TypeScript + Tailwind CSS  │◀────────│  REST API                    │
│  NextAuth (Google OAuth)    │         │                              │
│  Server Actions             │         │  ├── Riot Games API          │
└─────────────────────────────┘         │  ├── Motor de análisis IA    │
                                        │  └── PostgreSQL (Railway)    │
                                        └──────────────────────────────┘
```

---

## Stack tecnológico y por qué se eligió cada tecnología

| Tecnología | Rol en el proyecto | Por qué se eligió |
|---|---|---|
| **Next.js 15** | Framework del frontend | Permite Server Actions: llamadas seguras al backend sin exponer API keys en el cliente |
| **React 19** | UI del frontend | Componentes reutilizables como `BuscadorJugador` y `BarraComparacion` con estado reactivo |
| **TypeScript** | Tipado estático | El tipo `Jugador` garantiza que los datos de Riot llegan con la estructura correcta y evita bugs en runtime |
| **Tailwind CSS** | Estilos | Utilidades directas en JSX sin archivos CSS separados, consistencia visual rápida |
| **NextAuth.js v5** | Autenticación | Manejo de sesiones con Google OAuth, permite identificar al usuario para su historial personal |
| **Node.js + Express** | Backend API | Servidor ligero con rutas REST claras (`/api/analisis`, `/api/jugadores`, `/api/ia`) |
| **PostgreSQL** | Base de datos | Base de datos relacional con 13 tablas normalizadas, FK entre entidades y datos persistentes |
| **Railway** | Hosting backend + BD | Plataforma que aloja tanto Express como PostgreSQL en el mismo entorno de producción |
| **Vercel** | Hosting frontend | Despliega automáticamente con cada `git push` a la rama `main` |

---

## Funcionalidades

- **Autenticación con Google** — login seguro, cada usuario tiene su propio historial
- **Búsqueda de jugadores** — consulta en tiempo real a la API de Riot Games (últimas 10 partidas ranked Top Lane)
- **TopGap Score** — métrica compuesta calculada desde 5 dimensiones de rendimiento
- **Comparación visual** — barras de progreso enfrentadas por dimensión
- **Análisis IA** — resumen en lenguaje natural, fortalezas, debilidades y recomendación de scouting personalizada por jugador
- **Guardar análisis** — el usuario decide qué análisis guardar en su historial personal
- **Eliminar análisis** — control total del historial, eliminación inmediata sin reload
- **Multi-usuario** — cada cuenta Google ve únicamente sus propios análisis

---

## Estructura del proyecto

```
mvp-toplaners/
├── app/
│   ├── page.tsx              # Página principal — comparador de jugadores
│   ├── login/page.tsx        # Pantalla de autenticación con Google
│   └── api/auth/             # Endpoints de NextAuth
├── lib/
│   ├── actions.ts            # Server Actions — puente seguro frontend ↔ backend
│   ├── riot.ts               # Cliente de la API de Riot Games
│   ├── types.ts              # Tipos TypeScript compartidos (Jugador, Metricas, etc.)
│   └── db.ts                 # Conexión a base de datos
├── backend/
│   └── src/
│       ├── index.js              # Servidor Express — punto de entrada
│       ├── routes/
│       │   ├── analisis.js       # GET, POST, DELETE /api/analisis
│       │   ├── jugadores.js      # POST /api/jugadores
│       │   └── ia.js             # GET /api/analisis/:id/ia
│       ├── gemini.js             # Motor de análisis inteligente en lenguaje natural
│       ├── riot.js               # Integración con Riot Games API
│       ├── db.js                 # Pool de conexiones PostgreSQL
│       └── schema.sql            # Esquema completo de la base de datos (13 tablas)
└── auth.ts                   # Configuración de NextAuth + Google Provider
```

---

## Base de datos — 13 tablas relacionadas

### Diagrama de relaciones

```
tbl_region ◄── tbl_jugador ──► tbl_estado
                   │
                   ├──► tbl_tier          (rango competitivo del jugador)
                   │
                   └──► tbl_jugador_x_partida ──► tbl_partida ──► tbl_parche
                                │
                                └──► tbl_campeon ──► tbl_rol

tbl_usuario ──► tbl_analisis ──► tbl_analisis_x_jugador
                    │
                    └──► tbl_reporte ──► tbl_jugador
```

### Descripción de cada tabla

| Tabla | Descripción |
|-------|-------------|
| `tbl_usuario` | Scouts y analistas registrados vía Google OAuth |
| `tbl_region` | Servidores de LoL: LAN, NA, KR, EUW, etc. |
| `tbl_estado` | Estado del jugador en el pipeline: Scouting, Fichado, Descartado |
| `tbl_rol` | Roles del juego: TOP, JUNGLE, MID, ADC, SUPPORT |
| `tbl_parche` | Versiones del juego (14.10, 25.01, etc.) |
| `tbl_campeon` | Catálogo de campeones con su rol principal |
| `tbl_jugador` | Jugadores analizados con su PUUID de Riot |
| `tbl_tier` | Rango competitivo: liga, división, LP, victorias y derrotas |
| `tbl_partida` | Partidas individuales con match ID de Riot, parche y duración |
| `tbl_jugador_x_partida` | Estadísticas de cada jugador en cada partida (K/D/A, CS, daño, visión) |
| `tbl_analisis` | Sesión de comparación entre dos jugadores |
| `tbl_analisis_x_jugador` | TopGap Score y métricas calculadas por jugador en cada análisis |
| `tbl_reporte` | Conclusión textual del análisis con ganador y diferencia de puntos |

---

## TopGap Score

Métrica propia calculada sobre las últimas 10 partidas ranked en Top Lane:

| Dimensión | Métrica base | Descripción |
|-----------|-------------|-------------|
| Dominio de línea | Winrate % | Capacidad de ganar la fase de líneas |
| Disciplina | KDA promedio | Control de muertes y eficiencia |
| Impacto en peleas | Kill participation % | Presencia en eliminaciones del equipo |
| Control de visión | Vision score / minuto | Información y control del mapa |
| Daño compartido | Dmg share % | Contribución al daño total del equipo |

---

## Variables de entorno

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RIOT_API_KEY=...

# Backend (.env)
DATABASE_URL=postgresql://...
RIOT_API_KEY=...
```
