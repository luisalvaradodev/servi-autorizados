
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Search, Plus, FileText, Edit, Trash, MoreHorizontal, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

// Datos de ejemplo para los clientes
const clients = [
  {
    id: "CL-001",
    name: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
    phone: "555-123-4567",
    address: "Calle Principal 123, Col. Centro",
    totalOrders: 3,
    lastService: "15/04/2023",
  },
  {
    id: "CL-002",
    name: "María Rodríguez",
    email: "maria.rodriguez@ejemplo.com",
    phone: "555-234-5678",
    address: "Av. Reforma 456, Col. Juárez",
    totalOrders: 1,
    lastService: "20/05/2023",
  },
  {
    id: "CL-003",
    name: "Carlos López",
    email: "carlos.lopez@ejemplo.com",
    phone: "555-345-6789",
    address: "Blvd. Insurgentes 789, Col. Roma",
    totalOrders: 5,
    lastService: "05/03/2023",
  },
  {
    id: "CL-004",
    name: "Ana García",
    email: "ana.garcia@ejemplo.com",
    phone: "555-456-7890",
    address: "Calle Durango 234, Col. Condesa",
    totalOrders: 2,
    lastService: "12/05/2023",
  },
  {
    id: "CL-005",
    name: "Roberto Díaz",
    email: "roberto.diaz@ejemplo.com",
    phone: "555-567-8901",
    address: "Av. Chapultepec 567, Col. Nápoles",
    totalOrders: 4,
    lastService: "28/02/2023",
  },
];

export default function ClientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="notion-heading">Clientes</h1>
          <Button className="notion-button">
            <Plus className="mr-2 h-4 w-4" />
            <Link to="/clients/new">Nuevo Cliente</Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-notion-gray" />
          <Input
            type="search"
            placeholder="Buscar por nombre, correo o teléfono..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="notion-card overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">{client.name}</h3>
                    <p className="text-sm text-notion-gray">{client.id}</p>
                  </div>
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
                        <Link to={`/clients/${client.id}`} className="flex items-center w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to={`/clients/${client.id}/edit`} className="flex items-center w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to={`/schedule/new?clientId=${client.id}`} className="flex items-center w-full">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Agendar servicio
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm flex items-center">
                    <span className="inline-block w-20 text-notion-gray">Email:</span>
                    <span>{client.email}</span>
                  </p>
                  <p className="text-sm flex items-center">
                    <span className="inline-block w-20 text-notion-gray">Teléfono:</span>
                    <span>{client.phone}</span>
                  </p>
                  <p className="text-sm flex items-start">
                    <span className="inline-block w-20 text-notion-gray">Dirección:</span>
                    <span className="flex-1">{client.address}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-notion-lightgray px-4 py-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-notion-gray">Servicios: </span>
                  <span className="font-medium">{client.totalOrders}</span>
                </div>
                <div className="text-sm">
                  <span className="text-notion-gray">Último: </span>
                  <span>{client.lastService}</span>
                </div>
                <Link 
                  to={`/orders/new?clientId=${client.id}`}
                  className="text-sm text-notion-blue hover:underline"
                >
                  Nueva orden
                </Link>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-notion-gray">
              No se encontraron clientes que coincidan con la búsqueda.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
