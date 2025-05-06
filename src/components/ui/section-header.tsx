import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  backTo, 
  onBack, 
  children,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between pb-6",
      className
    )}>
      <div className="flex items-center space-x-2">
        {(backTo || onBack) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 transition-all rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}