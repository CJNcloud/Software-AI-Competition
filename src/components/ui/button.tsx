// 这段代码定义了一个可自定义的 Button 组件，使用了 React 和 Radix UI。以下是各部分的关键解析：

// 导入模块：

// React：用于构建组件。
// Slot：来自 @radix-ui/react-slot，可以让 Button 组件作为其他组件的容器进行渲染（通过传递 asChild 属性）。
// cva 和 VariantProps：来自 class-variance-authority，用于管理和定义组件样式的变种（variants）。
// cn：一个工具函数，可能是用来组合和处理 class 名的。
// 按钮样式变种 (buttonVariants)： 使用 cva 函数定义了一个基础的样式，并提供了不同的 variant 和 size 变种。每个变种对应不同的样式设置。例如：

// variant: 定义了按钮的不同外观（如 default、destructive、outline、secondary、ghost、link）。
// size: 定义了按钮的不同尺寸（如 default、sm、lg、icon）。
// Button 组件：

// Button 是一个接受 variant 和 size 属性的按钮组件，它通过 class-variance-authority 来动态设置样式。
// 通过 asChild 属性可以将 Button 渲染为其他组件而不是 <button> 标签，这在需要与其他 UI 组件集成时非常有用。
// cn 函数将样式类名合并到一起，以便按钮根据传递的 variant、size 和 className 进行样式调整。
// forwardRef： Button 使用了 React.forwardRef，允许你通过 ref 访问底层的 button 元素。这对于一些需要访问 DOM 元素的场景（如焦点管理或动画）非常有用。
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
