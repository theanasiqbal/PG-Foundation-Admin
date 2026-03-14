import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-[36px] w-full rounded-[8px] px-3 py-1 text-[13px] text-[var(--text-primary)]",
        "bg-[var(--bg-elevated)] border border-[var(--border-default)]",
        "placeholder:text-[var(--text-muted)]",
        "font-[inherit]",
        "transition-[border-color,box-shadow] duration-200",
        "focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-glow)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
