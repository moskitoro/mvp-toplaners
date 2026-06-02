'use client'
import { useState } from 'react'
import { buscarJugador } from '@/lib/actions'
import { REGIONS } from '@/lib/riot'

const REGION_OPTIONS = Object.entries(REGIONS).map(([key, val]) => ({ key, label: val.label }))

type Jugador = {
  puuid: string
  riotId: string
  region: string
  partidasAnalizadas: number
  metricas: {
    kdaAvg: number
    winrate: number
    dmgShareAvg: number
    killParticipationAvg: number
    goldDiff15Avg: number
    csDiff15Avg: number
    visionScorePerMin: number
    topgapScore: number
  }
}

// Dimensiones visibles para el cliente (nombres genéricos — sin revelar fórmula)
const DIMENSIONES = [
  { key: 'topgapScore',            label: 'TopGap Score',      max: 100, fmt: (v: number) => `${v}` },
  { key: 'winrate',                label: 'Dominio de Línea',  max: 100, fmt: (v: number) => `${v}%` },
  { key: 'kdaAvg',                 label: 'Disciplina',        max: 6,   fmt: (v: number) => v.toFixed(2) },
  { key: 'killParticipationAvg',   label: 'Impacto en Peleas', max: 70,  fmt: (v: number) => `${v}%` },
  { key: 'visionScorePerMin',      label: 'Control de Visión', max: 2,   fmt: (v: number) => v.toFixed(2) },
]

const PASOS = [
  'Buscando cuenta...',
  'Obteniendo partidas ranked...',
  'Calculando métricas...',
  'Generando análisis...',
]

