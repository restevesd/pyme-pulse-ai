"use client"

import { Link } from "react-router-dom"
import { Menu } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-navy-900 to-navy-700" aria-hidden />
          <span className="font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">Social</span>
            <span>Credit</span>
          </span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-6 text-sm">
          <a href="#caracteristicas" className="text-slate-500 hover:text-slate-900">
            Características
          </a>
          <a href="#como-funciona" className="text-slate-500 hover:text-slate-900">
            Cómo funciona
          </a>
          <a href="#faq" className="text-slate-500 hover:text-slate-900">
            FAQ
          </a>
          <Link
            to="/analyze"
            className="inline-flex items-center justify-center rounded-md bg-navy-800 hover:bg-navy-700 text-white px-4 py-2"
          >
            Evaluar empresa
          </Link>
        </nav>
        <button
          className="ml-auto md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 border"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-4 grid gap-2 text-sm">
            <a href="#caracteristicas" className="py-2" onClick={() => setOpen(false)}>
              Características
            </a>
            <a href="#como-funciona" className="py-2" onClick={() => setOpen(false)}>
              Cómo funciona
            </a>
            <a href="#faq" className="py-2" onClick={() => setOpen(false)}>
              FAQ
            </a>
            <Link
              to="/analyze"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-navy-800 hover:bg-navy-700 text-white px-4 py-2"
              onClick={() => setOpen(false)}
            >
              Evaluar empresa
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
