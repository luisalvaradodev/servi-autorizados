
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
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
import { Link } from "react-router-dom";

// Datos de ejemplo para las órdenes
const orders = [
  {
    id: "OS-2023-050",
    client: "Ricardo Martínez",
    appliance: "Refrigerador LG",
    problem: "No enfría correctamente",
    date: "20/05/2023",
    status: "Pendiente",
  },
  {
    id: "OS-2023-049",
    client: "Laura Gutiérrez",
    appliance: "Lavadora Maytag",
    problem: "Ruido fuerte al centrifugar",
    date: "19/05/2023",
    status: "En proceso",
  },
  {
    id: "OS-2023-048",
    client: "Miguel Sánchez",
    appliance: "Horno Teka",
    problem: "No enciende",
    date: "18/05/2023",
    status: "Completado",
  },
  {
    id: "OS-2023-047",
    client: "Patricia Flores",
    appliance: "Lavavajillas Bosch",
    problem: "Fuga de agua",
    date: "17/05/2023",
    status: "En proceso",
  },
  {
    id: "OS-2023-046",
    client: "Roberto Díaz",
    appliance: "Estufa Mabe",
    problem: "Quemador no enciende",
    date: "16/05/2023",
    status: "Completado",
  },
  {
    id: "OS-2023-045",
    client: "Carmen Vega",
    appliance: "Microondas Samsung",
    problem: "No calienta",
    date: "15/05/2023",
    status: "Pendiente",
  },
];

export default function OrdersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    // Aplicar filtro de búsqueda
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.appliance.toLowerCase().includes(searchTerm.toLowerCase());

    // Aplicar filtro de estado
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="notion-heading">Órdenes de Servicio</h1>
          <Button className="notion-button">
            <Plus className="mr-2 h-4 w-4" />
            <Link to="/orders/new">Nueva Orden</Link>
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
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.client}</td>
                    <td className="px-4 py-3 text-sm">{order.appliance}</td>
                    <td className="px-4 py-3 text-sm">{order.problem}</td>
                    <td className="px-4 py-3 text-sm">{order.date}</td>
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
                          <DropdownMenuItem>
                            <Link to={`/orders/${order.id}`} className="flex items-center w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              Ver detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/orders/${order.id}/edit`} className="flex items-center w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/orders/${order.id}/print`} className="flex items-center w-full">
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-notion-gray">
                No se encontraron órdenes que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
