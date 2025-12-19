import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export const SettingsCard = React.forwardRef<HTMLDivElement, SettingsCardProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg bg-muted/50 p-6",
          className
        )}
        {...props}
      >
        {title && (
          <h3 className="text-base font-medium mb-6">{title}</h3>
        )}
        {children}
      </div>
    );
  }
);
SettingsCard.displayName = "SettingsCard";


