"use client"

import { useEffect, useState } from "react"

export type SocialMetrics = {
  followers: number
  engagementRate: number
  growth30d: number
  sentiment: number
  postsPerWeek: number
  responseRate: number
  verified: boolean
  riskFlags: number
  composite: number
}

export default function SocialSection({
  handles,
  onHandlesChange,
  onMetricsChange,
}: {
  handles: { twitter?: string; facebook?: string }
  onHandlesChange: (h: { twitter?: string; facebook?: string }) => void
  onMetricsChange: (m: SocialMetrics) => void
}) {
  const [metrics, setMetrics] = useState<SocialMetrics>({
    followers: 12000,
    engagementRate: 2.4,
    growth30d: 3.2,
    sentiment: 0.62,
    postsPerWeek: 3,
    responseRate: 28,
    verified: false,
    riskFlags: 0,
    composite: 0,
  })

  useEffect(() => {
    const normFollowers = Math.min(1, metrics.followers / 50000)
    const normEng = Math.min(1, metrics.engagementRate / 5)
    const normGrowth = Math.min(1, (metrics.growth30d + 5) / 10)
    const normSent = Math.max(0, Math.min(1, metrics.sentiment))
    const normPosts = Math.min(1, metrics.postsPerWeek / 5)
    const normResp = Math.min(1, metrics.responseRate / 40)
    const penalty = metrics.riskFlags * 0.08 + (metrics.verified ? 0 : 0.05)
    const base =
      normFollowers * 0.2 + normEng * 0.25 + normGrowth * 0.15 + normSent * 0.2 + normPosts * 0.1 + normResp * 0.1
    const comp = Math.max(0, Math.min(1, base - penalty))
    onMetricsChange({ ...metrics, composite: Math.round(comp * 100) })
  }, [metrics, onMetricsChange])

  return (
    <div className="rounded-md border">
      <div className="border-b px-4 py-3 font-semibold">Perfiles sociales</div>
      <div className="p-4 grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label>Twitter (X)</label>
            <input
              className="h-10 rounded-md border px-3"
              placeholder="@tu_empresa o URL"
              value={handles.twitter ?? ""}
              onChange={(e) => onHandlesChange({ ...handles, twitter: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label>Facebook</label>
            <input
              className="h-10 rounded-md border px-3"
              placeholder="Nombre de página o URL"
              value={handles.facebook ?? ""}
              onChange={(e) => onHandlesChange({ ...handles, facebook: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Metric
            label="Seguidores"
            value={metrics.followers}
            onChange={(n) => setMetrics((m) => ({ ...m, followers: n }))}
          />
          <Metric
            label="Engagement (%)"
            value={metrics.engagementRate}
            onChange={(n) => setMetrics((m) => ({ ...m, engagementRate: n }))}
          />
          <Metric
            label="Crecimiento 30d (%)"
            value={metrics.growth30d}
            onChange={(n) => setMetrics((m) => ({ ...m, growth30d: n }))}
          />
          <Metric
            label="Sentimiento (0-1)"
            value={metrics.sentiment}
            onChange={(n) => setMetrics((m) => ({ ...m, sentiment: n }))}
          />
          <Metric
            label="Posts/semana"
            value={metrics.postsPerWeek}
            onChange={(n) => setMetrics((m) => ({ ...m, postsPerWeek: n }))}
          />
          <Metric
            label="Tasa respuesta (%)"
            value={metrics.responseRate}
            onChange={(n) => setMetrics((m) => ({ ...m, responseRate: n }))}
          />
          <Metric
            label="Banderas riesgo (0-3)"
            value={metrics.riskFlags}
            onChange={(n) => setMetrics((m) => ({ ...m, riskFlags: n }))}
          />
          <div className="grid gap-2">
            <label>Verificación</label>
            <button
              type="button"
              className={`h-10 rounded-md border px-3 ${metrics.verified ? "bg-navy-800 text-white" : ""}`}
              onClick={() => setMetrics((m) => ({ ...m, verified: !m.verified }))}
            >
              {metrics.verified ? "Cuenta verificada" : "Marcar como verificada"}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Stat label="Seguidores" value={metrics.followers.toLocaleString()} />
          <Stat label="Engagement" value={`${metrics.engagementRate.toFixed(2)}%`} />
          <Stat label="Crecimiento 30d" value={`${metrics.growth30d.toFixed(2)}%`} />
          <Stat label="Sentimiento" value={metrics.sentiment.toFixed(2)} />
          <Stat label="Posts/semana" value={`${metrics.postsPerWeek}`} />
          <Stat label="Resp. a clientes" value={`${metrics.responseRate.toFixed(0)}%`} />
          <Stat label="Verificado" value={metrics.verified ? "Sí" : "No"} />
          <Stat label="Flags riesgo" value={`${metrics.riskFlags}`} />
          <Stat label="Score redes" value={`${Math.round(metrics.composite)} / 100`} />
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="grid gap-2">
      <label>{label}</label>
      <input
        type="number"
        inputMode="decimal"
        className="h-10 rounded-md border px-3"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
      />
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
