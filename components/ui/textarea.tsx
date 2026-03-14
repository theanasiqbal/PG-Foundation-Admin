import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[96px] w-full rounded-[8px] px-3 py-2.5 text-[13px] text-[var(--text-primary)]",
        "bg-[var(--bg-elevated)] border border-[var(--border-default)]",
        "placeholder:text-[var(--text-muted)]",
        "font-[inherit] resize-vertical",
        "transition-[border-color,box-shadow] duration-200",
        "focus:outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-glow)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