function BuscadorJugador({
  label, onResult, accentClass
}: {
  label: string
  onResult: (j: Jugador) => void
  accentClass: string
}) {
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('la1')
  const [loading, setLoading] = useState(false)
  const [paso, setPaso] = useState(0)
  const [error, setError] = useState('')

  const buscar = async () => {
    if (!riotId.trim()) return
    setLoading(true)
    setError('')
    setPaso(0)

    // Simular progreso visual mientras espera la respuesta
    const intervalo = setInterval(() => {
      setPaso(p => p < PASOS.length - 1 ? p + 1 : p)
    }, 2500)

    const res = await buscarJugador(riotId.trim(), region) as any
    clearInterval(intervalo)
    setPaso(PASOS.length - 1)

    // Pequeña pausa para que se vea el último paso
    await new Promise(r => setTimeout(r, 400))
    setLoading(false)
    if (res.error) { setError(res.error); return }
    onResult(res)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-8">
        {/* Spinner */}
        <div className={`w-12 h-12 rounded-full border-2 border-zinc-800 border-t-current ${accentClass} animate-spin`} />
        {/* Pasos */}
        <div className="space-y-2 w-full">
          {PASOS.map((p, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${
              i < paso ? 'text-zinc-600 line-through' :
              i === paso ? 'text-zinc-300 font-medium' : 'text-zinc-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                i < paso ? 'bg-zinc-700' :
                i === paso ? `bg-current ${accentClass}` : 'bg-zinc-800'
              }`} />
              {p}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-700 uppercase tracking-widest">Analizando 10+ partidas · puede tardar ~30s</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
      <input
        value={riotId}
        onChange={e => setRiotId(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && buscar()}
        placeholder="Nombre#TAG"
        className="w-full bg-black border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-blue-600 outline-none transition-all font-mono"
      />
      <select
        value={region}
        onChange={e => setRegion(e.target.value)}
        className="w-full bg-black border border-zinc-800 px-4 py-2.5 rounded-xl text-sm text-zinc-400 outline-none focus:border-blue-600"
      >
        {REGION_OPTIONS.map(r => (
          <option key={r.key} value={r.key}>{r.label}</option>
        ))}
      </select>
      <button
        onClick={buscar}
        className={`w-full ${accentClass.includes('blue') ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'} text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest transition-all`}
      >
        Analizar
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function TarjetaJugador({ jugador, color }: { jugador: Jugador; color: string }) {
  const scoreColor = jugador.metricas.topgapScore >= 70
    ? 'text-green-400' : jugador.metricas.topgapScore >= 45
    ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className={`bg-zinc-900/60 border ${color} rounded-2xl p-5 flex flex-col items-center gap-2`}>
      <p className="text-xs text-zinc-500 font-mono">{jugador.region}</p>
      <h3 className="font-black text-lg text-white tracking-tight">{jugador.riotId}</h3>
      <div className={`text-4xl font-black ${scoreColor}`}>{jugador.metricas.topgapScore}</div>
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">TopGap Score</p>
      <p className="text-[10px] text-zinc-700 mt-1">{jugador.partidasAnalizadas} partidas top lane</p>
    </div>
  )
}

function BarraComparacion({
  dim, v1, v2, nombre1, nombre2
}: {
  dim: typeof DIMENSIONES[0]
  v1: number; v2: number
  nombre1: string; nombre2: string
}) {
  const pct1 = Math.min((v1 / dim.max) * 100, 100)
  const pct2 = Math.min((v2 / dim.max) * 100, 100)
  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-bold ${winner === 1 ? 'text-blue-400' : 'text-zinc-500'}`}>
          {dim.fmt(v1)}
        </span>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{dim.label}</span>
        <span className={`text-xs font-bold ${winner === 2 ? 'text-orange-400' : 'text-zinc-500'}`}>
          {dim.fmt(v2)}
        </span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden flex">
        {/* Barra izquierda (jugador 1) */}
        <div className="flex justify-end w-1/2">
          <div
            className="h-full rounded-l-full bg-blue-500 transition-all duration-700"
            style={{ width: `${pct1}%` }}
          />
        </div>
        {/* Separador central */}
        <div className="w-px bg-zinc-600 shrink-0" />
        {/* Barra derecha (jugador 2) */}
        <div className="flex justify-start w-1/2">
          <div
            className="h-full rounded-r-full bg-orange-500 transition-all duration-700"
            style={{ width: `${pct2}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [j1, setJ1] = useState<Jugador | null>(null)
  const [j2, setJ2] = useState<Jugador | null>(null)

  const minPartidas = j1 && j2
    ? Math.min(j1.partidasAnalizadas, j2.partidasAnalizadas)
    : null

  const veredicto = j1 && j2
    ? j1.metricas.topgapScore > j2.metricas.topgapScore
      ? { ganador: j1.riotId, color: 'text-blue-400' }
      : j2.metricas.topgapScore > j1.metricas.topgapScore
      ? { ganador: j2.riotId, color: 'text-orange-400' }
      : { ganador: 'EMPATE', color: 'text-zinc-400' }
    : null

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* TÍTULO */}
        <div className="text-center pt-2">
          <h1 className="text-zinc-600 text-xs uppercase tracking-[0.3em] font-bold">Gap Analysis · Top Lane</h1>
        </div>

        {/* BUSCADORES */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-blue-900/40 rounded-2xl p-6">
            {j1 ? (
              <div className="space-y-4">
                <TarjetaJugador jugador={j1} color="border-blue-800" />
                <button
                  onClick={() => setJ1(null)}
                  className="w-full text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
                >
                  Cambiar jugador
                </button>
              </div>
            ) : (
              <BuscadorJugador label="Jugador 1" onResult={setJ1} accentClass="text-blue-500" />
            )}
          </div>

          <div className="bg-zinc-900/50 border border-orange-900/40 rounded-2xl p-6">
            {j2 ? (
              <div className="space-y-4">
                <TarjetaJugador jugador={j2} color="border-orange-800" />
                <button
                  onClick={() => setJ2(null)}
                  className="w-full text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
                >
                  Cambiar jugador
                </button>
              </div>
            ) : (
              <BuscadorJugador label="Jugador 2" onResult={setJ2} accentClass="text-orange-500" />
            )}
          </div>
        </div>

        {/* GAP ANALYSIS */}
        {j1 && j2 && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-8">
            {/* Veredicto */}
            <div className="text-center space-y-1">
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em]">Veredicto TopGap</p>
              <p className={`text-2xl font-black tracking-tight ${veredicto?.color}`}>
                {veredicto?.ganador === 'EMPATE' ? 'EMPATE' : `${veredicto?.ganador} es mejor`}
              </p>
              <p className="text-zinc-700 text-xs">
                Diferencia: {Math.abs(j1.metricas.topgapScore - j2.metricas.topgapScore)} puntos · {minPartidas} partidas analizadas c/u
              </p>
            </div>

            {/* Barras */}
            <div className="space-y-4">
              {/* Cabecera */}
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-blue-500">{j1.riotId.split('#')[0]}</span>
                <span className="text-orange-500">{j2.riotId.split('#')[0]}</span>
              </div>

              {DIMENSIONES.map(dim => (
                <BarraComparacion
                  key={dim.key}
                  dim={dim}
                  v1={(j1.metricas as any)[dim.key]}
                  v2={(j2.metricas as any)[dim.key]}
                  nombre1={j1.riotId}
                  nombre2={j2.riotId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {(!j1 || !j2) && (
          <div className="text-center py-12 text-zinc-700 text-sm italic">
            {!j1 && !j2
              ? 'Busca dos Top Laners para comparar su rendimiento'
              : 'Ahora busca el segundo jugador para ver el análisis'}
          </div>
        )}
      </div>
    </main>
  )
}
