import React from "react";
import { cn } from "@/lib/utils";

interface InfoGroupProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoGroup({ label, value, icon, className }: InfoGroupProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <div className={cn("font-medium text-sm", {
          "text-foreground": value !== "",
          "text-muted-foreground italic": value === "",
        })}>
          {value || "No disponible"}
        </div>
      </div>
    </div>
  );
}