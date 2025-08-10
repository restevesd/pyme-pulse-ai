import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Link2, ThumbsUp, TrendingUp, ShieldCheck } from "lucide-react"

export function Features({ className = "" }: { className?: string }) {
  return (
    <section id="caracteristicas" className="py-16 md:py-24">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-10 space-y-3 text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Características
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Tres pilares de evaluación para un score más justo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Integra señales financieras, sociales y de reputación para reducir sesgos y mejorar la predicción del
            riesgo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-800" />
                Estados financieros
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Subida segura de balances, EERR y flujos. Normalización automática y análisis de ratios clave.</p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-800" /> Cumplimiento y cifrado en tránsito/descanso.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-800" />
                Perfiles sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Señales de actividad, reputación y compromiso de la marca para complementar el análisis tradicional.
              </p>
              <p className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-800" /> Detección de tendencias y anomalías.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-blue-800" />
                Cartas de recomendación
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Procesamiento de texto para extraer sentimientos y entidades clave desde recomendaciones y referencias.
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-800" /> Verificación de autenticidad y consistencia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
