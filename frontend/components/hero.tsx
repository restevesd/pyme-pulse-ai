import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero({ className = "" }: { className?: string }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-950/10 to-transparent dark:from-blue-950/20"
        aria-hidden
      />
      <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
            Nuevo
            <span className="text-muted-foreground">Análisis social + financiero</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Score crediticio para PYMEs impulsado por datos financieros y sociales
          </h1>
          <p className="text-lg text-muted-foreground">
            SocialCredit unifica estados financieros, señales de redes sociales y cartas de recomendación para evaluar
            el riesgo con mayor precisión y transparencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-blue-800 hover:bg-blue-700">
              <Link href="/analyze">Evaluar empresa</Link>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">Prueba gratuita • Sin tarjeta • Resultados en minutos</div>
        </div>
        <div className="relative">
          <img
            src="/placeholder.svg?height=520&width=720"
            alt="Vista previa del panel de SocialCredit"
            className="w-full rounded-xl border shadow-sm"
          />
          <div className="absolute -bottom-4 -right-4 hidden md:block">
            <img
              src="/placeholder.svg?height=160&width=220"
              alt="Widget de score combinado"
              className="rounded-lg border bg-background shadow"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
