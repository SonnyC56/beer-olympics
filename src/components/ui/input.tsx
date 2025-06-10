import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const MotionInput = motion.input

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <MotionInput
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border-4 border-primary bg-neutral-0/90 px-4 py-2 text-lg font-party ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-900/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        whileFocus={{ scale: 1.02, transition: { duration: 0.2 } }}
        {...(props as HTMLMotionProps<"input">)}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }