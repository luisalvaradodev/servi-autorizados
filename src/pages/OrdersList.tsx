
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { serviceOrdersApi, clientsApi, applianceTypesApi, brandsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      getApplianceName(order.appliance_type, order.brand_id).toLowerCase().includes(searchTerm.toLowerCase());

    // Aplicar filtro de estado
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="notion-heading">Órdenes de Servicio</h1>
        <Button className="notion-button" onClick={() => navigate("/orders/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-notion-gray" />
          <Input
            type="search"
            placeholder="Buscar por número, cliente o electrodoméstico..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
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

      <div className="bg-white border border-notion-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingOrders ? (
            <div className="text-center py-8">Cargando órdenes de servicio...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-notion-lightgray">
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Nº Orden
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Electrodoméstico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Problema
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-notion-gray">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-notion-lightgray transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-sm">{getClientName(order.client_id)}</td>
                    <td className="px-4 py-3 text-sm">{getApplianceName(order.appliance_type, order.brand_id)}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.problem_description.length > 50
                        ? `${order.problem_description.substring(0, 50)}...`
                        : order.problem_description}
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === "Completado"
                            ? "bg-green-100 text-green-800"
                            : order.status === "En proceso"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/print`)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => navigate(`/orders/${order.id}`)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoadingOrders && filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-notion-gray">
                No se encontraron órdenes que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
