
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "@/services/api";
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

export default function ClientsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });
  
  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="notion-heading">Clientes</h1>
        <Button className="notion-button" onClick={() => navigate("/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
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

      {isLoading ? (
        <div className="flex justify-center p-8">Cargando clientes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="notion-card overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">{client.name}</h3>
                    <p className="text-sm text-notion-gray">{client.id.split('-')[0].toUpperCase()}</p>
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
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/schedule/new?clientId=${client.id}`)}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Agendar servicio
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => navigate(`/clients/${client.id}`)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm flex items-center">
                    <span className="inline-block w-20 text-notion-gray">Email:</span>
                    <span>{client.email || "No registrado"}</span>
                  </p>
                  <p className="text-sm flex items-center">
                    <span className="inline-block w-20 text-notion-gray">Teléfono:</span>
                    <span>{client.phone || "No registrado"}</span>
                  </p>
                  <p className="text-sm flex items-start">
                    <span className="inline-block w-20 text-notion-gray">Dirección:</span>
                    <span className="flex-1">{client.address || "No registrada"}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-notion-lightgray px-4 py-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-notion-gray">Creado: </span>
                  <span>{new Date(client.created_at).toLocaleDateString()}</span>
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
      )}
      
      {filteredClients.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-notion-gray">
            No se encontraron clientes que coincidan con la búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
