import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Testimonials({ className = "" }: { className?: string }) {
  const data = [
    {
      name: "María G.",
      role: "CEO, AgroPyme",
      text: "Reducimos tiempos de evaluación en un 60% y mejoramos la tasa de aprobación.",
      initials: "MG",
    },
    {
      name: "Luis P.",
      role: "CFO, TiendaLocal",
      text: "Las explicaciones del score nos ayudaron a negociar mejores condiciones.",
      initials: "LP",
    },
    {
      name: "Ana R.",
      role: "Crédito, MicroFin",
      text: "Menos sesgo y más datos. El mix social/financiero marcó la diferencia.",
      initials: "AR",
    },
  ]

  return (
    <section id="testimonios" className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center space-y-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Testimonios
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Lo que dicen nuestros clientes</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {data.map((t) => (
            <Card key={t.name}>
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar>
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{t.text}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
