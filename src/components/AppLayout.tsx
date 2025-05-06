
import { ReactNode, useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, ClipboardList, Home, Settings, UserRound, Menu, ChevronRight, LogOut, Users, Wrench } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", name: "Panel", icon: <Home className="h-4 w-4 mr-2" /> },
  { path: "/orders", name: "Órdenes de servicio", icon: <ClipboardList className="h-4 w-4 mr-2" /> },
  { path: "/clients", name: "Clientes", icon: <UserRound className="h-4 w-4 mr-2" /> },
  { path: "/schedule", name: "Agenda", icon: <CalendarDays className="h-4 w-4 mr-2" /> },
  { path: "/technicians", name: "Técnicos", icon: <Wrench className="h-4 w-4 mr-2" /> },
  { path: "/settings", name: "Configuración", icon: <Settings className="h-4 w-4 mr-2" /> },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // If sidebar was previously collapsed, restore that state
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (isCollapsed) {
      // If it's already collapsed, we're expanding it
      setIsCollapsed(false);
    } else {
      // If it's expanded, we're collapsing it
      setIsCollapsed(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {isSidebarVisible && (
          <Sidebar className="border-r border-notion-border">
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={handleSidebarToggle}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
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
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium">Usuario</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "usuario@ejemplo.com"}
                    </p>
                  </div>
                )}
                {!isCollapsed && (
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </SidebarFooter>
          </Sidebar>
        )}
        <div className="flex-1 overflow-auto">
          {!isSidebarVisible && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="m-2" 
              onClick={() => setIsSidebarVisible(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <main className="notion-container py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
