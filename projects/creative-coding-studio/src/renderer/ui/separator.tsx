import * as React from "react";
import { cn } from "../utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      orientation === "vertical"
        ? "h-full w-px bg-slate-700"
        : "w-full h-px bg-slate-700",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
