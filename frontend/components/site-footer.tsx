import Link from "next/link"
import { Logo } from "./logo"
import { Github, Linkedin } from "lucide-react"

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className="border-t">
      <div className="container max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-md">
            SocialCredit ayuda a PYMEs y entidades financieras a evaluar riesgo con mayor precisión y transparencia.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="grid gap-2">
            <div className="font-medium">Producto</div>
            <Link href="#caracteristicas" className="text-muted-foreground hover:text-foreground">
              Características
            </Link>
            <Link href="#como-funciona" className="text-muted-foreground hover:text-foreground">
              Cómo funciona
            </Link>
            <Link href="#testimonios" className="text-muted-foreground hover:text-foreground">
              Testimonios
            </Link>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Compañía</div>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Privacidad
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Términos
            </Link>
            <div className="flex items-center gap-3 pt-1">
              <Link href="#" aria-label="GitHub">
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SocialCredit. Todos los derechos reservados.
      </div>
    </footer>
  )
}
