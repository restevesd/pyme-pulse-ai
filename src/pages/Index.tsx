import hero from "@/assets/hero-risk.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-80" aria-hidden="true" />
        <div className="container mx-auto grid lg:grid-cols-2 gap-10 items-center py-20 relative">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Scoring alternativo para PYMEs impulsado por IA</h1>
            <p className="text-lg text-muted-foreground max-w-prose">
              Evalúa el riesgo financiero de negocios sin historial formal usando datos alternativos: redes sociales, referencias y actividad comercial. Acelera el crédito, reduce el riesgo.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/evaluar">Evaluar una empresa</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#como-funciona">Cómo funciona</a>
              </Button>
            </div>
          </div>
          <Card className="card-glass tilt-hover">
            <CardContent className="p-0">
              <img src={hero} alt="Visualización de datos de riesgo PYME" loading="lazy" className="w-full h-full object-cover" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="como-funciona" className="container mx-auto py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardContent className="p-6 space-y-2">
              <h3 className="text-xl font-semibold">1. Recolecta</h3>
              <p className="text-muted-foreground">Sube estados (SCVS), agrega redes y referencias.</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6 space-y-2">
              <h3 className="text-xl font-semibold">2. Analiza</h3>
              <p className="text-muted-foreground">IA transforma datos no estructurados en señales útiles.</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6 space-y-2">
              <h3 className="text-xl font-semibold">3. Decide</h3>
              <p className="text-muted-foreground">Obtén un puntaje, explicación y crédito recomendado.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Index;
