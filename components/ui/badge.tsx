import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2 border font-medium transition-colors",
  {
    variants: {
      variant: {
        default:       "h-5 text-[11px] bg-[var(--accent-glow)] text-[var(--accent)] border-[rgba(59,130,246,0.2)]",
        secondary:     "h-5 text-[11px] bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
        outline:       "h-5 text-[11px] bg-transparent text-[var(--text-secondary)] border-[var(--border-default)]",
        destructive:   "h-5 text-[11px] bg-[var(--danger-bg)] text-[var(--danger)] border-[rgba(239,68,68,0.2)]",
        // Status
        pending:       "h-5 text-[11px] bg-[var(--warning-bg)] text-[var(--warning)] border-[rgba(245,158,11,0.2)]",
        in_progress:   "h-5 text-[11px] bg-[var(--info-bg)] text-[var(--info)] border-[rgba(59,130,246,0.2)]",
        resolved:      "h-5 text-[11px] bg-[var(--success-bg)] text-[var(--success)] border-[rgba(16,185,129,0.2)]",
        urgent:        "h-5 text-[11px] bg-[var(--danger-bg)] text-[var(--danger)] border-[rgba(239,68,68,0.2)]",
        high:          "h-5 text-[11px] bg-[rgba(251,146,60,0.12)] text-[#FB923C] border-[rgba(251,146,60,0.2)]",
        medium:        "h-5 text-[11px] bg-[var(--warning-bg)] text-[var(--warning)] border-[rgba(245,158,11,0.2)]",
        low:           "h-5 text-[11px] bg-[var(--success-bg)] text-[var(--success)] border-[rgba(16,185,129,0.2)]",
        // Category
        healthcare:    "h-5 text-[11px] bg-[var(--healthcare-bg)] text-[var(--healthcare)] border-[rgba(244,63,94,0.2)]",
        education:     "h-5 text-[11px] bg-[var(--education-bg)] text-[var(--education)] border-[rgba(245,158,11,0.2)]",
        community:     "h-5 text-[11px] bg-[var(--community-bg)] text-[var(--community)] border-[rgba(139,92,246,0.2)]",
        // Other
        active:        "h-5 text-[11px] bg-[var(--success-bg)] text-[var(--success)] border-[rgba(16,185,129,0.2)]",
        inactive:      "h-5 text-[11px] bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
