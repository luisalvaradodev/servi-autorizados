import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { PanelLeft, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COLLAPSED_WIDTH = "64px"
const SIDEBAR_EXPANDED_WIDTH = "240px"
const SIDEBAR_MOBILE_WIDTH = "280px"

type SidebarContextType = {
  isCollapsed: boolean
  isMobile: boolean
  toggleCollapse: () => void
  toggleMobile: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode
  defaultCollapsed?: boolean
}) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      ?.split('=')[1]
      
    if (cookieValue) {
      setIsCollapsed(cookieValue === 'collapsed')
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState ? 'collapsed' : 'expanded'}; path=/; max-age=${60 * 60 * 24 * 7}`
  }

  const value = {
    isCollapsed,
    isMobile,
    toggleCollapse,
    toggleMobile: setIsMobileOpen
  }

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={100}>
        {children}
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
}

export function Sidebar({ side = "left", className, children, ...props }: SidebarProps) {
  const { isCollapsed, isMobile, toggleMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet onOpenChange={toggleMobile}>
        <SheetContent
          side={side}
          className="w-[--sidebar-mobile-width] p-0"
          style={{ "--sidebar-mobile-width": SIDEBAR_MOBILE_WIDTH } as React.CSSProperties}
        >
          <div className="flex h-full flex-col">
            <div className="p-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8"
                onClick={() => toggleMobile(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      {...props}
      style={{
        width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className={cn(
        "group/sidebar fixed top-0 h-screen z-40 bg-background border-r",
        "flex flex-col overflow-hidden",
        side === "left" ? "left-0" : "right-0",
        className
      )}
    >
      <div className="relative flex-1">
        {children}
        <SidebarToggle />
      </div>
    </aside>
  )
}

export function SidebarToggle({ className }: { className?: string }) {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <div className={cn(
      "absolute bottom-4 w-full px-2",
      className
    )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-8"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">{isCollapsed ? "Expandir" : "Colapsar"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isCollapsed ? "Expandir" : "Colapsar"}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-16 items-center px-4 border-b",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 font-semibold">
        {children}
      </div>
    </div>
  )
}

export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-2",
        className
      )}
      {...props}
    >
      <div className={cn(
        "flex flex-col gap-1",
        isCollapsed ? "items-center" : ""
      )}>
        {children}
      </div>
    </div>
  )
}

const sidebarItemVariants = cva(
  "flex items-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        active: "bg-accent text-accent-foreground",
      },
      collapsed: {
        true: "justify-center",
        false: "justify-start px-3"
      }
    },
    defaultVariants: {
      variant: "default",
      collapsed: false
    }
  }
)

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  active?: boolean
  tooltip?: string
}

export function SidebarItem({
  icon,
  children,
  active,
  tooltip,
  className,
  ...props
}: SidebarItemProps) {
  const { isCollapsed } = useSidebar()

  const content = (
    <button
      className={cn(
        sidebarItemVariants({
          variant: active ? "active" : "default",
          collapsed: isCollapsed,
          className: cn("h-9 w-full", className)
        })
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {!isCollapsed && children}
      </span>
    </button>
  )

  if (isCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-2 border-t mt-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("my-2 border-t", className)}
      {...props}
    />
  )
}