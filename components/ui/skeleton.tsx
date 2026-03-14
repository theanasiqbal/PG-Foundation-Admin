import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        "bg-gradient-to-r from-[var(--bg-elevated)] via-[var(--bg-overlay)] to-[var(--bg-elevated)]",
        "bg-[length:200%_100%]",
        "animate-[shimmer_1.5s_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
