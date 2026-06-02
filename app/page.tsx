'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { buscarJugador, crearAnalisis, getHistorialAnalisis, getAnalisisIA, eliminarAnalisis } from '@/lib/actions'
import { REGIONS } from '@/lib/riot'
import type { Jugador, AnalisisGuardado } from '@/lib/types'

const REGION_OPTIONS = Object.entries(REGIONS).map(([key, val]) => ({ key, label: val.label }))

type Metricas = {
  kdaAvg: number; winrate: number; dmgShareAvg: number
  killParticipationAvg: number; visionScorePerMin: number; topgapScore: number
}

const DIMENSIONES = [
  { key: 'topgapScore',          label: 'TopGap Score',        max: 100, fmt: (v: number) => `${v}` },
  { key: 'winrate',              label: 'Dominio de Línea',    max: 100, fmt: (v: number) => `${v}%` },
  { key: 'kdaAvg',               label: 'Disciplina',          max: 6,   fmt: (v: number) => v.toFixed(2) },
  { key: 'killParticipationAvg', label: 'Impacto en Peleas',   max: 70,  fmt: (v: number) => `${v}%` },
  { key: 'visionScorePerMin',    label: 'Control de Visión',   max: 2,   fmt: (v: number) => v.toFixed(2) },
]

const PASOS = ['Buscando cuenta...', 'Obteniendo partidas ranked...', 'Calculando métricas...', 'Guardando en base de datos...']

