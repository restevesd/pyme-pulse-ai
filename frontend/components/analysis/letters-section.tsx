"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

export type LettersMetrics = {
  count: number
  avgSentiment: number // 0-1
  keyPhrases: string[]
  composite: number // 0-100
}

export function LettersSection({
  files,
  onFilesChange,
  onMetricsChange,
}: {
  files: File[]
  onFilesChange: (files: File[]) => void
  onMetricsChange: (m: LettersMetrics) => void
}) {
  const [summary, setSummary] = useState("")
  const [avgSentiment, setAvgSentiment] = useState(0.7)
  const [keyPhrases, setKeyPhrases] = useState<string>("puntual, cumplimiento, calidad, atención")

  useEffect(() => {
    const phrases = keyPhrases
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const comp = Math.round(Math.max(0, Math.min(1, avgSentiment)) * 100)
    onMetricsChange({ count: files.length, avgSentiment, keyPhrases: phrases, composite: comp })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, avgSentiment, keyPhrases])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-800" />
          Cartas de recomendación
        </CardTitle>
        <CardDescription>
          Sube cartas (PDF, TXT o imágenes). Sugerimos mostrar: número de cartas, sentimiento promedio, palabras clave.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Subir archivos (múltiples)</Label>
            <Input
              type="file"
              accept=".pdf,.txt,image/*"
              multiple
              onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
            />
            <div className="text-xs text-muted-foreground">{files.length} archivo(s) seleccionado(s)</div>
          </div>
          <div className="grid gap-2">
            <Label>Sentimiento promedio (0-1)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={avgSentiment}
              onChange={(e) => setAvgSentiment(Number(e.target.value || 0))}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Palabras clave (separadas por coma)</Label>
          <Input value={keyPhrases} onChange={(e) => setKeyPhrases(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label>Resumen (opcional)</Label>
          <Textarea
            placeholder="Pega aquí un resumen de las cartas o insights clave (opcional)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Stat label="N.º de cartas" value={`${files.length}`} />
          <Stat label="Sentimiento promedio" value={avgSentiment.toFixed(2)} />
          <Stat label="Score cartas" value={`${Math.round(Math.max(0, Math.min(1, avgSentiment)) * 100)} / 100`} />
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
