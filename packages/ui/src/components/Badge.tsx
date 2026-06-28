import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neon-blue/10 text-neon-blue shadow-[0_0_10px_rgba(0,174,255,0.2)]",
        secondary:
          "border-transparent bg-white/5 text-neutral-400",
        destructive:
          "border-transparent bg-red-500/10 text-red-500",
        outline: "text-neutral-400 border-white/10 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

function Badge({ className, variant, children }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)}>{children}</div>
  )
}

export { Badge, badgeVariants }
