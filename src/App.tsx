
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rutas de órdenes de servicio */}
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/orders/:id/print" element={<OrderPrint />} />
          
          {/* Rutas de clientes */}
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/new" element={<OrderForm />} />
          <Route path="/clients/:id" element={<OrderDetail />} />
          <Route path="/clients/:id/edit" element={<OrderForm />} />
          
          {/* Rutas de agenda */}
          <Route path="/schedule" element={<Schedule />} />
          
          {/* Otras rutas */}
          <Route path="/settings" element={<Dashboard />} />
          
          {/* Redirección y 404 */}
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
