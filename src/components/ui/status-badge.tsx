import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Circle } from "lucide-react";

const statusBadgeVariants = cva(
  "transition-all duration-200 inline-flex items-center gap-1.5",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
      },
      status: {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800",
        inProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800",
        completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "pending",
    },
  }
);

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "status">,
    VariantProps<typeof statusBadgeVariants> {
  status: "Pendiente" | "En proceso" | "Completado" | "Cancelado";
  showIcon?: boolean;
}

export function StatusBadge({
  className,
  variant,
  status,
  showIcon = true,
  ...props
}: StatusBadgeProps) {
  const mappedStatus = 
    status === "Pendiente" ? "pending" :
    status === "En proceso" ? "inProgress" :
    status === "Completado" ? "completed" : 
    status === "Cancelado" ? "cancelled" : "pending";
  
  const Icon = 
    status === "Pendiente" ? AlertCircle :
    status === "En proceso" ? Clock :
    status === "Completado" ? CheckCircle : Circle;

  return (
    <Badge 
      className={cn(
        statusBadgeVariants({ variant, status: mappedStatus }),
        className
      )}
      variant="outline"
      {...props}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  );
}