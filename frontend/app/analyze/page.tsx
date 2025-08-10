"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Gauge, Info, FileText, Sparkles, Home } from "lucide-react"
import { FinancialForm, type FinancialFormValues } from "@/components/analysis/financial-form"
import { SocialSection, type SocialMetrics } from "@/components/analysis/social-section"
import { LettersSection, type LettersMetrics } from "@/components/analysis/letters-section"
import { computeScore, computeLoanAmount } from "@/lib/scoring"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getApiBase } from "@/lib/api"

type SsePayload = any

export default function AnalyzePage() {
  // Step states
  const [ruc, setRuc] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const [financials, setFinancials] = useState<FinancialFormValues | null>(null)
  const [financialReportMd, setFinancialReportMd] = useState<string>("")
  const [financialScore, setFinancialScore] = useState<number | null>(null)

  const [socialHandles, setSocialHandles] = useState<{ twitter?: string; facebook?: string }>({})
  const [social, setSocial] = useState<SocialMetrics | null>(null)

  const [lettersFiles, setLettersFiles] = useState<File[]>([])
  const [letters, setLetters] = useState<LettersMetrics | null>(null)

  // Job & SSE
  const [jobId, setJobId] = useState<string | null>(null)
  const [sseStatus, setSseStatus] = useState<"idle" | "connecting" | "open" | "error" | "closed">("idle")
  const esRef = useRef<EventSource | null>(null)

  // Results
  const [showResult, setShowResult] = useState(false)
  const weights = { financials: 0.6, social: 0.25, letters: 0.15 }

  const score = useMemo(() => {
    return computeScore({
      financials: financialScore ?? financials?.composite ?? null,
      social: social?.composite ?? null,
      letters: letters?.composite ?? null,
      weights,
    })
  }, [financialScore, financials, social, letters])

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
      const resp = await fetch(`${apiBase}/analyze-pdf-estado`, {
        method: "POST",
        body: fd,
      })
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
      try {
        const data = safeJson(event.data)
        const tipo = data?.tipo ?? "message"
        handleTypedEvent(tipo, data)
      } catch {
        // ignore
      }
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
    <main className="min-h-dvh">
      <div className="border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="container max-w-6xl mx-auto px-4 py-6 flex items-center gap-3">
          <Badge className="bg-blue-800 hover:bg-blue-800">
            <Gauge className="h-4 w-4 mr-1" />
            Demo de análisis
          </Badge>
          <div className="text-sm text-muted-foreground">
            Solo Finanzas (RUC y PDF) es obligatorio. Redes y Cartas son opcionales.
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Ir a inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 grid gap-8">
        <Tabs defaultValue="finanzas" className="w-full">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="finanzas" className="data-[state=active]:bg-blue-50">
              1. Finanzas
            </TabsTrigger>
            <TabsTrigger value="redes" className="data-[state=active]:bg-blue-50">
              2. Redes (opcional)
            </TabsTrigger>
            <TabsTrigger value="cartas" className="data-[state=active]:bg-blue-50">
              3. Cartas (opcional)
            </TabsTrigger>
            <TabsTrigger value="resultado" className="data-[state=active]:bg-blue-50">
              4. Resultado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finanzas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-800" />
                  Ingreso de RUC y Estados Financieros
                </CardTitle>
                <CardDescription>
                  Ingresa el RUC y sube el PDF del Estado de Situación Financiera. Los campos se llenarán
                  automáticamente a medida que el backend procese el documento (SSE).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ruc">RUC de la empresa</Label>
                    <Input
                      id="ruc"
                      placeholder="Ej. 20123456789"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pdf">PDF del Estado de Situación Financiera</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
                    />
                    <SseStatus status={sseStatus} jobId={jobId} />
                  </div>
                </div>

                <FinancialForm values={financials} />

                {financialReportMd && (
                  <Card className="border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Informe financiero</CardTitle>
                      <CardDescription>Generado por el análisis del PDF</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{financialReportMd}</ReactMarkdown>
                    </CardContent>
                  </Card>
                )}

                {!pdfFile && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Pendiente</AlertTitle>
                    <AlertDescription>Sube el PDF para iniciar el análisis financiero.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redes">
            <SocialSection handles={socialHandles} onHandlesChange={setSocialHandles} onMetricsChange={setSocial} />
          </TabsContent>

          <TabsContent value="cartas">
            <LettersSection files={lettersFiles} onFilesChange={setLettersFiles} onMetricsChange={setLetters} />
          </TabsContent>

          <TabsContent value="resultado">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-800" />
                    Resultado
                  </CardTitle>
                  <CardDescription>
                    Puedes calcular el score solo con Finanzas; Redes y Cartas suman precisión si las completas.
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-blue-800 hover:bg-blue-700"
                    disabled={!calcEnabled}
                    onClick={() => setShowResult(true)}
                  >
                    <Gauge className="h-4 w-4 mr-2" />
                    Calcular score
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                {!calcEnabled && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Falta información mínima</AlertTitle>
                    <AlertDescription>Ingresa el RUC y sube el PDF en la pestaña Finanzas.</AlertDescription>
                  </Alert>
                )}

                {showResult && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Score combinado</CardTitle>
                        <CardDescription>Resultado estimado según los datos disponibles</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Score</div>
                          <div className="text-2xl font-semibold" aria-live="polite" aria-atomic="true">
                            {Math.round(score)}
                          </div>
                        </div>
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                            role="progressbar"
                            aria-valuenow={Math.round(score)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Barra de score"
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Monto estimado del préstamo</CardTitle>
                        <CardDescription>Basado en tu score y activos reportados</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Monto aprobado</div>
                          <div className="text-xl font-semibold">
                            {loan.amount.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tasa referencial: {loan.rate.toFixed(2)}% • Plazo sugerido: {loan.term} meses
                        </div>
                        {loan.approved ? (
                          <div className="inline-flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            Elegible según la política demo
                          </div>
                        ) : (
                          <div className="text-sm text-amber-700">No elegible con los parámetros actuales</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function SseStatus({
  status,
  jobId,
}: { status: "idle" | "connecting" | "open" | "error" | "closed"; jobId: string | null }) {
  const map: Record<typeof status, string> = {
    idle: "Esperando archivo...",
    connecting: "Conectando al análisis...",
    open: jobId ? `Suscrito (job: ${jobId})` : "Suscrito",
    error: "Error de conexión con el análisis",
    closed: "Suscripción cerrada",
  }
  return (
    <div className="text-xs">
      <span
        className={status === "open" ? "text-green-600" : status === "error" ? "text-red-600" : "text-muted-foreground"}
      >
        {map[status]}
      </span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{isFinite(value) ? value : 0}</div>
    </div>
  )
}

// Mapea un payload flexible del backend a nuestro modelo FinancialFormValues
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
