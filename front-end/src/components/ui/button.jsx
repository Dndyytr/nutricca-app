import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center cursor-pointer justify-center gap-2 rounded-md t-size3 font-medium whitespace-nowrap transition-all duration-300 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-oklch(0.577 0.245 27.325)/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-oklch(0.205 0 0) text-oklch(0.985 0 0) hover:bg-oklch(0.205 0 0)/90 dark:bg-oklch(0.922 0 0) dark:text-oklch(0.205 0 0) dark:hover:bg-oklch(0.922 0 0)/90",
        destructive: "bg-red-600 text-white hover:bg-red-400 active:bg-red-400",
        outline:
          "border text-(--color-primary) border-(--color-primary) bg-(--color-primary)/10 shadow-xs hover:bg-(--color-primary)/30 hover:text-oklch(0.205 0 0) dark:border-oklch(0.922 0 0) dark:bg-oklch(0.922 0 0)/30 dark:hover:bg-oklch(0.922 0 0)/50 dark:bg-oklch(0.145 0 0) dark:hover:bg-oklch(0.269 0 0) dark:hover:text-oklch(0.985 0 0) dark:dark:border-oklch(1 0 0 / 15%) dark:dark:bg-oklch(1 0 0 / 15%)/30 dark:dark:hover:bg-oklch(1 0 0 / 15%)/50",
        secondary:
          "bg-oklch(0.97 0 0) text-oklch(0.205 0 0) hover:bg-oklch(0.97 0 0)/80 dark:bg-oklch(0.269 0 0) dark:text-oklch(0.985 0 0) dark:hover:bg-oklch(0.269 0 0)/80",
        ghost:
          "hover:bg-oklch(0.97 0 0) hover:text-oklch(0.205 0 0) dark:hover:bg-oklch(0.97 0 0)/50 dark:hover:bg-oklch(0.269 0 0) dark:hover:text-oklch(0.985 0 0) dark:dark:hover:bg-oklch(0.269 0 0)/50",
        link: "text-oklch(0.205 0 0) underline-offset-4 hover:underline dark:text-oklch(0.922 0 0)",
        select:
          "text-slate-800 bg-slate-50 border border-slate-100 shadow-xs focus-within:border-(--color-primary) focus-within:ring-[3px] focus-within:ring-(--color-primary)/50",
      },
      size: {
        default: "px-2.5 py-1.5 bp360:px-3 bp360:py-2",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
