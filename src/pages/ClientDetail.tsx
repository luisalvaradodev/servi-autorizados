import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, serviceOrdersApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash, ClipboardList, Calendar, Plus, Phone, Mail, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch client details
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch client's orders
  const { data: clientOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["clientOrders", id],
    queryFn: async () => {
      const allOrders = await serviceOrdersApi.getAll();
      return allOrders.filter(order => order.client_id === id);
    },
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigate("/clients");
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate();
  };

  if (isLoadingClient) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="rounded-full bg-destructive/10 p-3">
          <Trash className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Cliente no encontrado</h2>
        <p className="mt-2 text-muted-foreground">El cliente solicitado no existe o ha sido eliminado</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista de clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/clients")}
            className="h-9 w-9 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalles del Cliente</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/clients/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el cliente 
                  <span className="font-semibold"> {client.name} </span>
                  y todos sus datos relacionados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="hover-card">
            <CardHeader className="pb-3">
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>Datos personales y de contacto</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-2xl font-bold">{client.name.charAt(0)}</span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{client.name}</h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Badge variant="outline" className="mr-2">
                      Cliente #{id.split('-')[0].toUpperCase()}
                    </Badge>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      Cliente desde {format(new Date(client.created_at), "MMM yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Información de contacto</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{client.phone || "No registrado"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{client.email || "No registrado"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Ubicación</h3>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium">{client.address || "No registrada"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-6 flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => navigate(`/orders/new?clientId=${client.id}`)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Orden
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Crear una nueva orden de servicio para este cliente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => navigate(`/schedule/new?clientId=${client.id}`)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Visita
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Programar una visita técnica para este cliente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="hover-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Órdenes de Servicio</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {isLoadingOrders ? "..." : clientOrders?.length || 0}
                </Badge>
              </div>
              <CardDescription>Historial de servicios</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoadingOrders ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : clientOrders && clientOrders.length > 0 ? (
                <div className="space-y-3">
                  {clientOrders.slice(0, 5).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div 
                          className={`
                            status-badge
                            ${order.status === "Completado" ? "status-badge-completed" : 
                              order.status === "En proceso" ? "status-badge-in-progress" : 
                              "status-badge-pending"}
                          `}
                        >
                          {order.status}
                        </div>
                        <Link to={`/orders/${order.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">Sin órdenes</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No hay órdenes registradas para este cliente
                  </p>
                  <Button 
                    onClick={() => navigate(`/orders/new?clientId=${client.id}`)}
                    className="mt-4"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear orden
                  </Button>
                </div>
              )}
            </CardContent>
            
            {clientOrders && clientOrders.length > 0 && (
              <CardFooter className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/orders", { state: { clientFilter: client.id } })}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Ver todas las órdenes
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}