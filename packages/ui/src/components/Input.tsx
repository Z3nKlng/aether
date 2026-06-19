import * as React from "react"
import { cn } from "../utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm text-neutral-400 font-medium"
          >
            {label}
          </label>
        )}
        <motion.div
          initial={false}
          animate={error ? { x: [0, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border bg-white/5 px-4 py-2 text-sm",
              "ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-neutral-600",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              error 
                ? "border-red-500/50 focus-visible:ring-red-500/50" 
                : "border-white/10 focus-visible:ring-neon-blue/50 hover:border-white/20",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </motion.div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }