const API_KEY = process.env.RIOT_API_KEY!

// Mapeo de servidor a routing regional para la API de Riot
export const REGIONS: Record<string, { platform: string; routing: string; label: string }> = {
  na1:  { platform: 'na1.api.riotgames.com',  routing: 'americas', label: 'NA' },
  la1:  { platform: 'la1.api.riotgames.com',  routing: 'americas', label: 'LAN' },
  la2:  { platform: 'la2.api.riotgames.com',  routing: 'americas', label: 'LAS' },
  br1:  { platform: 'br1.api.riotgames.com',  routing: 'americas', label: 'BR' },
  euw1: { platform: 'euw1.api.riotgames.com', routing: 'europe',   label: 'EUW' },
  eun1: { platform: 'eun1.api.riotgames.com', routing: 'europe',   label: 'EUNE' },
  kr:   { platform: 'kr.api.riotgames.com',   routing: 'asia',     label: 'KR' },
  jp1:  { platform: 'jp1.api.riotgames.com',  routing: 'asia',     label: 'JP' },
}

async function riotFetch(url: string) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': API_KEY },
    next: { revalidate: 300 }, // cache 5 min
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Riot API ${res.status}: ${err}`)
  }
  return res.json()
}

// 1. Obtener PUUID por RiotID (gameName#tagLine)
export async function getPUUID(gameName: string, tagLine: string, routing: string) {
  const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  return riotFetch(url) as Promise<{ puuid: string; gameName: string; tagLine: string }>
}

// 2. Obtener IDs de las últimas partidas ranked solo/duo
export async function getMatchIds(puuid: string, routing: string, count = 20, start = 0) {
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=${count}&start=${start}`
  return riotFetch(url) as Promise<string[]>
}

// 3. Obtener detalle de una partida
export async function getMatch(matchId: string, routing: string) {
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`
  return riotFetch(url)
}

// 4. Obtener timeline de una partida (para stats @15)
export async function getMatchTimeline(matchId: string, routing: string) {
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`
  return riotFetch(url)
}

// ─── MÉTRICAS INTERNAS ───────────────────────────────────────────────────────
// Solo nosotros sabemos qué se está evaluando

export interface MetricasInternas {
  // Laning
  csDiff15Avg: number        // CS diff promedio al min 15 vs rival top
  goldDiff15Avg: number      // Gold diff promedio al min 15 vs rival top
  soloKillsAvg: number       // Solo kills promedio por partida

  // Impacto en el juego
  dmgShareAvg: number        // % del daño total del equipo
  killParticipationAvg: number // % participación en kills del equipo

  // Consistencia
  kdaAvg: number             // KDA promedio
  winrate: number            // % victorias

  // Vision / control de mapa
  visionScorePerMin: number  // Vision score por minuto

  // Puntuación TopGap (fórmula interna)
  topgapScore: number        // 0-100
}

