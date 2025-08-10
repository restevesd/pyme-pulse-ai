import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Steps } from "@/components/steps"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "SocialCredit — Score crediticio para PYMEs basado en datos financieros y sociales",
  description:
    "Analiza el score crediticio de tu PyME con SocialCredit: integra estados financieros, redes sociales y cartas de recomendación en un único flujo.",
}

export default function Page() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Steps />
        <Testimonials />
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  )
}