function BuscadorJugador({ label, onResult, accentClass, cache, setCache, otroJugador }: {
  label: string; onResult: (j: Jugador) => void; accentClass: string
  cache: Record<string, Jugador>; setCache: (c: any) => void; otroJugador?: Jugador | null
}) {
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('la1')
  const [loading, setLoading] = useState(false)
  const [paso, setPaso] = useState(0)
  const [error, setError] = useState('')

  const buscar = async () => {
    // Validaciones básicas
    if (!riotId.trim()) {
      setError('Ingresa un nombre de invocador.')
      return
    }
    if (!riotId.includes('#')) {
      setError('El formato debe ser Nombre#TAG (ej: Faker#KR1)')
      return
    }
    const [nombre, tag] = riotId.split('#')
    if (!nombre.trim() || nombre.trim().length < 2) {
      setError('El nombre del invocador es muy corto.')
      return
    }
    if (!tag.trim() || tag.trim().length < 2) {
      setError('El TAG es inválido. Ej: Faker#KR1')
      return
    }
    // Validar duplicado vs el otro slot
    if (otroJugador) {
      const [otroNombre] = otroJugador.riotId.split('#')
      const [nuevoNombre] = riotId.trim().split('#')
      if (otroNombre.toLowerCase() === nuevoNombre.toLowerCase() &&
          otroJugador.region === (REGIONS[region]?.label ?? region)) {
        setError('Este jugador ya está en el otro slot. Elige un oponente diferente.')
        return
      }
    }

    setLoading(true); setError(''); setPaso(0)
    const iv = setInterval(() => setPaso(p => p < PASOS.length - 1 ? p + 1 : p), 2500)
    const cacheKey = `${riotId.trim().toLowerCase()}#${region}`

    // Si ya fue analizado antes, reutilizar resultado (ahorra requests a Riot)
    if (cache[cacheKey]) {
      clearInterval(iv)
      setLoading(false)
      onResult(cache[cacheKey])
      return
    }

    const res = await buscarJugador(riotId.trim(), region) as any
    clearInterval(iv); setPaso(PASOS.length - 1)
    await new Promise(r => setTimeout(r, 300))
    setLoading(false)

    if (res.error) {
      // Fix 3: mensaje amigable para invocador no encontrado
      if (
        res.status === 404 ||
        res.error?.includes('404') ||
        res.error?.toLowerCase().includes('no encontrad') ||
        res.error?.toLowerCase().includes('not found')
      ) {
        setError('No se encontró al usuario')
      } else {
        setError(res.error)
      }
      return
    }

    setCache((prev: Record<string, Jugador>) => ({ ...prev, [cacheKey]: res }))
    onResult(res)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-5 py-8">
      <div className={`w-12 h-12 rounded-full border-2 border-zinc-800 border-t-current ${accentClass} animate-spin`} />
      <div className="space-y-2 w-full">
        {PASOS.map((p, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs transition-all ${
            i < paso ? 'text-zinc-600 line-through' : i === paso ? 'text-zinc-300 font-medium' : 'text-zinc-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i <= paso ? 'bg-current' : 'bg-zinc-800'}`} />
            {p}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-700 uppercase tracking-widest">Analizando 10+ partidas · ~20s</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
      <input value={riotId} onChange={e => setRiotId(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && buscar()} placeholder="Nombre#TAG"
        className="w-full bg-black border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-blue-600 outline-none font-mono" />
      <select value={region} onChange={e => setRegion(e.target.value)}
        className="w-full bg-black border border-zinc-800 px-4 py-2.5 rounded-xl text-sm text-zinc-400 outline-none focus:border-blue-600">
        {REGION_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
      </select>
      <button onClick={buscar}
        className={`w-full ${accentClass.includes('blue') ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'} text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest transition-all`}>
        Analizar
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function TarjetaJugador({ jugador, color }: { jugador: Jugador; color: string }) {
  const sc = jugador.metricas.topgapScore
  const scoreColor = sc >= 70 ? 'text-green-400' : sc >= 45 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className={`bg-zinc-900/60 border ${color} rounded-2xl p-5 flex flex-col items-center gap-2`}>
      <p className="text-xs text-zinc-500 font-mono">{jugador.region}</p>
      <h3 className="font-black text-lg text-white tracking-tight">{jugador.riotId}</h3>
      <div className={`text-4xl font-black ${scoreColor}`}>{sc}</div>
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">TopGap Score</p>
      <p className="text-[10px] text-zinc-700 mt-1">{jugador.partidasAnalizadas} partidas top lane</p>
    </div>
  )
}

function BarraComparacion({ dim, v1, v2 }: { dim: typeof DIMENSIONES[0]; v1: number; v2: number }) {
  const p1 = Math.min((v1 / dim.max) * 100, 100)
  const p2 = Math.min((v2 / dim.max) * 100, 100)
  const w = v1 > v2 ? 1 : v2 > v1 ? 2 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-bold ${w === 1 ? 'text-blue-400' : 'text-zinc-500'}`}>{dim.fmt(v1)}</span>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{dim.label}</span>
        <span className={`text-xs font-bold ${w === 2 ? 'text-orange-400' : 'text-zinc-500'}`}>{dim.fmt(v2)}</span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden flex">
        <div className="flex justify-end w-1/2">
          <div className="h-full rounded-l-full bg-blue-500 transition-all duration-700" style={{ width: `${p1}%` }} />
        </div>
        <div className="w-px bg-zinc-600 shrink-0" />
        <div className="flex justify-start w-1/2">
          <div className="h-full rounded-r-full bg-orange-500 transition-all duration-700" style={{ width: `${p2}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session } = useSession()
  const userEmail = session?.user?.email ?? undefined
  const [j1, setJ1] = useState<Jugador | null>(null)
  const [j2, setJ2] = useState<Jugador | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [analisisGuardado, setAnalisisGuardado] = useState(false)
  const [analisisId, setAnalisisId] = useState<number | null>(null)
  const [historial, setHistorial] = useState<AnalisisGuardado[]>([])
  const [showHistorial, setShowHistorial] = useState(false)
  const [iaResult, setIaResult] = useState<any>(null)
  const [loadingIA, setLoadingIA] = useState(false)
  const [cache, setCache] = useState<Record<string, Jugador>>({})

  const cargarHistorial = async (email?: string) => {
    const data = await getHistorialAnalisis(email ?? userEmail)
    setHistorial(data)
  }

  // Cargar historial cuando la sesión esté lista
  useEffect(() => {
    if (userEmail) {
      cargarHistorial(userEmail)
    }
  }, [userEmail])

  // Cuando ambos jugadores estén listos → pedir análisis IA automáticamente (sin guardar aún)
  useEffect(() => {
    if (j1 && j2 && !analisisId && !loadingIA) {
      setLoadingIA(true)
      // Obtenemos IA sin guardar en BD
      const [name1, tag1] = j1.riotId.split('#')
      const [name2, tag2] = j2.riotId.split('#')
      const r1 = Object.entries(REGIONS).find(([,v]) => v.label === j1.region)?.[0] || 'la1'
      const r2 = Object.entries(REGIONS).find(([,v]) => v.label === j2.region)?.[0] || 'la1'
      // Guardamos en BD para obtener el ID del análisis y poder pedir IA
      crearAnalisis(`${name1}#${tag1}`, r1, `${name2}#${tag2}`, r2).then(async res => {
        if (res && !res.error) {
          setAnalisisId(res.id)
          const ia = await getAnalisisIA(res.id)
          setIaResult(ia)
        }
        setLoadingIA(false)
      })
    }
  }, [j1, j2])

  // Guardar en historial del usuario (botón manual)
  const handleGuardar = async () => {
    if (!userEmail) return
    if (!j1 || !j2) return
    setGuardando(true)
    const [name1, tag1] = j1.riotId.split('#')
    const [name2, tag2] = j2.riotId.split('#')
    const r1 = Object.entries(REGIONS).find(([,v]) => v.label === j1.region)?.[0] || 'la1'
    const r2 = Object.entries(REGIONS).find(([,v]) => v.label === j2.region)?.[0] || 'la1'
    const res = await crearAnalisis(`${name1}#${tag1}`, r1, `${name2}#${tag2}`, r2, userEmail)
    if (res && !res.error) {
      setAnalisisGuardado(true)
      await cargarHistorial(userEmail)
    }
    setGuardando(false)
  }

  // Eliminar análisis del historial
  const handleEliminar = async (id: number) => {
    const ok = await eliminarAnalisis(id)
    if (ok) {
      setHistorial(prev => prev.filter(a => a.id !== id))
    }
  }

  const minPartidas = j1 && j2 ? Math.min(j1.partidasAnalizadas, j2.partidasAnalizadas) : null
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

        <div className="flex items-center justify-between pt-2">
          <h1 className="text-zinc-600 text-xs uppercase tracking-[0.3em] font-bold">Gap Analysis · Top Lane</h1>
          <button onClick={() => { setShowHistorial(!showHistorial); if (!showHistorial) cargarHistorial() }}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
            {showHistorial ? 'Ocultar historial' : `Historial (${historial.length})`}
          </button>
        </div>

        {/* HISTORIAL */}
        {showHistorial && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Análisis guardados en BD</h2>
            {historial.length === 0 ? (
              <p className="text-zinc-700 text-sm italic">Aún no hay análisis guardados.</p>
            ) : (
              <div className="space-y-2">
                {historial.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 group">
                    <div>
                      <p className="text-sm font-bold text-white">{a.titulo}</p>
                      <p className="text-[10px] text-zinc-600">{new Date(a.creado_en).toLocaleString('es-CO')} · {a.partidas_n} partidas</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {a.ganador_nombre && (
                        <div className="text-right">
                          <p className="text-xs text-green-400 font-bold">{a.ganador_nombre}</p>
                          <p className="text-[10px] text-zinc-600">+{a.diferencia} pts</p>
                        </div>
                      )}
                      {/* Fix 5: botón eliminar */}
                      <button
                        onClick={() => handleEliminar(a.id)}
                        title="Eliminar análisis"
                        className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm leading-none"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUSCADORES */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-blue-900/40 rounded-2xl p-6">
            {j1 ? (
              <div className="space-y-4">
                <TarjetaJugador jugador={j1} color="border-blue-800" />
                <button onClick={() => { setJ1(null); setAnalisisGuardado(false); setAnalisisId(null); setIaResult(null) }}
                  className="w-full text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest">
                  Cambiar jugador
                </button>
              </div>
            ) : <BuscadorJugador label="Jugador 1" onResult={setJ1} accentClass="text-blue-500" cache={cache} setCache={setCache} otroJugador={j2} />}
          </div>
          <div className="bg-zinc-900/50 border border-orange-900/40 rounded-2xl p-6">
            {j2 ? (
              <div className="space-y-4">
                <TarjetaJugador jugador={j2} color="border-orange-800" />
                <button onClick={() => { setJ2(null); setAnalisisGuardado(false); setAnalisisId(null); setIaResult(null) }}
                  className="w-full text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest">
                  Cambiar jugador
                </button>
              </div>
            ) : <BuscadorJugador label="Jugador 2" onResult={setJ2} accentClass="text-orange-500" cache={cache} setCache={setCache} otroJugador={j1} />}
          </div>
        </div>

        {/* GAP ANALYSIS */}
        {j1 && j2 && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-8">
            <div className="text-center space-y-1">
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em]">Veredicto TopGap</p>
              <p className={`text-2xl font-black tracking-tight ${veredicto?.color}`}>
                {veredicto?.ganador === 'EMPATE' ? 'EMPATE' : `${veredicto?.ganador} es mejor`}
              </p>
              <p className="text-zinc-700 text-xs">
                Diferencia: {Math.abs(j1.metricas.topgapScore - j2.metricas.topgapScore)} pts · {minPartidas} partidas analizadas c/u
              </p>
              {/* Botón manual de guardar */}
              {!analisisGuardado && !guardando && (
                <button
                  onClick={handleGuardar}
                  disabled={!userEmail}
                  className="mt-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  💾 Guardar en mi historial
                </button>
              )}
              {guardando && <p className="text-[10px] text-blue-500 animate-pulse">Guardando...</p>}
              {analisisGuardado && <p className="text-[10px] text-green-500">✓ Análisis guardado en BD</p>}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-blue-500">{j1.riotId.split('#')[0]}</span>
                <span className="text-orange-500">{j2.riotId.split('#')[0]}</span>
              </div>
              {DIMENSIONES.map(dim => (
                <BarraComparacion key={dim.key} dim={dim}
                  v1={(j1.metricas as any)[dim.key]}
                  v2={(j2.metricas as any)[dim.key]} />
              ))}
            </div>
          </div>
        )}

        {/* ANÁLISIS IA */}
        {j1 && j2 && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Análisis IA · Gemini</h2>
            </div>

            {loadingIA && (
              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                Gemini está analizando los datos...
              </div>
            )}

            {iaResult && !loadingIA && (
              <div className="space-y-5">
                {/* Resumen principal */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-zinc-300 text-sm leading-relaxed">{iaResult.resumen}</p>
                </div>

                {/* Fortalezas y debilidades */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{j1.riotId.split('#')[0]}</p>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                      <div className="flex gap-2 items-start">
                        <span className="text-green-500 text-xs mt-0.5">↑</span>
                        <p className="text-zinc-300 text-xs">{iaResult.fortaleza_j1}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-red-500 text-xs mt-0.5">↓</span>
                        <p className="text-zinc-500 text-xs">{iaResult.debilidad_j1}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{j2.riotId.split('#')[0]}</p>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                      <div className="flex gap-2 items-start">
                        <span className="text-green-500 text-xs mt-0.5">↑</span>
                        <p className="text-zinc-300 text-xs">{iaResult.fortaleza_j2}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-red-500 text-xs mt-0.5">↓</span>
                        <p className="text-zinc-500 text-xs">{iaResult.debilidad_j2}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recomendación de scouting */}
                <div className="border border-blue-900/50 bg-blue-950/20 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Recomendación de Scouting</p>
                  <p className="text-zinc-300 text-sm">{iaResult.recomendacion}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {(!j1 || !j2) && (
          <div className="text-center py-12 text-zinc-700 text-sm italic">
            {!j1 && !j2 ? 'Busca dos Top Laners para comparar su rendimiento' : 'Ahora busca el segundo jugador'}
          </div>
        )}
      </div>
    </main>
  )
}
