'use server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ── Buscar jugador individual (llama al backend → Riot API) ───────────────────
export async function buscarJugador(riotId: string, region: string) {
  try {
    const res = await fetch(`${API_URL}/api/jugadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riotId, region }),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!data.ok) return { error: data.error }

    // El backend guardó el jugador — ahora obtenemos sus métricas desde Riot
    // directamente para el análisis visual (el backend guarda en BD, el front muestra)
    const metricas = await obtenerMetricasParaFront(riotId, region)
    return metricas
  } catch (e: any) {
    return { error: `Error de conexión con el backend: ${e.message}` }
  }
}

// ── Crear análisis completo (llama a POST /api/analisis del backend) ──────────
export async function crearAnalisis(
  riotId1: string, region1: string,
  riotId2: string, region2: string,
  emailUsuario?: string
) {
  try {
    const res = await fetch(`${API_URL}/api/analisis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riotId1, region1, riotId2, region2, emailUsuario }),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!data.ok) return { error: data.error }
    return data.data
  } catch (e: any) {
    return { error: `Error de conexión con el backend: ${e.message}` }
  }
}

// ── Obtener historial de análisis guardados ───────────────────────────────────
export async function getHistorialAnalisis() {
  try {
    const res = await fetch(`${API_URL}/api/analisis`, { cache: 'no-store' })
    const data = await res.json()
    return data.ok ? data.data : []
  } catch {
    return []
  }
}

// ── Obtener reporte detallado de un análisis ──────────────────────────────────
export async function getReporte(id: number) {
  try {
    const res = await fetch(`${API_URL}/api/analisis/${id}/reporte`, { cache: 'no-store' })
    const data = await res.json()
    return data.ok ? data.data : null
  } catch {
    return null
  }
}

// ── Métricas para visualización en el frontend ───────────────────────────────
// El backend guarda en BD; el front calcula independientemente para la UI
import { getPUUID, getMatchIds, getMatch, calcularMetricas, REGIONS } from './riot'

const TARGET = 10

async function obtenerMetricasParaFront(riotId: string, region: string) {
  const regionData = REGIONS[region]
  if (!regionData) return { error: 'Región inválida' }

  const [gameName, tagLine] = riotId.includes('#')
    ? riotId.split('#')
    : [riotId, region.toUpperCase()]

  try {
    const account = await getPUUID(gameName, tagLine, regionData.routing)
    const partidasTop: any[] = []
    let offset = 0

    while (partidasTop.length < TARGET) {
      const ids = await getMatchIds(account.puuid, regionData.routing, 5, offset)
      if (!ids.length) break
      const matches = await Promise.all(ids.map((id: string) => getMatch(id, regionData.routing)))
      for (const m of matches) {
        const p = m.info?.participants?.find((x: any) => x.puuid === account.puuid)
        if (p && (p.teamPosition === 'TOP' || p.individualPosition === 'TOP')) {
          partidasTop.push(m)
          if (partidasTop.length === TARGET) break
        }
      }
      offset += 5
      if (offset >= 40) break
    }

    if (!partidasTop.length) return { error: 'No se encontraron partidas ranked en Top Lane.' }

    return {
      puuid: account.puuid,
      riotId: `${account.gameName}#${account.tagLine}`,
      region: regionData.label,
      partidasAnalizadas: partidasTop.length,
      metricas: calcularMetricas(partidasTop, account.puuid),
    }
  } catch (e: any) {
    if (e.message?.includes('404')) return { error: 'Jugador no encontrado.' }
    if (e.message?.includes('403')) return { error: 'API Key de Riot expirada.' }
    return { error: e.message }
  }
}
