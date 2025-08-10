import { cn } from "@/lib/utils"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-900 to-blue-700" aria-hidden />
      <span className="font-semibold tracking-tight">
        <span className="bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Social</span>
        <span className="text-foreground">Credit</span>
      </span>
    </div>
  )
}
