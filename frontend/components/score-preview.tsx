"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { computeScore } from "@/lib/scoring"
import { ShieldCheck, TrendingUp } from "lucide-react"

export function ScorePreview({ className = "" }: { className?: string }) {
  const [financials, setFinancials] = useState<number>(70)
  const [social, setSocial] = useState<number>(55)
  const [letters, setLetters] = useState<number>(65)

  const score = useMemo(() => {
    return computeScore({
      financials,
      social,
      letters,
      weights: { financials: 0.6, social: 0.25, letters: 0.15 },
    })
  }, [financials, social, letters])

  const riskLabel =
    score >= 80 ? "Muy bajo" : score >= 65 ? "Bajo" : score >= 50 ? "Medio" : score >= 35 ? "Alto" : "Muy alto"

  return (
    <section id="simulador" className="py-16 md:py-24">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-10 space-y-3 text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Demo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Simulador de score (ejemplo)</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ajusta los indicadores para ver cómo cambia un score hipotético. El producto final incluye modelos
            entrenados y explicabilidad de factores.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="financials">Estados financieros</Label>
                <Slider
                  id="financials"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={[financials]}
                  onValueChange={(v) => setFinancials(v[0] ?? 0)}
                />
                <div className="text-sm text-muted-foreground">Valor: {financials}</div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="social">Perfiles sociales</Label>
                <Slider
                  id="social"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={[social]}
                  onValueChange={(v) => setSocial(v[0] ?? 0)}
                />
                <div className="text-sm text-muted-foreground">Valor: {social}</div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="letters">Cartas de recomendación</Label>
                <Slider
                  id="letters"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={[letters]}
                  onValueChange={(v) => setLetters(v[0] ?? 0)}
                />
                <div className="text-sm text-muted-foreground">Valor: {letters}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle>Resultado estimado</CardTitle>
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Demo</Badge>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Score combinado</div>
                  <div className="font-semibold">{Math.round(score)}</div>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    aria-label="Barra de score"
                    aria-valuenow={Math.round(score)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  />
                </div>
                <div className="text-sm">
                  Riesgo: <span className="font-medium">{riskLabel}</span>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Financieros (60%)</span>
                  <span className="text-muted-foreground">{financials}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sociales (25%)</span>
                  <span className="text-muted-foreground">{social}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recomendaciones (15%)</span>
                  <span className="text-muted-foreground">{letters}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Solo fines demostrativos
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> El producto final usa modelos entrenados y
                  validación
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
