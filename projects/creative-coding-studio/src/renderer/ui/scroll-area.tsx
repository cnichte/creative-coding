import * as React from "react";

import { cn } from "../utils";

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-auto [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.600)_transparent]",
        "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
