"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import FinancialForm, { type FinancialFormValues } from "../components/FinancialForm"
import SocialSection, { type SocialMetrics } from "../components/SocialSection"
import LettersSection, { type LettersMetrics } from "../components/LettersSection"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { computeLoanAmount, computeScore } from "../lib/scoring"
import { getApiBase } from "../lib/api"
import { type LucideIcon, LineChart, Share2, Mail, CheckCircle2 } from "lucide-react"

type SsePayload = any
type TabKey = "finanzas" | "redes" | "cartas" | "resultado"

export default function Analyze() {
  // Tabs
  const [activeTab, setActiveTab] = useState<TabKey>("finanzas")

  // Obligatorios
  const [ruc, setRuc] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  // Finanzas (SSE)
  const [financials, setFinancials] = useState<FinancialFormValues | null>(null)
  const [financialReportMd, setFinancialReportMd] = useState<string>("")
  const [financialScore, setFinancialScore] = useState<number | null>(null)

  // Opcionales
  const [socialHandles, setSocialHandles] = useState<{ twitter?: string; facebook?: string }>({})
  const [social, setSocial] = useState<SocialMetrics | null>(null)

  const [lettersFiles, setLettersFiles] = useState<File[]>([])
  const [letters, setLetters] = useState<LettersMetrics | null>(null)

  // SSE
  const [jobId, setJobId] = useState<string | null>(null)
  const [sseStatus, setSseStatus] = useState<"idle" | "connecting" | "open" | "error" | "closed">("idle")
  const esRef = useRef<EventSource | null>(null)

  const [showResult, setShowResult] = useState(false)
  const weights = { financials: 0.6, social: 0.25, letters: 0.15 }

  const score = useMemo(
    () =>
      computeScore({
        financials: financialScore ?? financials?.composite ?? null,
        social: social?.composite ?? null,
        letters: letters?.composite ?? null,
        weights,
      }),
    [financialScore, financials, social, letters],
  )

  const loan = useMemo(
    () => computeLoanAmount(score, financials?.totals?.totalActivo ?? 0),
    [score, financials?.totals?.totalActivo],
  )

  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
    }
  }, [])

  async function handlePdfChange(file: File | null) {
    setPdfFile(file)
    setShowResult(false)
    if (!file) return
    try {
      const apiBase = getApiBase()
      const fd = new FormData()
      fd.append("file", file)
      const resp = await fetch(`${apiBase}/analyze-pdf-estado`, { method: "POST", body: fd })
      if (!resp.ok) throw new Error(`Error ${resp.status}`)
      const data = await resp.json().catch(() => ({}))
      const id = data.jobid ?? data.jobId ?? data.id
      if (!id) throw new Error("Respuesta sin jobid")
      setJobId(id)
      subscribeSse(id, apiBase)
    } catch (e) {
      console.error(e)
      setSseStatus("error")
      alert("No se pudo enviar el PDF para análisis. Revisa el backend.")
    }
  }

  function subscribeSse(id: string, apiBase: string) {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    setSseStatus("connecting")
    const url = `${apiBase}/financial-events?jobid=${encodeURIComponent(id)}`
    const es = new EventSource(url)
    esRef.current = es
    es.onopen = () => setSseStatus("open")
    es.onerror = () => setSseStatus("error")
    es.onmessage = (event) => {
      const data = safeJson(event.data)
      const tipo = data?.tipo ?? "message"
      handleTypedEvent(tipo, data)
    }
    es.addEventListener("resultado-finanzas", (ev) => {
      const data = safeJson((ev as MessageEvent).data)
      handleTypedEvent("resultado-finanzas", data)
    })
    es.addEventListener("informe-financiero-markdown", (ev) => {
      const data = safeJson((ev as MessageEvent).data)
      handleTypedEvent("informe-financiero-markdown", data)
    })
    es.addEventListener("informe-financiero-mardown", (ev) => {
      const data = safeJson((ev as MessageEvent).data)
      handleTypedEvent("informe-financiero-mardown", data)
    })
  }

  function handleTypedEvent(tipo: string, data: SsePayload) {
    if (tipo === "resultado-finanzas") {
      const payload = data?.payload ?? data
      const mapped = mapSseToFinancialValues(payload)
      setFinancials((prev) => ({ ...(prev ?? {}), ...mapped }))
      const comp =
        numberOrNull(payload?.composite) ?? numberOrNull(payload?.scoreFinanzas) ?? numberOrNull(payload?.score) ?? null
      if (comp !== null) setFinancialScore(Math.max(0, Math.min(100, comp)))
    } else if (tipo === "informe-financiero-markdown" || tipo === "informe-financiero-mardown") {
      const md = data?.markdown ?? data?.md ?? data?.texto ?? data?.text ?? ""
      if (typeof md === "string") setFinancialReportMd(md)
    }
  }

  function numberOrNull(n: any): number | null {
    const v = Number(n)
    return Number.isFinite(v) ? v : null
  }
  function safeJson(s: string) {
    try {
      return JSON.parse(s)
    } catch {
      return { texto: s }
    }
  }

  const calcEnabled = ruc.trim().length > 0 && !!pdfFile

  return (
    <>
      <Header />
      <main className="container py-8 grid gap-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-navy-800 text-white text-xs px-2.5 py-1">
            Demo de análisis
          </span>
          <div className="text-sm text-slate-600">
            Solo Finanzas (RUC y PDF) es obligatorio. Redes y Cartas son opcionales.
          </div>
          <div className="ml-auto">
            <Link to="/" className="inline-flex items-center rounded-md border px-3 py-2 text-sm">
              Ir a inicio
            </Link>
          </div>
        </div>

        <Tabs
          active={activeTab}
          onChange={(k) => {
            setActiveTab(k)
          }}
          tabs={[
            { key: "finanzas", label: "Finanzas", Icon: LineChart },
            { key: "redes", label: "Redes", Icon: Share2 },
            { key: "cartas", label: "Cartas", Icon: Mail },
            { key: "resultado", label: "Resultado", Icon: CheckCircle2 },
          ]}
        />

        {/* Panels */}
        <div className="rounded-md border">
          {/* Finanzas */}
          <Panel id="panel-finanzas" labelledBy="tab-finanzas" hidden={activeTab !== "finanzas"}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm">RUC de la empresa</label>
                <input
                  className="h-10 rounded-md border px-3"
                  placeholder="Ej. 20123456789"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">PDF del Estado de Situación Financiera</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="h-10 rounded-md border px-3 py-1.5"
                  onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
                />
                <SseStatus status={sseStatus} jobId={jobId} />
              </div>
            </div>

            <div className="mt-6">
              <FinancialForm values={financials} />
            </div>

            {financialReportMd && (
              <div className="rounded-md border mt-6">
                <div className="border-b px-4 py-3 font-semibold">Informe financiero</div>
                <div className="p-4 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{financialReportMd}</ReactMarkdown>
                </div>
              </div>
            )}

            {!pdfFile && (
              <div className="rounded-md border p-4 text-sm mt-6">Sube el PDF para iniciar el análisis financiero.</div>
            )}
          </Panel>

          {/* Redes */}
          <Panel id="panel-redes" labelledBy="tab-redes" hidden={activeTab !== "redes"}>
            <SocialSection handles={socialHandles} onHandlesChange={setSocialHandles} onMetricsChange={setSocial} />
          </Panel>

          {/* Cartas */}
          <Panel id="panel-cartas" labelledBy="tab-cartas" hidden={activeTab !== "cartas"}>
            <LettersSection files={lettersFiles} onFilesChange={setLettersFiles} onMetricsChange={setLetters} />
          </Panel>

          {/* Resultado */}
          <Panel id="panel-resultado" labelledBy="tab-resultado" hidden={activeTab !== "resultado"}>
            <div className="border-b px-4 py-3 font-semibold flex items-center justify-between">
              <span>Resumen</span>
              <button
                className={`inline-flex items-center rounded-md px-4 py-2 text-white ${calcEnabled ? "bg-navy-800 hover:bg-navy-700" : "bg-slate-300 cursor-not-allowed"}`}
                disabled={!calcEnabled}
                onClick={() => setShowResult(true)}
              >
                Calcular score
              </button>
            </div>

            <div className="p-4 grid gap-6">
              {!calcEnabled && (
                <div className="rounded-md border p-4 text-sm">
                  Ingresa el RUC y sube el PDF en la pestaña Finanzas para habilitar el cálculo del score.
                </div>
              )}

              {showResult && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border">
                    <div className="border-b px-4 py-3">
                      <div className="text-base font-semibold">Score combinado</div>
                      <div className="text-sm text-slate-600">Estimado según los datos disponibles</div>
                    </div>
                    <div className="p-4 grid gap-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Score</div>
                        <div className="text-2xl font-semibold">{Math.round(score)}</div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-navy-700 to-navy-500 transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                        />
                      </div>
                      <div className="text-sm">
                        Riesgo:{" "}
                        <span className="font-medium">
                          {score >= 80
                            ? "Muy bajo"
                            : score >= 65
                              ? "Bajo"
                              : score >= 50
                                ? "Medio"
                                : score >= 35
                                  ? "Alto"
                                  : "Muy alto"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm pt-2">
                        <MiniStat label="Finanzas" value={Math.round(financialScore ?? financials?.composite ?? 0)} />
                        <MiniStat label="Redes" value={Math.round(social?.composite ?? 0)} />
                        <MiniStat label="Cartas" value={Math.round(letters?.composite ?? 0)} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="border-b px-4 py-3">
                      <div className="text-base font-semibold">Monto estimado del préstamo</div>
                      <div className="text-sm text-slate-600">Basado en tu score y activos reportados</div>
                    </div>
                    <div className="p-4 grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Monto aprobado</div>
                        <div className="text-xl font-semibold">
                          {loan.amount.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Tasa referencial: {loan.rate.toFixed(2)}% • Plazo sugerido: {loan.term} meses
                      </div>
                      {loan.approved ? (
                        <div className="inline-flex items-center gap-2 text-green-600 text-sm">
                          Elegible según la política demo
                        </div>
                      ) : (
                        <div className="text-sm text-amber-700">No elegible con los parámetros actuales</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Tabs({
  active,
  onChange,
  tabs,
}: {
  active: TabKey
  onChange: (k: TabKey) => void
  tabs: Array<{ key: TabKey; label: string; Icon: LucideIcon }>
}) {
  return (
    <div className="rounded-md border bg-white">
      <nav
        role="tablist"
        aria-label="Flujo de análisis"
        className="flex flex-wrap items-center gap-2 px-2 py-2 md:px-3 border-b"
      >
        {tabs.map(({ key, label, Icon }) => {
          const selected = key === active
          return (
            <button
              key={key}
              id={`tab-${key}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${key}`}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${selected ? "bg-navy-800 text-white" : "hover:bg-slate-100"}`}
              onClick={() => onChange(key)}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function Panel({
  hidden,
  children,
  id,
  labelledBy,
}: {
  hidden?: boolean
  children: React.ReactNode
  id: string
  labelledBy: string
}) {
  return (
    <section
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      hidden={hidden}
      className="p-4 aria-hidden:hidden"
      aria-hidden={hidden}
    >
      {children}
    </section>
  )
}

function SseStatus({
  status,
  jobId,
}: { status: "idle" | "connecting" | "open" | "error" | "closed"; jobId: string | null }) {
  const map: Record<string, string> = {
    idle: "Esperando archivo...",
    connecting: "Conectando al análisis...",
    open: jobId ? `Suscrito (job: ${jobId})` : "Suscrito",
    error: "Error de conexión con el análisis",
    closed: "Suscripción cerrada",
  }
  const color = status === "open" ? "text-green-600" : status === "error" ? "text-red-600" : "text-slate-500"
  return <div className={`text-xs ${color}`}>{map[status]}</div>
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{isFinite(value) ? value : 0}</div>
    </div>
  )
}

function mapSseToFinancialValues(payload: any): FinancialFormValues {
  const num = (x: any) => {
    const v = Number(x)
    return Number.isFinite(v) ? v : undefined
  }
  return {
    activoCorriente: {
      efectivo: num(payload?.activoCorriente?.efectivo ?? payload?.efectivo),
      cuentasPorCobrar: num(payload?.activoCorriente?.cuentasPorCobrar ?? payload?.cuentasPorCobrar),
      cxcAccionistas: num(payload?.activoCorriente?.cxcAccionistas ?? payload?.cxcAccionistas),
      otrosActivosCorrientes: num(payload?.activoCorriente?.otrosActivosCorrientes ?? payload?.otrosActivosCorrientes),
      total: num(payload?.activoCorriente?.total ?? payload?.totalActivoCorriente),
    },
    activoNoCorriente: {
      inventarios: num(payload?.activoNoCorriente?.inventarios ?? payload?.inventarios),
      activosFijosNetos: num(payload?.activoNoCorriente?.activosFijosNetos ?? payload?.activosFijosNetos),
      intangibles: num(payload?.activoNoCorriente?.intangibles ?? payload?.intangibles),
      otrosNoCorrientes: num(payload?.activoNoCorriente?.otrosNoCorrientes ?? payload?.otrosNoCorrientes),
      total: num(payload?.activoNoCorriente?.total ?? payload?.totalActivoNoCorriente),
    },
    pasivoCorriente: {
      cuentasPorPagar: num(payload?.pasivoCorriente?.cuentasPorPagar ?? payload?.cuentasPorPagar),
      prestamosCP: num(payload?.pasivoCorriente?.prestamosCP ?? payload?.prestamosCP),
      otrosPasivosCorrientes: num(payload?.pasivoCorriente?.otrosPasivosCorrientes ?? payload?.otrosPasivosCorrientes),
      total: num(payload?.pasivoCorriente?.total ?? payload?.totalPasivoCorriente),
    },
    pasivoNoCorriente: {
      deudaLP: num(payload?.pasivoNoCorriente?.deudaLP ?? payload?.deudaLP),
      otrosPasivosNoCorrientes: num(
        payload?.pasivoNoCorriente?.otrosPasivosNoCorrientes ?? payload?.otrosPasivosNoCorrientes,
      ),
      total: num(payload?.pasivoNoCorriente?.total ?? payload?.totalPasivoNoCorriente),
    },
    patrimonio: {
      capital: num(payload?.patrimonio?.capital ?? payload?.capital),
      reservas: num(payload?.patrimonio?.reservas ?? payload?.reservas),
      resultadosAcumulados: num(payload?.patrimonio?.resultadosAcumulados ?? payload?.resultadosAcumulados),
      total: num(payload?.patrimonio?.total ?? payload?.totalPatrimonio),
    },
    totals: {
      totalActivo: num(payload?.totals?.totalActivo ?? payload?.totalActivo),
      totalPasivoPatrimonio: num(
        payload?.totals?.totalPasivoPatrimonio ?? payload?.totalPasivoPatrimonio ?? payload?.totalPasivoYPatrimonio,
      ),
    },
    ratios: {
      liquidezCorriente: num(payload?.ratios?.liquidezCorriente ?? payload?.liquidezCorriente),
      endeudamiento: num(payload?.ratios?.endeudamiento ?? payload?.endeudamiento),
      margen: num(payload?.ratios?.margen ?? payload?.margen),
    },
    composite: num(payload?.composite ?? payload?.scoreFinanzas ?? payload?.score),
  }
}
