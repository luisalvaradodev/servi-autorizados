
import { ReactNode, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, ClipboardList, Home, Settings, UserRound, Menu, ChevronRight, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", name: "Panel", icon: <Home className="h-4 w-4 mr-2" /> },
  { path: "/orders", name: "Órdenes de servicio", icon: <ClipboardList className="h-4 w-4 mr-2" /> },
  { path: "/clients", name: "Clientes", icon: <UserRound className="h-4 w-4 mr-2" /> },
  { path: "/schedule", name: "Agenda", icon: <CalendarDays className="h-4 w-4 mr-2" /> },
  { path: "/settings", name: "Configuración", icon: <Settings className="h-4 w-4 mr-2" /> },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar
          className="border-r border-notion-border"
          onCollapseChange={setIsCollapsed}
        >
          <SidebarHeader className="border-b border-notion-border p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="text-lg font-medium">ServiceScribe</h2>
                {!isCollapsed && (
                  <p className="text-xs text-muted-foreground">
                    Gestión de servicios
                  </p>
                )}
              </div>
              <SidebarTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </SidebarTrigger>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`notion-sidebar-item ${
                    location.pathname.startsWith(item.path) ? "active" : ""
                  }`}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </SidebarContent>
          <SidebarFooter className="border-t border-notion-border p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium">Usuario</p>
                  <p className="text-xs text-muted-foreground truncate">
                    usuario@ejemplo.com
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <main className="notion-container py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
