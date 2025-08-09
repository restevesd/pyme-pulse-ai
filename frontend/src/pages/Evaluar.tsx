import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";
import * as XLSX from "xlsx";

interface FormData {
  nombre: string;
  ruc: string;
  sector: string;
  ventasMensuales: number; // USD
  margen: number; // 0-100
  flujoCaja: number; // USD
  antiguedad: number; // años
  promedioResenas: number; // 1-5
  referenciasPositivas: number; // 0-10
  cumplimientoPagos: number; // 0-100
  xUrl: string;
  linkedinUrl: string;
  redSocialUrl: string; // otra (opcional)
  notas: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function computeScore(data: FormData, socialSignal: number) {
  // Normalizaciones simples para demo
  const ventasScore = clamp(data.ventasMensuales / 10000, 0, 1); // 10k = 1.0
  const margenScore = clamp(data.margen / 40, 0, 1); // 40% = 1.0
  const flujoScore = clamp((data.flujoCaja + 2000) / 4000, 0, 1); // -2k..+2k
  const antiguedadScore = clamp(data.antiguedad / 5, 0, 1); // 5 años = 1
  const resenasScore = clamp(data.promedioResenas / 4.5, 0, 1); // 4.5 = 1
  const refsScore = clamp(data.referenciasPositivas / 8, 0, 1); // 8 = 1
  const pagosScore = clamp(data.cumplimientoPagos / 98, 0, 1); // 98% = 1
  const socialScore = clamp(socialSignal, 0, 1);

  // Ponderación equilibrada (suma = 1)
  const score = (
    ventasScore * 0.18 +
    margenScore * 0.12 +
    flujoScore * 0.16 +
    antiguedadScore * 0.08 +
    resenasScore * 0.14 +
    refsScore * 0.12 +
    pagosScore * 0.16 +
    socialScore * 0.04
  );

  const score100 = Math.round(score * 100);
  let riesgo: 'bajo' | 'medio' | 'alto' = 'medio';
  if (score100 >= 70) riesgo = 'bajo';
  else if (score100 < 50) riesgo = 'alto';

  // Crédito recomendado: factor sobre ventas mensuales y calidad
  const factor = 0.5 + score * 1.5; // 0.5x .. 2.0x
  const creditoRecomendado = Math.round(data.ventasMensuales * factor);

  return { score100, riesgo, creditoRecomendado };
}

export default function Evaluar() {
  const { toast } = useToast();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [apiKey, setApiKey] = useState<string>(FirecrawlService.getApiKey() || "");
  const [uploadedName, setUploadedName] = useState<string>("");
  const [socialSignal, setSocialSignal] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<FormData>({
    nombre: "",
    ruc: "",
    sector: "",
    ventasMensuales: 0,
    margen: 20,
    flujoCaja: 0,
    antiguedad: 0,
    promedioResenas: 3.5,
    referenciasPositivas: 0,
    cumplimientoPagos: 90,
    xUrl: "",
    linkedinUrl: "",
    redSocialUrl: "",
    notas: "",
  });

  const result = useMemo(() => computeScore(data, socialSignal), [data, socialSignal]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploadedName(file.name);
    try {
      const isPdf = /\.pdf$/i.test(file.name);
      if (isPdf) {
        toast({ title: "PDF cargado", description: "Para autocompletar usa Excel/CSV en esta demo", variant: "warning" as any });
        return;
      }
      await parseSpreadsheet(file);
      toast({ title: "Campos completados", description: "Información extraída del archivo" });
    } catch (e) {
      console.error(e);
      toast({ title: "No se pudo leer el archivo", description: "Verifica el formato (XLSX/CSV)", variant: "destructive" });
    }
  };

  const normalizeKey = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9_\s]/g, '')
    .replace(/\s+/g, '_');

  const toNumber = (v: any): number | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'number' && !isNaN(v)) return v;
    const n = Number(String(v).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? undefined : n;
  };

  const parseSpreadsheet = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });
    if (!rows.length) throw new Error('Sin datos');
    const row = rows[0];

    const getByKeys = (keys: string[]): number | undefined => {
      for (const [k, v] of Object.entries(row)) {
        const nk = normalizeKey(k);
        if (keys.some(key => nk.includes(key))) {
          const num = toNumber(v);
          if (num !== undefined) return num;
        }
      }
      return undefined;
    };

    const ventasMens = (() => {
      const mensual = getByKeys(['ventas_mensuales','ingresos_mensuales','facturacion_mensual']);
      if (mensual !== undefined) return mensual;
      const anual = getByKeys(['ventas','ingresos','facturacion','ventas_anuales','ingresos_anuales']);
      return anual !== undefined ? Math.round(anual / 12) : undefined;
    })();

    let margen = getByKeys(['margen','margen_bruto','margen_%','margen_porcentaje']);
    if (margen !== undefined) {
      if (margen <= 1) margen = Math.round(margen * 100);
      margen = clamp(margen, 0, 100);
    }

    const flujoCaja = getByKeys(['flujo_caja','flujo_de_caja','cash_flow','flujo_operacion','efectivo_operacion']);
    const antiguedad = getByKeys(['antiguedad','anos','años','edad_empresa']);
    let rating = getByKeys(['resenas','resenas_promedio','rating','promedio_resenas']);
    if (rating !== undefined) rating = clamp(rating, 1, 5);
    const refs = getByKeys(['referencias_positivas','referencias','ref_comerciales']);
    const cumplimiento = getByKeys(['cumplimiento_pagos','cumplimiento','on_time_payment']);

    setData(d => ({
      ...d,
      ventasMensuales: ventasMens ?? d.ventasMensuales,
      margen: margen ?? d.margen,
      flujoCaja: flujoCaja ?? d.flujoCaja,
      antiguedad: antiguedad ?? d.antiguedad,
      promedioResenas: rating ?? d.promedioResenas,
      referenciasPositivas: refs ?? d.referenciasPositivas,
      cumplimientoPagos: cumplimiento ?? d.cumplimientoPagos,
    }));
  };
  const handleCrawl = async () => {
    const urls = [data.xUrl, data.linkedinUrl, data.redSocialUrl].filter(u => !!u && u.trim().length > 0);
    if (!urls.length) {
      toast({ title: "URL requerida", description: "Agrega X o LinkedIn para analizar" });
      return;
    }
    setIsEvaluating(true);
    try {
      const settled = await Promise.allSettled(urls.map(u => FirecrawlService.crawlWebsite(u)));
      const successes = settled.filter((s): s is PromiseFulfilledResult<{ success: boolean; data?: any }> => s.status === 'fulfilled' && (s as any).value?.success);
      if (!successes.length) {
        toast({ title: "No se pudo analizar", description: "No se obtuvo contenido de las redes", variant: "destructive" });
        setSocialSignal(0);
        return;
      }
      const combinedText = successes.map(s => JSON.stringify(s.value.data)).join(" ");
      const positives = (combinedText.match(/excelente|bueno|recomendado|me\s+gusta|⭐|★/gi) || []).length;
      const negatives = (combinedText.match(/malo|queja|reclamo|fraude|estafa|no\s+recomiendo/gi) || []).length;
      const activity = Math.min(combinedText.length / 7000, 1);
      const raw = (positives - negatives) / 20 + activity; // ~ -1 .. 2
      const normalized = clamp((raw + 1) / 3, 0, 1); // 0..1
      setSocialSignal(normalized);
      toast({ title: "Actividad digital analizada", description: `Redes analizadas: ${successes.length}/${urls.length} • Señal: ${(normalized * 100).toFixed(0)}%` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo completar el análisis", variant: "destructive" });
    } finally {
      setIsEvaluating(false);
    }
  };

  const saveKey = async () => {
    if (!apiKey) {
      toast({ title: "API Key vacía", description: "Ingresa tu clave de Firecrawl" });
      return;
    }
    const ok = await FirecrawlService.testApiKey(apiKey);
    if (ok) {
      FirecrawlService.saveApiKey(apiKey);
      toast({ title: "Clave guardada", description: "La integración quedó lista" });
    } else {
      toast({ title: "Clave inválida", description: "Verifica tu Firecrawl API Key", variant: "destructive" });
    }
  };

  const analyzeScoring = () => {
    const r = result;
    toast({
      title: "Scoring actualizado",
      description: `Riesgo: ${r.riesgo.toUpperCase()} • Crédito: ${r.creditoRecomendado.toLocaleString('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`,
    });
  };

  return (
    <main className="min-h-screen pb-16">
      <section className="container mx-auto grid gap-6 lg:grid-cols-2 pt-10">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Evaluación alternativa de riesgo PYME</CardTitle>
            <CardDescription>Ingresa datos básicos, adjunta estados y agrega una red social para extraer señales digitales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Datos de la empresa */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Datos de la empresa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={data.nombre} onChange={e => setData({ ...data, nombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input id="sector" value={data.sector} onChange={e => setData({ ...data, sector: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input id="ruc" value={data.ruc} onChange={e => setData({ ...data, ruc: e.target.value })} />
              </div>
            </div>

            {/* Sección: Documentos (SCVS) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Documentos (SCVS)</h4>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <input ref={fileRef} type="file" accept=".pdf,.csv,.xls,.xlsx" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <Button variant="premium" onClick={() => fileRef.current?.click()}>Subir estados financieros</Button>
                {uploadedName && <p className="text-sm text-muted-foreground">Adjunto: {uploadedName}</p>}
              </div>
              <p className="text-xs text-muted-foreground">Descarga estados desde la SCVS y súbelos en Excel/CSV para autocompletar (PDF solo informativo en esta demo).</p>
            </div>

            {/* Sección: Datos básicos */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Datos básicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ventas">Ventas mensuales (USD)</Label>
                  <Input id="ventas" type="number" min={0} value={data.ventasMensuales} onChange={e => setData({ ...data, ventasMensuales: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margen">Margen bruto (%)</Label>
                  <Input id="margen" type="number" min={0} max={100} value={data.margen} onChange={e => setData({ ...data, margen: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flujo">Flujo de caja (USD)</Label>
                  <Input id="flujo" type="number" value={data.flujoCaja} onChange={e => setData({ ...data, flujoCaja: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ant">Antigüedad (años)</Label>
                  <Input id="ant" type="number" min={0} value={data.antiguedad} onChange={e => setData({ ...data, antiguedad: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pagos">Cumplimiento de pagos (%)</Label>
                  <Input id="pagos" type="number" min={0} max={100} value={data.cumplimientoPagos} onChange={e => setData({ ...data, cumplimientoPagos: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Redes sociales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input id="x" placeholder="https://x.com/empresa..." value={data.xUrl} onChange={e => setData({ ...data, xUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="https://www.linkedin.com/company/..." value={data.linkedinUrl} onChange={e => setData({ ...data, linkedinUrl: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="social">Facebook</Label>
                <Input id="social" placeholder="https://facebook.com/empresa..." value={data.redSocialUrl} onChange={e => setData({ ...data, redSocialUrl: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Firecrawl API Key (temporal)</Label>
              <div className="flex gap-2">
                <Input placeholder="fc_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                <Button variant="secondary" onClick={saveKey}>Guardar</Button>
              </div>
              <p className="text-xs text-muted-foreground">Para producción, recomendamos integrar Supabase y guardar la clave como secreto.</p>
            </div>

            {/* Reseñas y referencias debajo de Firecrawl */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Reseñas y referencias</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resenas">Promedio reseñas (1-5)</Label>
                  <Input id="resenas" type="number" min={1} max={5} step={0.1} value={data.promedioResenas} onChange={e => setData({ ...data, promedioResenas: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refs">Referencias positivas (0-10)</Label>
                  <Input id="refs" type="number" min={0} max={10} value={data.referenciasPositivas} onChange={e => setData({ ...data, referenciasPositivas: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            {/* Acciones de actividad digital */}
            <div className="flex gap-3">
              <Button variant="hero" onClick={handleCrawl} disabled={isEvaluating}>{isEvaluating ? 'Analizando…' : 'Analizar actividad digital'}</Button>
              <Button variant="default" onClick={() => setSocialSignal(0)}>Omitir Actividad Digital</Button>
            </div>
            {/* Analizar scoring debajo de los botones anteriores */}
            <div>
              <Button variant="success" onClick={analyzeScoring}>Analizar Scoring</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Resultado del scoring alternativo</CardTitle>
            <CardDescription>Riesgo y crédito recomendado con explicación de factores.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Puntaje</span>
                  <span className="text-sm font-medium">{result.score100}/100</span>
                </div>
                <Progress value={result.score100} />
                <p className="mt-2 text-sm">Riesgo: <span className={result.riesgo === 'bajo' ? 'text-success' : result.riesgo === 'medio' ? 'text-warning' : 'text-destructive'}>{result.riesgo.toUpperCase()}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Crédito recomendado</p>
                  <p className="text-2xl font-semibold">{
                    result.creditoRecomendado.toLocaleString('es-EC', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    })
                  }</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Señal digital</p>
                  <p className="text-2xl font-semibold">{Math.round(socialSignal * 100)}%</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Principales factores</h4>
                <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li>Ventas: {data.ventasMensuales.toLocaleString()}</li>
                  <li>Margen: {data.margen}%</li>
                  <li>Flujo de caja: {data.flujoCaja.toLocaleString()}</li>
                  <li>Antigüedad: {data.antiguedad} años</li>
                  <li>Reseñas: {data.promedioResenas.toFixed(1)}</li>
                  <li>Referencias: {data.referenciasPositivas}</li>
                  <li>Cumplimiento: {data.cumplimientoPagos}%</li>
                  <li>Actividad digital: {Math.round(socialSignal * 100)}%</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Simulador de escenarios</h4>
                <div>
                  <Label>Ventas (+/- 30%)</Label>
                  <Slider defaultValue={[0]} min={-30} max={30} step={5} onValueChange={([v]) => setData(d => ({ ...d, ventasMensuales: Math.max(0, Math.round(d.ventasMensuales * (1 + v/100))) }))} />
                </div>
                <div>
                  <Label>Reputación (+/- 1.0)</Label>
                  <Slider defaultValue={[0]} min={-10} max={10} step={1} onValueChange={([v]) => setData(d => ({ ...d, promedioResenas: clamp(Number((d.promedioResenas + v/10).toFixed(1)), 1, 5) }))} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
