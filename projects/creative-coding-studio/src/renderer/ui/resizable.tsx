import * as React from "react";
import {
  PanelGroup as RPanelGroup,
  Panel as RPanel,
  PanelResizeHandle,
  type PanelProps,
  type PanelGroupProps,
} from "react-resizable-panels";
import { cn } from "../utils";

const PanelGroup = ({ className, ...props }: PanelGroupProps) => (
  <RPanelGroup className={cn("flex-1 min-h-0", className)} {...props} />
);

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(({ className, ...props }, ref) => (
  <RPanel ref={ref as any} className={cn("min-h-0", className)} {...props} />
));
Panel.displayName = "Panel";

const Handle = ({ className }: { className?: string }) => (
  <PanelResizeHandle
    className={cn(
      "flex items-center justify-center px-1 cursor-col-resize",
      "hover:bg-slate-700/60 bg-slate-700/40",
      className
    )}
  />
);

export { PanelGroup, Panel, Handle };
