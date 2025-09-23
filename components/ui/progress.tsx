"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "gradient" | "neon"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const variantClasses = {
      default: "bg-gradient-to-r from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient",
      neon: "bg-gradient-to-r from-green-400 to-blue-500 shadow-lg shadow-green-500/50"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
        {variant === "neon" && (
          <div
            className="absolute top-0 h-full bg-white/30 rounded-full blur-sm"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }