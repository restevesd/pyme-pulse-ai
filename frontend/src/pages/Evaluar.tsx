import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { marked } from "marked"; // Import marked
import { Loader2 } from "lucide-react";

// --- TYPE DEFINITIONS ---

interface FormData {
  nombre: string;
  ruc: string;
  // cumplimientoPagos: number; // 0-100
  xUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  redSocialUrl: string; // otra (opcional)
  notas: string;
}

interface ActivoCorrienteData {
  efectivo_y_equivalentes: number;
  cuentas_por_cobrar: number;
  cuentas_por_cobrar_accionistas: number;
  otros_activos_corrientes: number;
  total_activo_corriente: number;
}

interface ActivoNoCorrienteData {
  inventarios: number;
  activos_fijos: number;
  activos_intangibles: number;
  otros_activos_no_corrientes: number;
  total_activo_no_corriente: number;
}

interface PasivoCorrienteData {
  cuentas_por_pagar: number;
  anticipos_de_clientes: number;
  otros_pasivos_corrientes: number;
  total_pasivo_corriente: number;
}

interface PasivoNoCorrienteData {
  deuda_largo_plazo: number;
  otros_pasivos_no_corrientes: number;
  total_pasivo_no_corriente: number;
}

interface PatrimonioNetoData {
  capital_suscrito: number;
  reservas: number;
  resultados_acumulados: number;
  ganancia_perdida_ejercicio: number;
  total_patrimonio_neto: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function computeScore(socialSignal: number) {
  const socialScore = clamp(socialSignal, 0, 1);

  // Score now only depends on socialSignal
  const score = socialScore; // Assuming socialSignal is already a score between 0 and 1

  const score10 = parseFloat((score * 10).toFixed(1));
  let riesgo: 'bajo' | 'medio' | 'alto' = 'medio';
  if (score10 >= 7) riesgo = 'bajo';
  else if (score10 < 5) riesgo = 'alto';

  return { score10, riesgo };
}

export default function Evaluar() {
  const { toast } = useToast();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [apiKey, setApiKey] = useState<string>(FirecrawlService.getApiKey() || "");
  const [uploadedName, setUploadedName] = useState<string>("");
  const [socialSignal, setSocialSignal] = useState(0);
  const [analyzeDigitalActivity, setAnalyzeDigitalActivity] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<FormData>({
    nombre: "",
    ruc: "",
    xUrl: "",
    linkedinUrl: "",
    facebookUrl: "",
    redSocialUrl: "",
    notas: "",
  });

  const [activoCorriente, setActivoCorriente] = useState<ActivoCorrienteData>({
    efectivo_y_equivalentes: 0,
    cuentas_por_cobrar: 0,
    cuentas_por_cobrar_accionistas: 0,
    otros_activos_corrientes: 0,
    total_activo_corriente: 0,
  });

  const [activoNoCorriente, setActivoNoCorriente] = useState<ActivoNoCorrienteData>({
    inventarios: 0,
    activos_fijos: 0,
    activos_intangibles: 0,
    otros_activos_no_corrientes: 0,
    total_activo_no_corriente: 0,
  });

  const [pasivoCorriente, setPasivoCorriente] = useState<PasivoCorrienteData>({
    cuentas_por_pagar: 0,
    anticipos_de_clientes: 0,
    otros_pasivos_corrientes: 0,
    total_pasivo_corriente: 0,
  });

  const [pasivoNoCorriente, setPasivoNoCorriente] = useState<PasivoNoCorrienteData>({
    deuda_largo_plazo: 0,
    otros_pasivos_no_corrientes: 0,
    total_pasivo_no_corriente: 0,
  });

  const [patrimonioNeto, setPatrimonioNeto] = useState<PatrimonioNetoData>({
    capital_suscrito: 0,
    reservas: 0,
    resultados_acumulados: 0,
    ganancia_perdida_ejercicio: 0,
    total_patrimonio_neto: 0,
  });

  // Calculated totals
  const [totalActivo, setTotalActivo] = useState(0);
  const [totalPasivo, setTotalPasivo] = useState(0);
  const [totalPasivoPatrimonio, setTotalPasivoPatrimonio] = useState(0);

  const handleActivoCorrienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'total_activo_corriente') return;
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    setActivoCorriente(prev => {
      const newState = { ...prev, [id]: numericValue };
      const { efectivo_y_equivalentes, cuentas_por_cobrar, cuentas_por_cobrar_accionistas, otros_activos_corrientes } = newState;
      newState.total_activo_corriente = efectivo_y_equivalentes + cuentas_por_cobrar + cuentas_por_cobrar_accionistas + otros_activos_corrientes;
      return newState;
    });
  };

  const handleActivoNoCorrienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'total_activo_no_corriente') return;
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    setActivoNoCorriente(prev => {
      const newState = { ...prev, [id]: numericValue };
      const { inventarios, activos_fijos, activos_intangibles, otros_activos_no_corrientes } = newState;
      newState.total_activo_no_corriente = inventarios + activos_fijos + activos_intangibles + otros_activos_no_corrientes;
      return newState;
    });
  };

  const handlePasivoCorrienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'total_pasivo_corriente') return;
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    setPasivoCorriente(prev => {
      const newState = { ...prev, [id]: numericValue };
      const { cuentas_por_pagar, anticipos_de_clientes, otros_pasivos_corrientes } = newState;
      newState.total_pasivo_corriente = cuentas_por_pagar + anticipos_de_clientes + otros_pasivos_corrientes;
      return newState;
    });
  };

  const handlePasivoNoCorrienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'total_pasivo_no_corriente') return;
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    setPasivoNoCorriente(prev => {
      const newState = { ...prev, [id]: numericValue };
      const { deuda_largo_plazo, otros_pasivos_no_corrientes } = newState;
      newState.total_pasivo_no_corriente = deuda_largo_plazo + otros_pasivos_no_corrientes;
      return newState;
    });
  };

  const handlePatrimonioNetoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'total_patrimonio_neto') return;
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
    setPatrimonioNeto(prev => {
      const newState = { ...prev, [id]: numericValue };
      const { capital_suscrito, reservas, resultados_acumulados, ganancia_perdida_ejercicio } = newState;
      newState.total_patrimonio_neto = capital_suscrito + reservas + resultados_acumulados + ganancia_perdida_ejercicio;
      return newState;
    });
  };

  useEffect(() => {
    setTotalActivo(activoCorriente.total_activo_corriente + activoNoCorriente.total_activo_no_corriente);
  }, [activoCorriente.total_activo_corriente, activoNoCorriente.total_activo_no_corriente]);

  useEffect(() => {
    setTotalPasivo(pasivoCorriente.total_pasivo_corriente + pasivoNoCorriente.total_pasivo_no_corriente);
  }, [pasivoCorriente.total_pasivo_corriente, pasivoNoCorriente.total_pasivo_no_corriente]);

  useEffect(() => {
    setTotalPasivoPatrimonio(totalPasivo + patrimonioNeto.total_patrimonio_neto);
  }, [totalPasivo, patrimonioNeto.total_patrimonio_neto]);

  const result = useMemo(() => computeScore(socialSignal), [socialSignal]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [financialReportMarkdown, setFinancialReportMarkdown] = useState<string>("");
  const [socialScoreResult, setSocialScoreResult] = useState<any>(null);
  const [financialScore, setFinancialScore] = useState<number | null>(null);
    const [financialScoringResult, setFinancialScoringResult] = useState<any>(null);
  const [finalCreditScore, setFinalCreditScore] = useState<number>(0);
  const [finalCreditBand, setFinalCreditBand] = useState<string | null>(null);
  const [finalCreditDecision, setFinalCreditDecision] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploadedName(file.name);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Formato de archivo no válido", description: "Solo se aceptan archivos PDF.", variant: "destructive" });
      setUploadedName("");
      setUploadedFile(null);
      return;
    }
    setUploadedFile(file);
    toast({ title: "PDF cargado", description: "Haz clic en 'Analizar información financiera' para procesar.", variant: "default" });
  };

  const analyzeFinancialInfo = async () => {
    if (!uploadedFile) {
      toast({ title: "No hay archivo", description: "Por favor, sube un archivo PDF primero.", variant: "destructive" });
      return;
    }

    setIsEvaluating(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("http://socialcredit.masappec.com/api/analyze-pdf/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al analizar el PDF.");
      }

      const result = await response.json();
      console.log("PDF Analysis Result:", result);

      if (result.datos_json) {
        const {
            empresa,
            RUC,
            fecha,
            moneda,
            activo_corriente,
            activo_no_corriente,
            total_activo,
            pasivo_corriente,
            pasivo_no_corriente,
            total_pasivo,
            patrimonio_neto,
            total_pasivo_patrimonio,
        } = result.datos_json;

        // Update data state
        setData(prev => ({
            ...prev,
            nombre: empresa || "",
            ruc: RUC || "",
        }));

        // Update activoCorriente state
        setActivoCorriente(prev => ({
            ...prev,
            efectivo_y_equivalentes: activo_corriente?.efectivo_y_equivalentes || 0,
            cuentas_por_cobrar: activo_corriente?.cuentas_por_cobrar || 0,
            cuentas_por_cobrar_accionistas: activo_corriente?.cuentas_por_cobrar_accionistas || 0,
            otros_activos_corrientes: activo_corriente?.otros_activos_corrientes || 0,
            total_activo_corriente: activo_corriente?.total_activo_corriente || 0,
        }));

        // Update activoNoCorriente state
        setActivoNoCorriente(prev => ({
            ...prev,
            inventarios: activo_no_corriente?.inventarios || 0,
            activos_fijos: activo_no_corriente?.activos_fijos || 0,
            activos_intangibles: activo_no_corriente?.activos_intangibles || 0,
            otros_activos_no_corrientes: activo_no_corriente?.otros_activos_no_corrientes || 0,
            total_activo_no_corriente: activo_no_corriente?.total_activo_no_corriente || 0,
        }));

        // Update pasivoCorriente state
        setPasivoCorriente(prev => ({
            ...prev,
            cuentas_por_pagar: pasivo_corriente?.cuentas_por_pagar || 0,
            anticipos_de_clientes: pasivo_corriente?.anticipos_de_clientes || 0,
            otros_pasivos_corrientes: pasivo_corriente?.otros_pasivos_corrientes || 0,
            total_pasivo_corriente: pasivo_corriente?.total_pasivo_corriente || 0,
        }));

        // Update pasivoNoCorriente state
        setPasivoNoCorriente(prev => ({
            ...prev,
            deuda_largo_plazo: pasivo_no_corriente?.deuda_largo_plazo || 0,
            otros_pasivos_no_corrientes: pasivo_no_corriente?.otros_pasivos_no_corrientes || 0,
            total_pasivo_no_corriente: pasivo_no_corriente?.total_pasivo_no_corriente || 0,
        }));

        // Update patrimonioNeto state
        setPatrimonioNeto(prev => ({
            ...prev,
            capital_suscrito: patrimonio_neto?.capital_suscrito || 0,
            reservas: patrimonio_neto?.reservas || 0,
            resultados_acumulados: patrimonio_neto?.resultados_acumulados || 0,
            ganancia_perdida_ejercicio: patrimonio_neto?.ganancia_perdida_ejercicio || 0,
            total_patrimonio_neto: patrimonio_neto?.total_patrimonio_neto || 0,
        }));

        // Update calculated totals
        setTotalActivo(total_activo || 0);
        setTotalPasivo(total_pasivo || 0);
        setTotalPasivoPatrimonio(total_pasivo_patrimonio || 0);

        setFinancialReportMarkdown(result.markdown_report || ""); // Store the markdown report

        if (result.scoring) {
          setFinancialScoringResult(result.scoring);
          if (result.scoring.conclusion_final) {
            setFinancialScore(result.scoring.conclusion_final.puntuacion_total);
          }
        }

        toast({ title: "Datos financieros cargados", description: "Los campos del balance han sido actualizados.", variant: "default" });
      }

    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al analizar el PDF", description: e.message || "Hubo un problema al procesar el archivo.", variant: "destructive" });
      setUploadedName("");
      setFinancialReportMarkdown(""); // Clear markdown on error
      setFinancialScore(null);
      setFinancialScoringResult(null);
    } finally {
      setIsEvaluating(false);
    }
  };

  const saveKey = async () => {
    // Logic remains the same
  };

  const analyzeScoring = async () => {
    setIsEvaluating(true);
    try {
      if (!data.nombre || !data.ruc) {
        toast({ title: "Información financiera incompleta", description: "Por favor, sube y analiza el estado financiero primero.", variant: "destructive" });
        setIsEvaluating(false);
        return;
      }

      if (analyzeDigitalActivity) {
        const hasSocialUrl = data.xUrl || data.linkedinUrl || data.facebookUrl || data.redSocialUrl;
        if (!hasSocialUrl) {
          toast({ title: "URLs de Redes Sociales requeridas", description: "Por favor, ingresa al menos una URL de X, LinkedIn o Facebook para analizar la actividad digital.", variant: "destructive" });
          setIsEvaluating(false);
          return;
        }
        // Call backend social score API
        try {
          const socialResponse = await fetch(`http://socialcredit.masappec.com/api/social-score/v2/${data.nombre || "masapp"}`); // Use company name or default
          if (!socialResponse.ok) {
            const errorData = await socialResponse.json();
            throw new Error(errorData.detail || "Error al obtener el score social.");
          }
          const socialData = await socialResponse.json();
          setSocialScoreResult(socialData);
          setSocialSignal(socialData.final_score_1_10 / 10); // Normalize to 0-1
          toast({ title: "Actividad digital analizada", description: `Señal: ${Math.round(socialData.final_score_1_10 * 10)}%` });
        } catch (socialError: any) {
          console.error("Error fetching social score:", socialError);
          toast({ title: "Error", description: socialError.message || "No se pudo completar el análisis de redes sociales.", variant: "destructive" });
          setSocialSignal(0);
          setSocialScoreResult(null);
          setIsEvaluating(false);
          return;
        }
      }
      const currentResult = computeScore(socialSignal);
      toast({ title: "Scoring Analizado", description: `Puntaje: ${currentResult.score10}/10, Riesgo: ${currentResult.riesgo.toUpperCase()}` });
    } catch (error) {
      console.error("Error analyzing scoring:", error);
      toast({ title: "Error al analizar scoring", description: "Hubo un problema al calcular el scoring.", variant: "destructive" });
    } finally {
      setIsEvaluating(false);
    }
  };

  const calculateCreditScore = async () => {
    setIsEvaluating(true);
    try {
      if (financialScore === null || !socialScoreResult) {
        toast({ title: "Información incompleta", description: "Por favor, analiza la información financiera y social primero.", variant: "destructive" });
        setIsEvaluating(false);
        return;
      }

      const xScore = socialScoreResult.per_platform?.find((p: any) => p.platform === 'x')?.score_1_10 || 0;
      const linkedinScore = socialScoreResult.per_platform?.find((p: any) => p.platform === 'linkedin')?.score_1_10 || 0;
      const facebookScore = socialScoreResult.per_platform?.find((p: any) => p.platform === 'facebook')?.score_1_10 || 0;

      const payload = {
        username: data.nombre || "mi_cliente", // Use data.nombre or a default
        financial_scoring: {
          conclusion_final: { puntuacion_total: financialScore },
          indicadores: [
            { puntuacion: xScore },
            { puntuacion: linkedinScore },
            { puntuacion: facebookScore }
          ]
        },
        w_fin: 0.6,
        w_soc: 0.4
      };

      console.log("Payload for credit-score/v1:", payload);

      const response = await fetch("http://socialcredit.masappec.com/api/credit-score/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al calcular el score de crédito.");
      }

      const result = await response.json();
      console.log("Credit Score Result:", result);
      setFinalCreditScore(result.final_score_1_10);
      setFinalCreditBand(result.band);
      setFinalCreditDecision(result.decision);
      toast({ title: "Scoring de Crédito Calculado", description: `Puntaje Final: ${result.final_score_1_10}/10`, variant: "default" });

    } catch (error: any) {
      console.error("Error calculating credit score:", error);
      toast({ title: "Error al calcular score de crédito", description: error.message || "Hubo un problema al calcular el score de crédito.", variant: "destructive" });
      setFinalCreditScore(0); // Reset on error
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleViewSocialReport = () => {
    if (!socialScoreResult) {
      toast({ title: "No hay datos de scoring social", description: "Por favor, analiza la actividad digital primero.", variant: "destructive" });
      return;
    }

    const newWindow = window.open();
    if (newWindow) {
      const {
        username,
        methodology,
        per_platform,
        final_score_1_10,
        band,
        errors
      } = socialScoreResult;

      // Helper to render platform details
      const renderPlatformDetails = (platform) => {
        if (!platform) return '<li>Datos no disponibles</li>';
        return `
          <li><strong>Puntaje:</strong> ${platform.score_1_10}/10</li>
          <li><strong>Peso Base:</strong> ${platform.base_weight * 100}%</li>
          <li><strong>Confianza:</strong> ${Math.round(platform.confidence * 100)}%</li>
          <li><strong>Participación Efectiva:</strong> ${Math.round(platform.effective_weight_share * 100)}%</li>
        `;
      };

      const x_details = per_platform.find(p => p.platform === 'x');
      const linkedin_details = per_platform.find(p => p.platform === 'linkedin');
      const facebook_details = per_platform.find(p => p.platform === 'facebook');

      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Informe de Scoring Social para ${username}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f9fafb; color: #111827; }
            .container { max-width: 800px; margin: 2rem auto; padding: 2rem; background-color: #ffffff; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            h1, h2, h3 { color: #111827; }
            h1 { font-size: 2.25rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem; }
            h2 { font-size: 1.5rem; margin-top: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
            h3 { font-size: 1.25rem; margin-top: 1.5rem; }
            p, li { font-size: 1rem; line-height: 1.6; color: #374151; }
            ul { list-style-type: none; padding-left: 0; }
            strong { color: #111827; }
            .card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; }
            .score-summary { text-align: center; padding: 2rem; background-color: #1f2937; color: #ffffff; border-radius: 0.5rem; margin-bottom: 2rem; }
            .score-summary .score { font-size: 4rem; font-weight: bold; }
            .score-summary .band { font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }
            .methodology { font-size: 0.875rem; color: #6b7280; }
            .methodology-box { background-color: #f3f4f6; border-left: 4px solid #9ca3af; padding: 1rem; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Informe de Scoring Social</h1>
            <p><strong>Empresa:</strong> ${username}</p>

            <div class="score-summary">
              <div class="score">${final_score_1_10} / 10</div>
              <div class="band">${band}</div>
            </div>

            <h2>Resultados por Plataforma</h2>
            
            <div class="card">
              <h3>X (Twitter)</h3>
              <ul>${renderPlatformDetails(x_details)}</ul>
            </div>

            <div class="card">
              <h3>LinkedIn</h3>
              <ul>${renderPlatformDetails(linkedin_details)}</ul>
            </div>

            <div class="card">
              <h3>Facebook</h3>
              <ul>${renderPlatformDetails(facebook_details)}</ul>
            </div>

            ${errors && errors.length > 0 ? `<h2>Errores Detectados</h2><div class="card"><p>${errors.join('<br>')}</p></div>` : ''}


            <h2>Metodología de Cálculo</h2>
            <div class="methodology-box">
              <p class="methodology">
                El puntaje final es una media ponderada de los puntajes individuales de cada plataforma. La "confianza" en el puntaje de cada plataforma ajusta su peso en el cálculo final.
              </p>
              <h3 class="methodology">X (Twitter)</h3>
              <p class="methodology">
                Se analiza la actividad (likes, retweets, etc., con decaimiento en el tiempo) y el sentimiento (positivo, negativo, neutral) de las publicaciones para generar un puntaje.
              </p>
              <h3 class="methodology">LinkedIn y Facebook</h3>
              <p class="methodology">
                Se calcula una puntuación de "relevancia" basada en el número de seguidores/likes, empleados (en LinkedIn), y qué tan completo está el perfil de la empresa (información de contacto, sitio web, etc.).
              </p>
            </div>

          </div>
        </body>
        </html>
      `;
      newWindow.document.write(reportHTML);
      newWindow.document.close();
    } else {
      toast({ title: "Error", description: "No se pudo abrir una nueva ventana. Por favor, permite pop-ups.", variant: "destructive" });
    }
  };

  const handleViewFinancialReport = () => {
    if (financialReportMarkdown) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Informe Financiero</title>
            <style>
              body { font-family: sans-serif; margin: 20px; line-height: 1.6; }
              h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; font-weight: bold; }
              h1 { font-size: 2em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.2em; }
              p { margin-bottom: 1em; }
              ul, ol { margin-bottom: 1em; padding-left: 20px; }
              li { margin-bottom: 0.5em; }
              strong { font-weight: bold; }
              em { font-style: italic; }
              pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
              code { font-family: monospace; background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
              blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; margin-left: 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Informe Financiero</h1>
            <div>${marked.parse(financialReportMarkdown)}</div>
          </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        toast({ title: "Error", description: "No se pudo abrir una nueva ventana. Por favor, permite pop-ups.", variant: "destructive" });
      }
    }
  };
  return (
    <main className="min-h-screen pb-16">
      <section className="container mx-auto grid gap-6 lg:grid-cols-2 pt-10">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Evaluación Alternativa de Riesgo PYME</CardTitle>
            <CardDescription>Ingresa datos, adjunta estados y analiza la presencia digital.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Documentos (SCVS)</h4>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <Button variant="premium" onClick={() => fileRef.current?.click()}>Subir Estado Financiero</Button>
                {uploadedName && <p className="text-sm text-muted-foreground">Adjunto: {uploadedName}</p>}
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="default" onClick={analyzeFinancialInfo} disabled={!uploadedFile || isEvaluating}>
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    "Analizar información financiera"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Datos de la Empresa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={data.nombre} onChange={e => setData({ ...data, nombre: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input id="ruc" value={data.ruc} onChange={e => setData({ ...data, ruc: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Activo Corriente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="efectivo_y_equivalentes">Monto en Efectivo y Equivalentes</Label>
                  <Input id="efectivo_y_equivalentes" type="number" value={activoCorriente.efectivo_y_equivalentes} onChange={handleActivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuentas_por_cobrar">Total de Cuentas por Cobrar</Label>
                  <Input id="cuentas_por_cobrar" type="number" value={activoCorriente.cuentas_por_cobrar} onChange={handleActivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuentas_por_cobrar_accionistas">Cuentas por Cobrar a Accionistas</Label>
                  <Input id="cuentas_por_cobrar_accionistas" type="number" value={activoCorriente.cuentas_por_cobrar_accionistas} onChange={handleActivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otros_activos_corrientes">Otros Activos Corrientes</Label>
                  <Input id="otros_activos_corrientes" type="number" value={activoCorriente.otros_activos_corrientes} onChange={handleActivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_activo_corriente">Total del Activo Corriente</Label>
                  <Input id="total_activo_corriente" type="number" value={activoCorriente.total_activo_corriente} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Activo No Corriente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inventarios">Inventarios (si aplica)</Label>
                  <Input id="inventarios" type="number" value={activoNoCorriente.inventarios} onChange={handleActivoNoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activos_fijos">Activos fijos netos</Label>
                  <Input id="activos_fijos" type="number" value={activoNoCorriente.activos_fijos} onChange={handleActivoNoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activos_intangibles">Activos intangibles</Label>
                  <Input id="activos_intangibles" type="number" value={activoNoCorriente.activos_intangibles} onChange={handleActivoNoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otros_activos_no_corrientes">Otros activos no corrientes</Label>
                  <Input id="otros_activos_no_corrientes" type="number" value={activoNoCorriente.otros_activos_no_corrientes} onChange={handleActivoNoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_activo_no_corriente">Total del activo no corriente</Label>
                  <Input id="total_activo_no_corriente" type="number" value={activoNoCorriente.total_activo_no_corriente} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Total Activo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_activo">Total del activo</Label>
                  <Input id="total_activo" type="number" value={totalActivo} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Pasivo Corriente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuentas_por_pagar">Cuentas por pagar comerciales</Label>
                  <Input id="cuentas_por_pagar" type="number" value={pasivoCorriente.cuentas_por_pagar} onChange={handlePasivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anticipos_de_clientes">Anticipos de clientes</Label>
                  <Input id="anticipos_de_clientes" type="number" value={pasivoCorriente.anticipos_de_clientes} onChange={handlePasivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otros_pasivos_corrientes">Otros pasivos corrientes</Label>
                  <Input id="otros_pasivos_corrientes" type="number" value={pasivoCorriente.otros_pasivos_corrientes} onChange={handlePasivoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_pasivo_corriente">Total del pasivo corriente</Label>
                  <Input id="total_pasivo_corriente" type="number" value={pasivoCorriente.total_pasivo_corriente} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Pasivo No Corriente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deuda_largo_plazo">Deudas a largo plazo</Label>
                  <Input id="deuda_largo_plazo" type="number" value={pasivoNoCorriente.deuda_largo_plazo} onChange={handlePasivoNoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otros_pasivos_no_corrientes">Otros pasivos no corrientes</Label>
                  <Input id="otros_pasivos_no_corrientes" type="number" value={pasivoNoCorriente.otros_pasivos_no_corrientes} onChange={handlePasivoNoCorrienteChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_pasivo_no_corriente">Total del pasivo no corriente</Label>
                  <Input id="total_pasivo_no_corriente" type="number" value={pasivoNoCorriente.total_pasivo_no_corriente} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Total Pasivo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_pasivo">Total del pasivo</Label>
                  <Input id="total_pasivo" type="number" value={totalPasivo} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Patrimonio Neto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capital_suscrito">Capital suscrito</Label>
                  <Input id="capital_suscrito" type="number" value={patrimonioNeto.capital_suscrito} onChange={handlePatrimonioNetoChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservas">Reservas</Label>
                  <Input id="reservas" type="number" value={patrimonioNeto.reservas} onChange={handlePatrimonioNetoChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resultados_acumulados">Resultados acumulados</Label>
                  <Input id="resultados_acumulados" type="number" value={patrimonioNeto.resultados_acumulados} onChange={handlePatrimonioNetoChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ganancia_perdida_ejercicio">Ganancia o pérdida del ejercicio actual</Label>
                  <Input id="ganancia_perdida_ejercicio" type="number" value={patrimonioNeto.ganancia_perdida_ejercicio} onChange={handlePatrimonioNetoChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_patrimonio_neto">Total del patrimonio neto</Label>
                  <Input id="total_patrimonio_neto" type="number" value={patrimonioNeto.total_patrimonio_neto} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Total Pasivo + Patrimonio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_pasivo_patrimonio">Total pasivo + patrimonio neto (debe coincidir con total activo)</Label>
                  <Input id="total_pasivo_patrimonio" type="number" value={totalPasivoPatrimonio} readOnly className="bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Redes Sociales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input id="x" placeholder="https://x.com/empresa..." value={data.xUrl} onChange={e => setData({ ...data, xUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="https://www.linkedin.com/company..." value={data.linkedinUrl} onChange={e => setData({ ...data, linkedinUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" placeholder="https://www.facebook.com/empresa..." value={data.facebookUrl} onChange={e => setData({ ...data, facebookUrl: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="analyzeDigitalActivity" checked={analyzeDigitalActivity} onCheckedChange={checked => setAnalyzeDigitalActivity(checked === true)} />
                <Label htmlFor="analyzeDigitalActivity">Analizar Actividad Digital</Label>
              </div>
              <div className="pt-2">
                <Button variant="default" onClick={analyzeScoring} disabled={isEvaluating}>
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    "Analizar Scoring social"
                  )}
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="card-elevated sticky top-10 h-fit">
          <CardHeader>
            <CardTitle>Resultado del Scoring</CardTitle>
            <CardDescription>Riesgo y crédito basado en los datos proporcionados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Puntaje</span>
                  <span className="text-sm font-medium">{finalCreditScore}/10</span>
                </div>
                <Progress value={result.score10 * 10} />
                <p className="mt-2 text-sm">Riesgo: <span className={finalCreditBand === 'Excelente' ? 'text-green-500' : finalCreditBand === 'Fuerte' ? 'text-green-500' : finalCreditBand === 'Moderado' ? 'text-yellow-500' : finalCreditBand === 'Débil' ? 'text-red-500' : finalCreditBand === 'Crítico' ? 'text-red-500' : ''}>{finalCreditDecision ? finalCreditDecision.toUpperCase() : ''}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Scoring Financiero</p>
                  <p className="text-2xl font-semibold">
                    {financialScore !== null ? `${financialScore}/10` : "esperando información"}
                  </p>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={handleViewFinancialReport} disabled={!financialScoringResult || isEvaluating}>
                      Ver Informe
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Scoring Social</p>
                  <p className="text-2xl font-semibold">
                    {socialScoreResult ? `${socialScoreResult.final_score_1_10}/10` : "esperando información"}
                  </p>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={handleViewSocialReport} disabled={!socialScoreResult || isEvaluating}>
                      Ver Informe
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center"> {/* Centered div for the button */}
                <Button variant="default" onClick={calculateCreditScore} disabled={isEvaluating}>
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculando Score de Crédito...
                    </>
                  ) : (
                    "Calcular Score de Crédito Final"
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-lg border flex flex-col items-center w-full mx-auto"> {/* Added w-full and mx-auto for centering */}
                <p className="text-sm text-muted-foreground">Score de Crédito Final</p>
                <p className="text-2xl font-semibold">
                  {finalCreditScore !== null ? `${finalCreditScore}/10` : "0/10"}
                </p>
              </div>

              

              

              
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
