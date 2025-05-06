
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
import { ArrowLeft, Edit, Trash, ClipboardList, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
    return <div className="flex justify-center p-8">Cargando información del cliente...</div>;
  }

  if (!client) {
    return <div className="flex justify-center p-8">No se encontró el cliente</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/clients")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="notion-heading">Detalles del Cliente</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
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
                  Esta acción no se puede deshacer. Se eliminará permanentemente el
                  cliente y todos sus datos relacionados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>Datos personales y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
                  <p className="text-lg">{client.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID Cliente</h3>
                  <p className="text-base">{client.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contacto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p>{client.phone || "No registrado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{client.email || "No registrado"}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dirección</h3>
                <p className="mt-1">{client.address || "No registrada"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fecha de registro</h3>
                <p className="mt-1">
                  {format(new Date(client.created_at), "PPP", { locale: es })}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate(`/orders/new?clientId=${client.id}`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Órdenes de Servicio</CardTitle>
                <span className="text-xl font-bold">
                  {isLoadingOrders ? "..." : clientOrders?.length || 0}
                </span>
              </div>
              <CardDescription>Historial de servicios</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="text-center py-4">Cargando órdenes...</div>
              ) : clientOrders && clientOrders.length > 0 ? (
                <div className="space-y-4">
                  {clientOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex gap-2">
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
                        <Link to={`/orders/${order.id}`}>
                          <Button size="sm" variant="ghost">Ver</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay órdenes registradas para este cliente
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/orders", { state: { clientFilter: client.id } })}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Ver todas las órdenes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
