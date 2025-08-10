import { Link } from "react-router-dom"

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 720 420"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-labelledby="title desc"
    >
      <title id="title">Ilustración: Score crediticio para PYMEs con datos financieros y sociales</title>
      <desc id="desc">
        Tarjeta de dashboard con gráfica de líneas, gráfica circular, nodos sociales conectados y un escudo con marca de verificación.
      </desc>

      {/* ====== THEME ====== */}
      <style>
        {`:root{
          --primary:#1f3ae0;
          --accent:#7aa2ff;
          --ink:#0b1220;
          --muted:#8a96a8;
          --bg-from:#f6f8ff;
          --bg-to:#ffffff;
        }
        @media (prefers-color-scheme: dark){
          :root{
            --ink:#e8ecf8;
            --muted:#9fb1d1;
            --bg-from:#0b1022;
            --bg-to:#0e142a;
          }
        }`}
      </style>

      {/* ====== Background ====== */}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--bg-from)" />
          <stop offset="1" stopColor="var(--bg-to)" />
        </linearGradient>

        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>

        <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="28" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="720" height="420" fill="url(#bg)" />
      <ellipse cx="520" cy="110" rx="160" ry="70" fill="var(--primary)" opacity="0.10" filter="url(#blurGlow)" />

      {/* ====== Red social (izquierda) ====== */}
      <g transform="translate(40,90)">
        <g stroke="var(--muted)" strokeWidth="2" opacity="0.7" fill="none">
          <path d="M40 40 C90 15, 130 20, 170 40" />
          <path d="M40 40 C85 70, 140 85, 200 60" />
          <path d="M95 18 C120 35, 145 50, 170 40" />
        </g>
        <g fill="var(--primary)">
          <circle cx="40" cy="40" r="8" />
          <circle cx="95" cy="18" r="6" opacity="0.9" />
          <circle cx="170" cy="40" r="8" />
          <circle cx="200" cy="60" r="6" opacity="0.9" />
          <circle cx="130" cy="80" r="7" opacity="0.9" />
        </g>
        {/* Badge Social */}
        <rect x="0" y="-14" rx="14" ry="14" width="86" height="28" fill="var(--primary)" opacity="0.08" />
        <g fill="var(--primary)">
          <path d="M12 2 h10 a4 4 0 0 1 4 4 v8 a4 4 0 0 1-4 4 h-5 l-5 5 v-5 h-0 a4 4 0 0 1-4-4 V6 a4 4 0 0 1 4-4z" transform="translate(6,0) scale(0.8)" />
          <text x="38" y="11" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="12" fontWeight="600">
            Social
          </text>
        </g>
      </g>

      {/* ====== Tarjeta principal (dashboard) ====== */}
      <g transform="translate(200,70)">
        <rect x="0" y="0" width="380" height="240" rx="18" fill="url(#card)" stroke="rgba(12,20,38,0.06)" />
        {/* Header */}
        <g transform="translate(16,16)">
          <circle cx="12" cy="12" r="6" fill="var(--primary)" opacity="0.15" />
          <text x="28" y="16" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="14" fontWeight="700" fill="var(--ink)">
            Score de riesgo
          </text>
          <text x="28" y="34" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="12" fill="var(--muted)">
            Finanzas + Redes + Referencias
          </text>
        </g>

        {/* Grilla */}
        <g transform="translate(16,70)" stroke="var(--muted)" strokeWidth="1" opacity="0.35">
          <path d="M0 0 H348" />
          <path d="M0 34 H348" />
          <path d="M0 68 H348" />
          <path d="M0 102 H348" />
          <path d="M0 136 H348" />
          <path d="M0 0 V136" />
          <path d="M58 0 V136" />
          <path d="M116 0 V136" />
          <path d="M174 0 V136" />
          <path d="M232 0 V136" />
          <path d="M290 0 V136" />
          <path d="M348 0 V136" />
        </g>

        {/* Área/line chart */}
        <g transform="translate(16,70)">
          <path
            d="M0 108 C40 96, 80 90, 116 88 S174 76, 232 60  290 46, 348 40 L348 136 L0 136 Z"
            fill="var(--accent)"
            opacity="0.22"
          />
          <path
            d="M0 108 C40 96, 80 90, 116 88 S174 76, 232 60  290 46, 348 40"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <g fill="var(--primary)">
            <circle cx="0" cy="108" r="3" />
            <circle cx="116" cy="88" r="3" />
            <circle cx="232" cy="60" r="3" />
            <circle cx="348" cy="40" r="3" />
          </g>
        </g>

        {/* KPI lateral: mini pie */}
        <g transform="translate(290,24)">
          <circle cx="40" cy="40" r="28" fill="none" stroke="var(--muted)" strokeWidth="8" opacity="0.3" />
          <path d="M40 12 A28 28 0 0 1 66 53" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" />
          <text
            x="40"
            y="46"
            textAnchor="middle"
            fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial"
            fontSize="16"
            fontWeight="700"
            fill="var(--ink)"
          >
            72
          </text>
          <text
            x="40"
            y="62"
            textAnchor="middle"
            fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial"
            fontSize="10"
            fill="var(--muted)"
          >
            Score
          </text>
        </g>

        {/* Etiquetas */}
        <g transform="translate(16,214)">
          <rect x="0" y="0" rx="10" ry="10" width="104" height="22" fill="var(--primary)" opacity="0.10" />
          <text x="12" y="15" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="11" fontWeight="600" fill="var(--primary)">
            Estados Fin.
          </text>

          <rect x="116" y="0" rx="10" ry="10" width="90" height="22" fill="var(--primary)" opacity="0.10" />
          <text x="128" y="15" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="11" fontWeight="600" fill="var(--primary)">
            Redes
          </text>

          <rect x="214" y="0" rx="10" ry="10" width="120" height="22" fill="var(--primary)" opacity="0.10" />
          <text x="226" y="15" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="11" fontWeight="600" fill="var(--primary)">
            Referencias
          </text>
        </g>
      </g>

      {/* ====== Escudo (derecha) ====== */}
      <g transform="translate(560,110)">
        <path d="M48 0 L90 16 V48 c0 38-26 62-42 70-16-8-42-32-42-70 V16 L48 0z" fill="var(--primary)" opacity="0.12" />
        <path d="M48 10 L82 22 V48 c0 30-19 49-34 58-15-9-34-28-34-58 V22 L48 10z" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <path d="M32 49 l12 12 26-28" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="48" y="92" textAnchor="middle" fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="12" fill="var(--muted)">
          Validación
        </text>
      </g>

      {/* ====== Línea base ====== */}
      <g transform="translate(40,356)">
        <text fontFamily="Inter, system-ui, Segoe UI, Roboto, Arial" fontSize="12" fill="var(--muted)">
          Prueba gratuita · Sin tarjeta · Resultados en minutos
        </text>
      </g>
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/10 to-transparent" aria-hidden />
      <div className="container py-16 md:py-24 grid gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-navy-800">
            Nuevo
            <span className="text-slate-500">Análisis social + financiero</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Score crediticio para PYMEs impulsado por datos financieros y sociales
          </h1>
          <p className="text-lg text-slate-600">
            SocialCredit unifica estados financieros, señales de redes sociales y cartas de recomendación para evaluar
            el riesgo con mayor precisión y transparencia.
          </p>
          <div>
            <Link
              to="/analyze"
              className="inline-flex items-center justify-center rounded-md bg-navy-800 hover:bg-navy-700 text-white px-6 py-3 text-lg"
            >
              Evaluar empresa
            </Link>
          </div>
          <div className="text-sm text-slate-500">Prueba gratuita • Sin tarjeta • Resultados en minutos</div>
        </div>

        <div className="relative">
          <div className="w-full rounded-xl border shadow-sm overflow-hidden">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}