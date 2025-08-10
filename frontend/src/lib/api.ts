export function getApiBase(): string {
  // Prioridad: window override -> VITE_API_BASE_URL -> fallback local
  if (typeof window !== "undefined" && (window as any).__API_BASE_URL__) {
    return String((window as any).__API_BASE_URL__)
  }
  const v = import.meta.env.VITE_API_BASE_URL as string | undefined
  return v ?? "http://localhost:8000"
}
