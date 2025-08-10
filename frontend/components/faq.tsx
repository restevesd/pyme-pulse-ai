import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export function FAQ({ className = "" }: { className?: string }) {
  return (
    <section id="faq" className="py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center space-y-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            FAQ
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Preguntas frecuentes</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>¿Es SocialCredit una herramienta de scoring definitiva?</AccordionTrigger>
            <AccordionContent>
              Es un apoyo avanzado para la toma de decisiones. Provee un score, factores explicativos y señales, pero la
              decisión final depende de tus políticas de riesgo.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>¿Cómo protegen mis datos?</AccordionTrigger>
            <AccordionContent>
              Implementamos cifrado en tránsito y en reposo, controles de acceso y minimización de datos. Solo usamos
              permisos de lectura para redes sociales conectadas.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>¿Puedo ajustar los pesos de cada pilar?</AccordionTrigger>
            <AccordionContent>
              Sí. Puedes personalizar pesos por segmento/industria y comparar resultados históricos.
            </AccordionContent>
          </AccordionItem>

          {/* Nuevas preguntas */}
          <AccordionItem value="item-4">
            <AccordionTrigger>¿Qué datos son obligatorios para calcular el score?</AccordionTrigger>
            <AccordionContent>
              Solo el paso Finanzas: RUC y PDF del Estado de Situación Financiera. Redes y Cartas son opcionales y
              mejoran la precisión.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>¿Cómo simulan el proxy inverso en desarrollo?</AccordionTrigger>
            <AccordionContent>
              Usamos un proxy interno en <code className="font-mono">/api/proxy</code> que reenvía peticiones a tu
              backend. Así evitamos CORS y replicamos el comportamiento de Nginx en producción.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>¿El análisis es en tiempo real?</AccordionTrigger>
            <AccordionContent>
              Sí, nos suscribimos a eventos del servidor (SSE). Verás los campos financieros y el informe en cuanto el
              backend los vaya generando.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>¿Puedo exportar informes?</AccordionTrigger>
            <AccordionContent>
              Próximamente añadiremos exportación a PDF/CSV del informe financiero, métricas sociales y resultado del
              score.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
