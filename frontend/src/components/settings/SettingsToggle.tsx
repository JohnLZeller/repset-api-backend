import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SettingsToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsToggle = React.forwardRef<
  React.ElementRef<typeof Switch>,
  SettingsToggleProps
>(({ checked, onCheckedChange, disabled = false, className, ...props }, ref) => {
  return (
    <Switch
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(disabled && "data-[state=checked]:bg-green-500", className)}
      {...props}
    />
  );
});
SettingsToggle.displayName = "SettingsToggle";

