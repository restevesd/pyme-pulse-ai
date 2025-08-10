import { Link } from "react-router-dom"
import { Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-navy-900 to-navy-700" aria-hidden />
            <span className="font-semibold tracking-tight">SocialCredit</span>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            SocialCredit ayuda a PYMEs y entidades financieras a evaluar riesgo con mayor precisión y transparencia.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="grid gap-2">
            <div className="font-medium">Producto</div>
            <a href="#caracteristicas" className="text-slate-600 hover:text-slate-900">
              Características
            </a>
            <a href="#como-funciona" className="text-slate-600 hover:text-slate-900">
              Cómo funciona
            </a>
          </div>
          <div className="grid gap-2">
            <div className="font-medium">Contacto</div>
            <Link to="#" className="text-slate-600 hover:text-slate-900">
              Privacidad
            </Link>
            <Link to="#" className="text-slate-600 hover:text-slate-900">
              Términos
            </Link>
            <div className="flex items-center gap-3 pt-1">
              <a href="#" aria-label="GitHub">
                <Github className="h-5 w-5 text-slate-600 hover:text-slate-900" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-slate-600 hover:text-slate-900" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SocialCredit. Todos los derechos reservados.
      </div>
    </footer>
  )
}
