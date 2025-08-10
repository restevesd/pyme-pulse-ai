"use client"

import * as React from "react"

type SliderProps = {
  id?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  className?: string
}

// Simplified shadcn-like slider stub using input[type=range] for Next.js demo
export function Slider({
  id,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = [50],
  onValueChange,
  className = "",
}: SliderProps) {
  const [val, setVal] = React.useState<number>(defaultValue[0] ?? 0)
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => {
        const v = Number(e.target.value)
        setVal(v)
        onValueChange?.([v])
      }}
      className={["w-full accent-blue-700", className].join(" ")}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={val}
    />
  )
}