// Extrae las métricas de un jugador a partir de sus partidas
export function calcularMetricas(partidas: any[], puuid: string): MetricasInternas {
  if (!partidas.length) return metricasVacias()

  let csDiff15Sum = 0, goldDiff15Sum = 0, soloKills = 0
  let dmgShareSum = 0, kpSum = 0, kdaSum = 0, wins = 0, visionSum = 0
  let minSum = 0, partidasConTimeline = 0

  for (const p of partidas) {
    const info = p.info
    const participant = info.participants.find((x: any) => x.puuid === puuid)
    if (!participant) continue

    const durMin = info.gameDuration / 60
    const teamKills = info.participants
      .filter((x: any) => x.teamId === participant.teamId)
      .reduce((s: number, x: any) => s + x.kills, 0)

    // KDA
    const kda = participant.deaths === 0
      ? participant.kills + participant.assists
      : (participant.kills + participant.assists) / participant.deaths
    kdaSum += kda

    // Kill participation
    const kp = teamKills > 0 ? (participant.kills + participant.assists) / teamKills : 0
    kpSum += kp

    // Damage share
    const teamDmg = info.participants
      .filter((x: any) => x.teamId === participant.teamId)
      .reduce((s: number, x: any) => s + x.totalDamageDealtToChampions, 0)
    const dmgShare = teamDmg > 0 ? participant.totalDamageDealtToChampions / teamDmg : 0
    dmgShareSum += dmgShare

    // Vision
    visionSum += participant.visionScore / durMin
    minSum += durMin

    // Solo kills (challenges)
    soloKills += participant.challenges?.soloKills ?? 0

    // Win
    if (participant.win) wins++

    // CS diff @15 y gold diff @15 (si hay timeline)
    if (p.timeline) {
      partidasConTimeline++
      const frames = p.timeline.info.frames
      const frame15 = frames[15] // frame = 1 minuto
      if (frame15) {
        const participantIdx = info.participants.findIndex((x: any) => x.puuid === puuid)
        const participantId = participantIdx + 1

        // Buscar rival en la misma lane (top = lane 1 en el timeline)
        const myFrame = frame15.participantFrames[participantId]

        // Rival directo: buscar el participante del equipo enemigo con menor índice de lane
        const rival = info.participants.find((x: any) =>
          x.teamId !== participant.teamId &&
          (x.teamPosition === 'TOP' || x.individualPosition === 'TOP')
        )
        if (rival) {
          const rivalId = info.participants.findIndex((x: any) => x.puuid === rival.puuid) + 1
          const rivalFrame = frame15.participantFrames[rivalId]
          if (myFrame && rivalFrame) {
            csDiff15Sum += (myFrame.minionsKilled + myFrame.jungleMinionsKilled) -
                           (rivalFrame.minionsKilled + rivalFrame.jungleMinionsKilled)
            goldDiff15Sum += myFrame.totalGold - rivalFrame.totalGold
          }
        }
      }
    }
  }

  const n = partidas.length
  const nt = partidasConTimeline || 1

  const csDiff15Avg = csDiff15Sum / nt
  const goldDiff15Avg = goldDiff15Sum / nt
  const soloKillsAvg = soloKills / n
  const dmgShareAvg = dmgShareSum / n
  const killParticipationAvg = kpSum / n
  const kdaAvg = kdaSum / n
  const winrate = wins / n
  const visionScorePerMin = visionSum / n

  // ── Fórmula TopGap Score ─────────────────────────────────────────────
  // Cada dimensión se normaliza a 0-100, luego se aplican los pesos acordados:
  //   Dominio de línea:       35%
  //   Disciplina (no morir):  35%
  //   Impacto en teamfights:  15%
  //   Control de visión:      15%

  // 1. DOMINIO DE LÍNEA (35%)
  //    CS diff @15: rango útil -20 a +20 cs
  const subCS    = Math.min(Math.max((csDiff15Avg + 20) / 40, 0), 1) * 100
  //    Gold diff @15: rango útil -1500 a +1500 oro
  const subGold  = Math.min(Math.max((goldDiff15Avg + 1500) / 3000, 0), 1) * 100
  //    Solo kills: rango 0 a 3 por partida
  const subSolo  = Math.min(soloKillsAvg / 3, 1) * 100
  const scoreLinea = (subCS + subGold + subSolo) / 3

  // 2. DISCIPLINA — no morir (35%)
  //    Muertes: 0 muertes = 100 pts, 5+ muertes = 0 pts (escala inversa)
  const deathsAvg = partidas.reduce((s: number, p: any) => {
    const part = p.info?.participants?.find((x: any) => x.puuid === puuid)
    return s + (part?.deaths ?? 0)
  }, 0) / n
  const subDeaths = Math.min(Math.max(1 - deathsAvg / 5, 0), 1) * 100
  //    KDA: rango 0 a 6
  const subKDA    = Math.min(kdaAvg / 6, 1) * 100
  const scoreDisciplina = (subDeaths * 0.6 + subKDA * 0.4) // muertes pesan más

  // 3. IMPACTO EN TEAMFIGHTS (15%)
  //    Kill participation: rango 0 a 70%
  const subKP    = Math.min(killParticipationAvg / 70, 1) * 100
  //    Daño del equipo: rango 0 a 35%
  const subDmg   = Math.min(dmgShareAvg / 35, 1) * 100
  //    Winrate: directo 0-100%
  const subWin   = winrate * 100
  const scoreTeamfights = (subKP + subDmg + subWin) / 3

  // 4. CONTROL DE VISIÓN (15%)
  //    Vision score/min: rango 0 a 2.0
  const scoreVision = Math.min(visionScorePerMin / 2, 1) * 100

  // SCORE FINAL PONDERADO
  const topgapScore = Math.round(
    scoreLinea       * 0.35 +
    scoreDisciplina  * 0.35 +
    scoreTeamfights  * 0.15 +
    scoreVision      * 0.15
  )

  return {
    csDiff15Avg: Math.round(csDiff15Avg * 10) / 10,
    goldDiff15Avg: Math.round(goldDiff15Avg),
    soloKillsAvg: Math.round(soloKillsAvg * 10) / 10,
    dmgShareAvg: Math.round(dmgShareAvg * 1000) / 10,
    killParticipationAvg: Math.round(killParticipationAvg * 1000) / 10,
    kdaAvg: Math.round(kdaAvg * 100) / 100,
    winrate: Math.round(winrate * 1000) / 10,
    visionScorePerMin: Math.round(visionScorePerMin * 100) / 100,
    topgapScore,
  }
}

function metricasVacias(): MetricasInternas {
  return {
    csDiff15Avg: 0, goldDiff15Avg: 0, soloKillsAvg: 0,
    dmgShareAvg: 0, killParticipationAvg: 0, kdaAvg: 0,
    winrate: 0, visionScorePerMin: 0, topgapScore: 0,
  }
}
