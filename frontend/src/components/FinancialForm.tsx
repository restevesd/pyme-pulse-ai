import type React from "react"

export type FinancialFormValues = {
  activoCorriente?: {
    efectivo?: number
    cuentasPorCobrar?: number
    cxcAccionistas?: number
    otrosActivosCorrientes?: number
    total?: number
  }
  activoNoCorriente?: {
    inventarios?: number
    activosFijosNetos?: number
    intangibles?: number
    otrosNoCorrientes?: number
    total?: number
  }
  pasivoCorriente?: {
    cuentasPorPagar?: number
    prestamosCP?: number
    otrosPasivosCorrientes?: number
    total?: number
  }
  pasivoNoCorriente?: {
    deudaLP?: number
    otrosPasivosNoCorrientes?: number
    total?: number
  }
  patrimonio?: {
    capital?: number
    reservas?: number
    resultadosAcumulados?: number
    total?: number
  }
  totals?: {
    totalActivo?: number
    totalPasivoPatrimonio?: number
  }
  ratios?: {
    liquidezCorriente?: number
    endeudamiento?: number
    margen?: number
  }
  composite?: number
}

export default function FinancialForm({ values }: { values: FinancialFormValues | null }) {
  const v = values ?? {}
  return (
    <div className="grid gap-6">
      <NoticeOnlyFinance />
      <Section title="Activo Corriente">
        <GridTwo>
          <RO label="Monto en Efectivo y Equivalentes" value={v.activoCorriente?.efectivo} />
          <RO label="Total de Cuentas por Cobrar" value={v.activoCorriente?.cuentasPorCobrar} />
          <RO label="Cuentas por Cobrar a Accionistas" value={v.activoCorriente?.cxcAccionistas} />
          <RO label="Otros Activos Corrientes" value={v.activoCorriente?.otrosActivosCorrientes} />
          <RO label="Total del Activo Corriente" value={v.activoCorriente?.total} full />
        </GridTwo>
      </Section>

      <Section title="Activo No Corriente">
        <GridTwo>
          <RO label="Inventarios (si aplica)" value={v.activoNoCorriente?.inventarios} />
          <RO label="Activos fijos netos" value={v.activoNoCorriente?.activosFijosNetos} />
          <RO label="Activos intangibles" value={v.activoNoCorriente?.intangibles} />
          <RO label="Otros activos no corrientes" value={v.activoNoCorriente?.otrosNoCorrientes} />
          <RO label="Total del activo no corriente" value={v.activoNoCorriente?.total} full />
        </GridTwo>
      </Section>

      <Section title="Pasivo Corriente">
        <GridTwo>
          <RO label="Proveedores y otras CxP" value={v.pasivoCorriente?.cuentasPorPagar} />
          <RO label="Préstamos CP" value={v.pasivoCorriente?.prestamosCP} />
          <RO label="Otros pasivos corrientes" value={v.pasivoCorriente?.otrosPasivosCorrientes} />
          <RO label="Total pasivo corriente" value={v.pasivoCorriente?.total} full />
        </GridTwo>
      </Section>

      <Section title="Pasivo No Corriente">
        <GridTwo>
          <RO label="Deuda LP" value={v.pasivoNoCorriente?.deudaLP} />
          <RO label="Otros pasivos no corrientes" value={v.pasivoNoCorriente?.otrosPasivosNoCorrientes} />
          <RO label="Total pasivo no corriente" value={v.pasivoNoCorriente?.total} full />
        </GridTwo>
      </Section>

      <Section title="Patrimonio">
        <GridTwo>
          <RO label="Capital" value={v.patrimonio?.capital} />
          <RO label="Reservas" value={v.patrimonio?.reservas} />
          <RO label="Resultados acumulados" value={v.patrimonio?.resultadosAcumulados} />
          <RO label="Total patrimonio" value={v.patrimonio?.total} full />
        </GridTwo>
      </Section>

      <Section title="Totales y Ratios">
        <GridTwo>
          <RO label="Total Activo" value={v.totals?.totalActivo} />
          <RO label="Total Pasivo + Patrimonio" value={v.totals?.totalPasivoPatrimonio} />
          <RO label="Liquidez corriente (AC/PC)" value={v.ratios?.liquidezCorriente} full />
          <RO label="Endeudamiento (Pasivo/Activo)" value={v.ratios?.endeudamiento} full />
          <RO label="Margen (Utilidad/Ingresos)" value={v.ratios?.margen} full />
          <RO label="Score financiero (0-100)" value={v.composite} full />
        </GridTwo>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border">
      <div className="border-b px-4 py-3 font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}
function GridTwo({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}
function RO({ label, value, full = false }: { label: string; value: number | undefined; full?: boolean }) {
  return (
    <div className={full ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
      <label className="text-sm">{label}</label>
      <input className="h-10 rounded-md border px-3" readOnly value={value ?? ""} placeholder="—" />
    </div>
  )
}
function NoticeOnlyFinance() {
  return (
    <div className="rounded-md border bg-blue-50/40 p-3 text-sm">
      Nota: Para calcular el score solo es obligatorio completar el paso Finanzas (RUC y PDF). Redes y Cartas son
      opcionales y mejoran el análisis final.
    </div>
  )
}
