import type React from "react"
export default function FAQ() {
  return (
    <section id="faq" className="py-16">
      <div className="container max-w-3xl">
        <div className="mb-8 text-center space-y-3">
          <span className="inline-block rounded-full border px-3 py-1 text-sm">FAQ</span>
          <h2 className="text-3xl font-semibold tracking-tight">Preguntas frecuentes</h2>
        </div>
        <div className="grid gap-4">
          <Item q="¿Qué datos son obligatorios para calcular el score?">
            Solo Finanzas: RUC y PDF del Estado de Situación Financiera. Redes y Cartas son opcionales y mejoran la
            precisión.
          </Item>
          <Item q="¿Cómo protegen mis datos?">
            Implementamos cifrado en tránsito y en reposo, controles de acceso y minimización de datos.
          </Item>
          <Item q="¿El análisis es en tiempo real?">
            Sí, usamos Server-Sent Events (SSE). Verás las cifras y el informe en cuanto el backend los emita.
          </Item>
          <Item q="¿Puedo ajustar los pesos del modelo?">
            En la versión final puedes parametrizar por industria y políticas de riesgo.
          </Item>
          <Item q="¿Puedo exportar informes?">
            Próximamente añadiremos exportación a PDF/CSV del informe y dashboard.
          </Item>
        </div>
      </div>
    </section>
  )
}

function Item({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="rounded-md border p-4">
      <summary className="cursor-pointer font-medium">{q}</summary>
      <div className="mt-2 text-sm text-slate-600">{children}</div>
    </details>
  )
}
