export type MaybeNumber = number | null | undefined

export type ScoreInputs = {
  financials: MaybeNumber
  social: MaybeNumber
  letters: MaybeNumber
  weights?: {
    financials: number
    social: number
    letters: number
  }
}

export function computeScore(input: ScoreInputs): number {
  const w = input.weights ?? { financials: 0.6, social: 0.25, letters: 0.15 }
  const parts: Array<{ v: number; w: number }> = []
  if (isNum(input.financials)) parts.push({ v: clamp(input.financials!), w: w.financials })
  if (isNum(input.social)) parts.push({ v: clamp(input.social!), w: w.social })
  if (isNum(input.letters)) parts.push({ v: clamp(input.letters!), w: w.letters })
  if (parts.length === 0) return 0
  const sumW = parts.reduce((s, p) => s + p.w, 0)
  const score = parts.reduce((s, p) => s + p.v * (p.w / sumW), 0)
  return clamp(score)
}

export function computeLoanAmount(score: number, totalActivo: number) {
  const factor = score >= 80 ? 0.35 : score >= 65 ? 0.25 : score >= 50 ? 0.15 : 0
  const amount = Math.round((totalActivo || 0) * factor)
  const approved = factor > 0
  const rate = approved ? (score >= 80 ? 14.5 : score >= 65 ? 18.0 : 24.0) : 0
  const term = approved ? (score >= 80 ? 36 : score >= 65 ? 24 : 12) : 0
  return { approved, amount, rate, term }
}

function isNum(n: MaybeNumber): n is number {
  return typeof n === "number" && Number.isFinite(n)
}
function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}
