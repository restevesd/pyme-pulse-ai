"use client"

import { useEffect, useState } from "react"

export type LettersMetrics = {
  count: number
  avgSentiment: number
  keyPhrases: string[]
  composite: number
}

export default function LettersSection({
  files,
  onFilesChange,
  onMetricsChange,
}: {
  files: File[]
  onFilesChange: (files: File[]) => void
  onMetricsChange: (m: LettersMetrics) => void
}) {
  const [avgSentiment, setAvgSentiment] = useState(0.7)
  const [keyPhrases, setKeyPhrases] = useState("puntual, cumplimiento, calidad, atención")

  useEffect(() => {
    const phrases = keyPhrases
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const comp = Math.round(Math.max(0, Math.min(1, avgSentiment)) * 100)
    onMetricsChange({ count: files.length, avgSentiment, keyPhrases: phrases, composite: comp })
  }, [files, avgSentiment, keyPhrases, onMetricsChange])

  return (
    <div className="rounded-md border">
      <div className="border-b px-4 py-3 font-semibold">Cartas de recomendación</div>
      <div className="p-4 grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label>Subir archivos (múltiples)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,image/*"
              onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
              className="h-10 rounded-md border px-3 py-1.5"
            />
            <div className="text-xs text-slate-500">{files.length} archivo(s) seleccionado(s)</div>
          </div>
          <div className="grid gap-2">
            <label>Sentimiento promedio (0-1)</label>
            <input
              type="number"
              inputMode="decimal"
              value={avgSentiment}
              onChange={(e) => setAvgSentiment(Number(e.target.value || 0))}
              className="h-10 rounded-md border px-3"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label>Palabras clave (separadas por coma)</label>
          <input
            className="h-10 rounded-md border px-3"
            value={keyPhrases}
            onChange={(e) => setKeyPhrases(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Stat label="N.º de cartas" value={`${files.length}`} />
          <Stat label="Sentimiento promedio" value={avgSentiment.toFixed(2)} />
          <Stat label="Score cartas" value={`${Math.round(Math.max(0, Math.min(1, avgSentiment)) * 100)} / 100`} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
