export type Metricas = {
  kdaAvg: number
  winrate: number
  dmgShareAvg: number
  killParticipationAvg: number
  visionScorePerMin: number
  topgapScore: number
}

export type Jugador = {
  puuid: string
  riotId: string
  region: string
  partidasAnalizadas: number
  metricas: Metricas
}

export type AnalisisGuardado = {
  id: number
  titulo: string
  creado_en: string
  ganador_nombre: string
  diferencia: number
  partidas_n: number
}
