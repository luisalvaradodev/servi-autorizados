import { useState, useEffect } from "react";
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
import { Search, Plus, FileText, Edit, Trash, MoreHorizontal, CalendarDays, Phone, Mail, MapPin, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ClientsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  // Fetch clients
  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });

  // Delete client function
  const handleDeleteClient = async (id: string, name: string) => {
    try {
      await clientsApi.delete(id);
      toast({
        title: "Cliente eliminado",
        description: `${name} ha sido eliminado correctamente`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setClientToDelete(null);
    }
  };

  const confirmDelete = (client: any) => {
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => navigate("/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Buscar por nombre, correo o teléfono..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Cargando clientes...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="overflow-hidden hover-card transition-all border bg-card"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-1">{client.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Cliente desde {format(new Date(client.created_at), "MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
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
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => confirmDelete(client)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{client.phone || "Teléfono no registrado"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{client.email || "Email no registrado"}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address || "Dirección no registrada"}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-muted/40 flex justify-between items-center border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="gap-1 hover:text-primary h-8"
                >
                  <FileText className="h-4 w-4" />
                  <span>Detalles</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/orders/new?clientId=${client.id}`)}
                  className="gap-1 h-8"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva orden</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredClients.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-lg border border-dashed">
          <UserRound className="h-12 w-12 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-medium">No se encontraron clientes</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {searchTerm 
              ? `No hay resultados para "${searchTerm}". Intenta con otro término de búsqueda.` 
              : "No hay clientes registrados en el sistema. ¡Crea tu primer cliente!"}
          </p>
          <Button 
            onClick={() => navigate("/clients/new")}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente
              <span className="font-semibold"> {clientToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteClient(clientToDelete?.id, clientToDelete?.name)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}