import Header from "../components/Header"
import Hero from "../components/Hero"
import FAQ from "../components/FAQ"
import Footer from "../components/Footer"
import { type LucideIcon, FileText, Share2, Mail, Upload, Link2, Gauge } from "lucide-react"

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <section id="caracteristicas" className="py-16">
          <div className="container">
            <div className="mb-10 text-center space-y-3">
              <span className="inline-block rounded-full border px-3 py-1 text-sm">Características</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Tres pilares de evaluación para un score más justo
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Integra señales financieras, sociales y de reputación para reducir sesgos y mejorar la predicción del
                riesgo.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card
                title="Estados financieros"
                desc="Subida segura de balances, EERR y flujos. Normalización y ratios."
                Icon={FileText}
              />
              <Card
                title="Perfiles sociales"
                desc="Actividad, reputación y engagement complementan el análisis."
                Icon={Share2}
              />
              <Card
                title="Cartas de recomendación"
                desc="NLP para sentimiento, entidades y consistencia."
                Icon={Mail}
              />
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-16">
          <div className="container">
            <div className="mb-10 text-center space-y-3">
              <span className="inline-block rounded-full border px-3 py-1 text-sm">Cómo funciona</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">De datos a decisiones en 3 pasos</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Step n={1} title="Carga tus datos" desc="RUC y PDF del Estado Financiero." Icon={Upload} />
              <Step
                n={2}
                title="Conecta redes"
                desc="Autoriza acceso de solo lectura a redes (opcional)."
                Icon={Link2}
              />
              <Step n={3} title="Obtén tu score" desc="Resultados y escenarios en minutos." Icon={Gauge} />
            </div>
          </div>
        </section>

        <FAQ />
      </main>
      <Footer />
    </>
  )
}

function Card({ title, desc, Icon }: { title: string; desc: string; Icon: LucideIcon }) {
  return (
    <div className="rounded-md border p-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-md bg-gradient-to-br from-navy-900/90 to-navy-700/90 text-white flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold mb-1">{title}</div>
          <div className="text-sm text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  )
}

function Step({ n, title, desc, Icon }: { n: number; title: string; desc: string; Icon: LucideIcon }) {
  return (
    <div className="rounded-md border p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center text-navy-800 font-semibold">
            {n}
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-navy-900/90 to-navy-700/90 text-white flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-xs text-slate-500">Paso {n}</div>
      </div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-slate-600">{desc}</div>
    </div>
  )
}
