import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";

interface FormData {
  nombre: string;
  sector: string;
  ventasMensuales: number; // USD
  margen: number; // 0-100
  flujoCaja: number; // USD
  antiguedad: number; // años
  promedioResenas: number; // 1-5
  referenciasPositivas: number; // 0-10
  cumplimientoPagos: number; // 0-100
  redSocialUrl: string;
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

  const [data, setData] = useState<FormData>({
    nombre: "",
    sector: "",
    ventasMensuales: 0,
    margen: 20,
    flujoCaja: 0,
    antiguedad: 0,
    promedioResenas: 3.5,
    referenciasPositivas: 0,
    cumplimientoPagos: 90,
    redSocialUrl: "",
    notas: "",
  });

  const result = useMemo(() => computeScore(data, socialSignal), [data, socialSignal]);

  const handleFile = (file?: File) => {
    if (!file) return;
    setUploadedName(file.name);
    toast({ title: "Archivo cargado", description: `Se adjuntó ${file.name}` });
  };

  const handleCrawl = async () => {
    if (!data.redSocialUrl) {
      toast({ title: "URL requerida", description: "Agrega al menos una red social" });
      return;
    }
    setIsEvaluating(true);
    try {
      const r = await FirecrawlService.crawlWebsite(data.redSocialUrl);
      if (!r.success) {
        toast({ title: "No se pudo analizar", description: r.error || "Falla al obtener datos", variant: "destructive" });
        setSocialSignal(0);
        return;
      }
      // Señal social simple: cuenta de palabras positivas menos negativas
      const text = JSON.stringify(r.data);
      const positives = (text.match(/excelente|bueno|recomendado|me\s+gusta|⭐|★/gi) || []).length;
      const negatives = (text.match(/malo|queja|reclamo|fraude|estafa|no\s+recomiendo/gi) || []).length;
      const activity = Math.min(text.length / 5000, 1); // actividad general
      const raw = (positives - negatives) / 20 + activity; // ~ -1 .. 2
      const normalized = clamp((raw + 1) / 3, 0, 1); // 0..1
      setSocialSignal(normalized);
      toast({ title: "Actividad digital analizada", description: `Señal social: ${(normalized * 100).toFixed(0)}%` });
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

  return (
    <main className="min-h-screen pb-16">
      <section className="container mx-auto grid gap-6 lg:grid-cols-2 pt-10">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Evaluación alternativa de riesgo PYME</CardTitle>
            <CardDescription>Ingresa datos básicos, adjunta estados y agrega una red social para extraer señales digitales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre o RUC</Label>
                <Input id="nombre" value={data.nombre} onChange={e => setData({ ...data, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input id="sector" value={data.sector} onChange={e => setData({ ...data, sector: e.target.value })} />
              </div>
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
                <Label htmlFor="resenas">Promedio reseñas (1-5)</Label>
                <Input id="resenas" type="number" min={1} max={5} step={0.1} value={data.promedioResenas} onChange={e => setData({ ...data, promedioResenas: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refs">Referencias positivas (0-10)</Label>
                <Input id="refs" type="number" min={0} max={10} value={data.referenciasPositivas} onChange={e => setData({ ...data, referenciasPositivas: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagos">Cumplimiento de pagos (%)</Label>
                <Input id="pagos" type="number" min={0} max={100} value={data.cumplimientoPagos} onChange={e => setData({ ...data, cumplimientoPagos: Number(e.target.value) })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="social">Red social (empresa)</Label>
                <Input id="social" placeholder="https://facebook.com/empresa..." value={data.redSocialUrl} onChange={e => setData({ ...data, redSocialUrl: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adjuntar estados financieros (SCVS)</Label>
                <Input type="file" accept=".pdf,.csv,.xls,.xlsx" onChange={e => handleFile(e.target.files?.[0])} />
                {uploadedName && <p className="text-sm text-muted-foreground">Adjunto: {uploadedName}</p>}
              </div>
              <div className="space-y-2">
                <Label>Firecrawl API Key (temporal)</Label>
                <div className="flex gap-2">
                  <Input placeholder="fc_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                  <Button variant="secondary" onClick={saveKey}>Guardar</Button>
                </div>
                <p className="text-xs text-muted-foreground">Para producción, recomendamos integrar Supabase y guardar la clave como secreto.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="hero" onClick={handleCrawl} disabled={isEvaluating}>{isEvaluating ? 'Analizando…' : 'Analizar actividad digital'}</Button>
              <Button variant="default" onClick={() => setSocialSignal(0)}>Omitir señal digital</Button>
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
                  <p className="text-2xl font-semibold">${'{'}result.creditoRecomendado.toLocaleString(){'}'}</p>
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
