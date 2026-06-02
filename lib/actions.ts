'use server'
import { getPUUID, getMatchIds, getMatch, calcularMetricas, REGIONS } from './riot'

const TARGET_TOP_MATCHES = 10

export async function buscarJugador(riotId: string, region: string) {
  const regionData = REGIONS[region]
  if (!regionData) throw new Error('Región inválida')

  const [gameName, tagLine] = riotId.includes('#')
    ? riotId.split('#')
    : [riotId, region.toUpperCase()]

  try {
    // 1. PUUID
    const account = await getPUUID(gameName, tagLine, regionData.routing)

    // 2. Traer IDs en bloques hasta reunir 10 partidas en top lane
    const partidasTop: any[] = []
    let offset = 0
    const BATCH = 5

    while (partidasTop.length < TARGET_TOP_MATCHES) {
      const ids = await getMatchIds(account.puuid, regionData.routing, BATCH, offset)
      if (!ids.length) break

      // Fetch del bloque en paralelo (5 a la vez está dentro del rate limit)
      const matches = await Promise.all(ids.map(id => getMatch(id, regionData.routing)))

      for (const match of matches) {
        const participant = match.info?.participants?.find((x: any) => x.puuid === account.puuid)
        if (participant && (participant.teamPosition === 'TOP' || participant.individualPosition === 'TOP')) {
          partidasTop.push(match)
          if (partidasTop.length === TARGET_TOP_MATCHES) break
        }
      }

      offset += BATCH
      if (offset >= 40) break // máximo 40 partidas revisadas
    }

    if (!partidasTop.length) {
      return { error: 'No se encontraron partidas ranked en Top Lane.' }
    }

    // 3. Calcular métricas
    const metricas = calcularMetricas(partidasTop, account.puuid)

    return {
      puuid: account.puuid,
      riotId: `${account.gameName}#${account.tagLine}`,
      region: regionData.label,
      partidasAnalizadas: partidasTop.length,
      metricas,
    }
  } catch (e: any) {
    if (e.message?.includes('404')) return { error: 'Jugador no encontrado. Verifica el nombre y región.' }
    if (e.message?.includes('403')) return { error: 'API Key de Riot expirada. Regénérala en developer.riotgames.com' }
    return { error: `Error al consultar Riot: ${e.message}` }
  }
}
