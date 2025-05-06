import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from "@/components/ui/card";
import { CalendarDays, Clock, UserRound } from "lucide-react";

const orderCardVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-border hover:border-primary/20 hover:shadow-sm",
        selected: "border-primary/30 shadow-sm bg-primary/5 dark:bg-primary/10",
      },
      size: {
        default: "p-4",
        sm: "p-2",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface OrderCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof orderCardVariants> {
  orderNumber: string;
  clientName: string;
  deviceInfo: string;
  problemSummary: string;
  date: string;
  status: "Pendiente" | "En proceso" | "Completado";
  appointment?: {
    date: string;
    time: string;
    technician?: string;
  };
}

export function OrderCard({
  className,
  variant,
  size,
  orderNumber,
  clientName,
  deviceInfo,
  problemSummary,
  date,
  status,
  appointment,
  ...props
}: OrderCardProps) {
  return (
    <Card 
      className={cn(
        orderCardVariants({ variant, size }),
        "group overflow-hidden",
        className
      )}
      {...props}
    >
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-none group-hover:text-primary transition-colors">
            Orden #{orderNumber}
          </h3>
          <p className="text-xs text-muted-foreground">{clientName}</p>
        </div>
        <Badge 
          variant={
            status === "Completado" ? "outline" :
            status === "En proceso" ? "default" :
            "secondary"
          }
          className="transition-all duration-200"
        >
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">{deviceInfo}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{problemSummary}</p>
        </div>
      </CardContent>
      {appointment && (
        <CardFooter className="px-4 py-3 border-t bg-muted/50 text-xs flex flex-wrap gap-y-1 gap-x-3">
          <div className="flex items-center">
            <CalendarDays className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>
          {appointment.technician && (
            <div className="flex items-center">
              <UserRound className="mr-1 h-3 w-3 text-muted-foreground" />
              <span>{appointment.technician}</span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}