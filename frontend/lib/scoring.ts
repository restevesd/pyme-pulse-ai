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

// Cálculo con renormalización: ignora segmentos ausentes (null/undefined) y reescala pesos
export function computeScore(input: ScoreInputs): number {
  const w = input.weights ?? { financials: 0.6, social: 0.25, letters: 0.15 }

  const parts: Array<{ value: number; weight: number }> = []
  if (isPresent(input.financials)) parts.push({ value: clamp(input.financials!), weight: w.financials })
  if (isPresent(input.social)) parts.push({ value: clamp(input.social!), weight: w.social })
  if (isPresent(input.letters)) parts.push({ value: clamp(input.letters!), weight: w.letters })

  if (parts.length === 0) return 0

  const weightSum = parts.reduce((s, p) => s + p.weight, 0)
  if (weightSum === 0) return 0
  const normalized = parts.reduce((s, p) => s + p.value * (p.weight / weightSum), 0)
  return clamp(normalized)
}

// Regla demo de monto: factor por score * tope por activos
export function computeLoanAmount(score: number, totalActivo: number) {
  const factor = score >= 80 ? 0.35 : score >= 65 ? 0.25 : score >= 50 ? 0.15 : 0
  const amount = Math.round(totalActivo * factor)
  const approved = factor > 0
  const rate = approved ? (score >= 80 ? 14.5 : score >= 65 ? 18.0 : 24.0) : 0
  const term = approved ? (score >= 80 ? 36 : score >= 65 ? 24 : 12) : 0
  return { approved, amount, rate, term }
}

function isPresent(n: MaybeNumber): n is number {
  return typeof n === "number" && Number.isFinite(n)
}
function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}
