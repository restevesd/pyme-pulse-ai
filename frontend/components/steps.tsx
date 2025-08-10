import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Link2, Sparkles } from "lucide-react"

export function Steps({ className = "" }: { className?: string }) {
  const items = [
    {
      icon: Upload,
      title: "Carga tus datos",
      desc: "Sube estados financieros y cartas de recomendación en minutos.",
      step: 1,
    },
    {
      icon: Link2,
      title: "Conecta redes",
      desc: "Autoriza el acceso de solo lectura a tus perfiles sociales.",
      step: 2,
    },
    {
      icon: Sparkles,
      title: "Obtén tu score",
      desc: "Generamos un score con explicaciones y factores clave.",
      step: 3,
    },
  ]

  return (
    <section id="como-funciona" className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-10 space-y-3 text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Cómo funciona
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">De datos a decisiones en 3 pasos</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <Card key={it.step}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-800 dark:text-blue-300" />
                    </div>
                    <div className="text-xs text-muted-foreground">Paso {it.step}</div>
                  </div>
                  <h3 className="font-semibold mb-2">{it.title}</h3>
                  <p className="text-sm text-muted-foreground">{it.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
