
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OrdersList from "./pages/OrdersList";
import OrderForm from "./pages/OrderForm";
import OrderDetail from "./pages/OrderDetail";
import OrderPrint from "./pages/OrderPrint";
import ClientsList from "./pages/ClientsList";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Protected routes within AppLayout */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          
          {/* Rutas de órdenes de servicio */}
          <Route path="/orders" element={<AppLayout><OrdersList /></AppLayout>} />
          <Route path="/orders/new" element={<AppLayout><OrderForm /></AppLayout>} />
          <Route path="/orders/:id" element={<AppLayout><OrderDetail /></AppLayout>} />
          <Route path="/orders/:id/edit" element={<AppLayout><OrderForm /></AppLayout>} />
          <Route path="/orders/:id/print" element={<AppLayout><OrderPrint /></AppLayout>} />
          
          {/* Rutas de clientes */}
          <Route path="/clients" element={<AppLayout><ClientsList /></AppLayout>} />
          <Route path="/clients/new" element={<AppLayout><OrderForm /></AppLayout>} />
          <Route path="/clients/:id" element={<AppLayout><OrderDetail /></AppLayout>} />
          <Route path="/clients/:id/edit" element={<AppLayout><OrderForm /></AppLayout>} />
          
          {/* Rutas de agenda */}
          <Route path="/schedule" element={<AppLayout><Schedule /></AppLayout>} />
          
          {/* Otras rutas */}
          <Route path="/settings" element={<AppLayout><Dashboard /></AppLayout>} />
          
          {/* Redirección y 404 */}
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
