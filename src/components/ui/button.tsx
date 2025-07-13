import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl font-party font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-shadow shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-primary text-neutral-0",
        secondary: "bg-secondary text-neutral-900",
        tertiary: "bg-tertiary text-neutral-900",
        accent: "bg-accent text-neutral-0",
        success: "bg-success text-neutral-0",
        danger: "bg-danger text-neutral-0",
        outline: "border-4 border-primary bg-neutral-0/90 text-primary hover:bg-primary hover:text-neutral-0",
        ghost: "bg-neutral-0/20 backdrop-blur-sm text-neutral-0 hover:bg-neutral-0/30",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3 text-lg",
        sm: "h-10 rounded-2xl px-4 text-sm",
        lg: "h-16 rounded-3xl px-12 text-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const MotionButton = motion.button

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    if (Comp === "button") {
      return (
        <MotionButton
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          {...(props as HTMLMotionProps<"button">)}
        />
      )
    }

    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }