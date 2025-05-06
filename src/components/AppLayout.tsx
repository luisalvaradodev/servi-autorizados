import { ReactNode } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarProvider, 
  useSidebar,
  SidebarItem,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  ClipboardList, 
  Home, 
  Settings, 
  UserRound, 
  ChevronLeft,
  ChevronRight,
  LogOut, 
  Wrench,
  Menu
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { path: "/dashboard", name: "Panel", icon: <Home className="h-4 w-4" /> },
  { path: "/orders", name: "Órdenes", icon: <ClipboardList className="h-4 w-4" /> },
  { path: "/clients", name: "Clientes", icon: <UserRound className="h-4 w-4" /> },
  { path: "/schedule", name: "Agenda", icon: <CalendarDays className="h-4 w-4" /> },
  { path: "/technicians", name: "Técnicos", icon: <Wrench className="h-4 w-4" /> },
  { path: "/settings", name: "Configuración", icon: <Settings className="h-4 w-4" /> },
];

interface AppLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isCollapsed, toggleCollapse, isMobile } = useSidebar();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className={cn(
        "border-r bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80",
        "transition-all duration-300 ease-out shadow-xl",
        isCollapsed ? "w-[64px]" : "w-[240px]"
      )}>
        <SidebarHeader className="border-b p-3">
          <div className="flex items-center justify-between gap-2">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className={cn(
                "h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0",
                "transition-all duration-300"
              )}>
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-semibold whitespace-nowrap"
                >
                  ServiAutorizados
                </motion.h2>
              )}
            </Link>
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 hover:bg-primary/10"
                onClick={toggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <nav className="flex flex-col gap-1 p-2">
            {navItems.map((item) => (
              <TooltipProvider key={item.path} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <SidebarItem
                        asChild
                        icon={item.icon}
                        active={location.pathname.startsWith(item.path)}
                        className={cn(
                          "group relative",
                          location.pathname.startsWith(item.path) && 
                            "bg-primary/10 text-primary-foreground"
                        )}
                      >
                        <Link 
                          to={item.path} 
                          className="flex items-center w-full"
                        >
                          {!isCollapsed && (
                            <span className="ml-2 text-sm truncate">
                              {item.name}
                            </span>
                          )}
                          {location.pathname.startsWith(item.path) && (
                            <motion.div
                              className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            />
                          )}
                        </Link>
                      </SidebarItem>
                    </motion.div>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent 
                      side="right"
                      className="border bg-popover text-popover-foreground"
                      sideOffset={8}
                    >
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
          
          <SidebarSeparator className="my-2 bg-border/30" />
        </SidebarContent>
        
        <SidebarFooter className="border-t p-3">
          <div className="flex items-center justify-between gap-2">
            <Link 
              to="/profile" 
              className="flex items-center gap-2 overflow-hidden"
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-medium truncate">
                    {user?.email?.split('@')[0] || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </motion.div>
              )}
            </Link>
            
            {!isCollapsed ? (
              <div className="flex items-center gap-1">
                <ModeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ModeToggle />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleLogout}
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right"
                      className="border bg-popover text-popover-foreground"
                      sideOffset={8}
                    >
                      Cerrar sesión
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <main className={cn(
        "flex-1 overflow-auto transition-[margin] duration-300",
        "bg-background",
        isCollapsed ? "ml-[64px]" : "ml-[240px]"
      )}>
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}