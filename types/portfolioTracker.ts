export type PositionStatus =
  | 'active'
  | 'closed'
  | 't1_hit'
  | 't2_hit'
  | 't3_hit'
  | 'stopped_out'

export interface TrackedPosition {
  id: string
  symbol: string
  name: string
  entryPrice: number
  entryDate: string
  stopLoss: number
  t1: number
  t2: number
  t3: number
  status: PositionStatus
  exitPrice: number | null
  exitDate: string | null
  notes: string
  source: 'manual' | 'portfolio_generator'
  percentClosed?: number         // 0, 50, or 100 — absent means 0
  partialExitPrice?: number | null
  partialExitDate?: string | null
}

export interface TrackedPositionWithLive extends TrackedPosition {
  currentPrice: number | null
  dayChangePercent: number | null
  totalChangePercent: number | null
  priceSource: 'live' | 'unavailable'
}
