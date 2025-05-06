
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OrdersList from "./pages/OrdersList";
import OrderForm from "./pages/OrderForm";
import OrderDetail from "./pages/OrderDetail";
import OrderPrint from "./pages/OrderPrint";
import ClientsList from "./pages/ClientsList";
import ClientForm from "./pages/ClientForm";
import ClientDetail from "./pages/ClientDetail";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import TechnicianList from "./pages/TechnicianList";
import TechnicianForm from "./pages/TechnicianForm";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Protected routes within AppLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de órdenes de servicio */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <AppLayout><OrdersList /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders/new" element={
              <ProtectedRoute>
                <AppLayout><OrderForm /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <AppLayout><OrderDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders/:id/edit" element={
              <ProtectedRoute>
                <AppLayout><OrderForm /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders/:id/print" element={
              <ProtectedRoute>
                <OrderPrint />
              </ProtectedRoute>
            } />
            
            {/* Rutas de clientes */}
            <Route path="/clients" element={
              <ProtectedRoute>
                <AppLayout><ClientsList /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clients/new" element={
              <ProtectedRoute>
                <AppLayout><ClientForm /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clients/:id" element={
              <ProtectedRoute>
                <AppLayout><ClientDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clients/:id/edit" element={
              <ProtectedRoute>
                <AppLayout><ClientForm /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de agenda */}
            <Route path="/schedule" element={
              <ProtectedRoute>
                <AppLayout><Schedule /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/schedule/new" element={
              <ProtectedRoute>
                <AppLayout><Schedule /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de técnicos */}
            <Route path="/technicians" element={
              <ProtectedRoute>
                <AppLayout><TechnicianList /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/technicians/new" element={
              <ProtectedRoute>
                <AppLayout><TechnicianForm /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/technicians/:id/edit" element={
              <ProtectedRoute>
                <AppLayout><TechnicianForm /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Configuración */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirección y 404 */}
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
