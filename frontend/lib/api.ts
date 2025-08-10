// Client-safe config for API base.
// Priority: explicit flag/useProxy -> NEXT_PUBLIC_API_BASE_URL -> http://localhost:8000
export function getApiBase(useProxy: boolean | null | undefined): string {
  if (useProxy) return "/api/proxy"
  if (typeof window !== "undefined") {
    const env = (window as any).__NEXT_PUBLIC_API_BASE_URL__ as string | undefined
    // Next.js cannot inject process.env client-side unless prefixed; this shim allows hydration via window if needed.
    return env ?? "http://localhost:8000"
  }
  return "http://localhost:8000"
}
