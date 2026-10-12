import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
        outline: "border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]",
        secondary: "bg-[var(--dash-subtle)] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]",
        ghost: "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        icon: "size-9",
        "icon-sm": "size-8 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export default function Button({ className, variant, size, asChild = false, children, ...props }) {
  const classes = cn(buttonVariants({ variant, size, className }));
  if (asChild && children?.type) {
    const Child = children.type;
    return <Child {...children.props} {...props} className={cn(classes, children.props.className)} />;
  }
  return <button className={classes} {...props}>{children}</button>;
}
