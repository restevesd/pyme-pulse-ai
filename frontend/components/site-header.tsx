"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { Menu, X } from "lucide-react"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="sr-only">SocialCredit</span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-6 text-sm">
          <Link href="#caracteristicas" className="text-muted-foreground hover:text-foreground">
            Características
          </Link>
          <Link href="#como-funciona" className="text-muted-foreground hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="#testimonios" className="text-muted-foreground hover:text-foreground">
            Testimonios
          </Link>
          <Link href="#faq" className="text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
          <Button asChild size="sm">
            <Link href="/analyze">Comenzar</Link>
          </Button>
        </nav>

        <button
          className="ml-auto md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 border"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="container max-w-6xl mx-auto px-4 py-4 grid gap-2 text-sm">
            <Link href="#caracteristicas" className="py-2" onClick={() => setOpen(false)}>
              Características
            </Link>
            <Link href="#como-funciona" className="py-2" onClick={() => setOpen(false)}>
              Cómo funciona
            </Link>
            <Link href="#testimonios" className="py-2" onClick={() => setOpen(false)}>
              Testimonios
            </Link>
            <Link href="#faq" className="py-2" onClick={() => setOpen(false)}>
              FAQ
            </Link>
            <Button asChild size="sm" className="mt-2" onClick={() => setOpen(false)}>
              <Link href="/analyze">Comenzar</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
