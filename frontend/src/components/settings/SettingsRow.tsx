import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  showArrow?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const SettingsRow = React.forwardRef<HTMLDivElement, SettingsRowProps>(
  ({ className, label, showArrow = false, onClick, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between py-4",
          showArrow && onClick && "cursor-pointer hover:opacity-70",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="flex-1">
          <span className="font-medium">{label}</span>
          {children}
        </div>
        {showArrow && (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    );
  }
);
SettingsRow.displayName = "SettingsRow";


