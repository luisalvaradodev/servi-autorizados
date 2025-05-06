import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { serviceOrdersApi, clientsApi, applianceTypesApi, brandsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeader } from "@/components/ui/section-header";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, MoreHorizontal, FileText, Printer, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function OrdersList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: serviceOrdersApi.getAll,
  });
  
  // Fetch clients for display names
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });
  
  // Fetch appliance types for display names
  const { data: applianceTypes } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });
  
  // Fetch brands for display names
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });
  
  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.name : "Cliente";
  };
  
  const getApplianceName = (applianceId: string, brandId: string) => {
    const appliance = applianceTypes?.find(a => a.id === applianceId);
    const brand = brands?.find(b => b.id === brandId);
    return `${brand?.name || ""} ${appliance?.name || ""}`.trim() || "Electrodoméstico";
  };

  const filteredOrders = orders?.filter((order) => {
    // Aplicar filtro de búsqueda
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(order.client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getApplianceName(order.appliance_type, order.brand_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.problem_description && order.problem_description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Aplicar filtro de estado
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];
  
  const columns = [
    {
      header: "Nº Orden",
      accessorKey: "order_number",
      cell: (item: any) => (
        <span className="font-medium">{item.order_number}</span>
      ),
    },
    {
      header: "Cliente",
      cell: (item: any) => getClientName(item.client_id),
    },
    {
      header: "Electrodoméstico",
      cell: (item: any) => getApplianceName(item.appliance_type, item.brand_id),
    },
    {
      header: "Problema",
      cell: (item: any) => (
        <span className="line-clamp-1">{item.problem_description}</span>
      ),
    },
    {
      header: "Fecha",
      cell: (item: any) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      header: "Estado",
      cell: (item: any) => (
        <StatusBadge 
          status={item.status as any} 
          className="text-xs"
        />
      ),
    },
    {
      header: "Acciones",
      cell: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/orders/${item.id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/orders/${item.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/orders/${item.id}/print`)}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => navigate(`/orders/${item.id}`)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Órdenes de Servicio">
        <Button onClick={() => navigate("/orders/new")} className="h-9 gap-1">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </SectionHeader>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número, cliente o electrodoméstico..."
            className="pl-9 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full transition-all">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En proceso">En proceso</SelectItem>
              <SelectItem value="Completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoadingOrders}
          noDataMessage="No se encontraron órdenes que coincidan con la búsqueda."
          keyExtractor={(item) => item.id}
          className="shadow-sm border-border"
        />
      </motion.div>
    </div>
  );
}