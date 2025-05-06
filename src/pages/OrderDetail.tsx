
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrdersApi, clientsApi, applianceTypesApi, brandsApi, appointmentsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Edit, FileText, Printer, User, ArrowLeft, Plus, Trash, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states for editable fields
  const [diagnosis, setDiagnosis] = useState("");
  const [observations, setObservations] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentTechnician, setAppointmentTechnician] = useState("");
  
  // New part/labor form states
  const [newPart, setNewPart] = useState({ description: "", quantity: 1, unit_price: 0 });
  const [newLabor, setNewLabor] = useState({ description: "", hours: 1, rate: 50 });
  
  // Fetch order data
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => serviceOrdersApi.getById(id!),
    enabled: !!id,
  });
  
  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ["client", order?.client_id],
    queryFn: () => clientsApi.getById(order!.client_id),
    enabled: !!order?.client_id,
  });
  
  // Fetch appliance type
  const { data: applianceTypes } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });
  
  // Fetch brand
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });
  
  // Fetch service parts
  const { data: parts, refetch: refetchParts } = useQuery({
    queryKey: ["parts", id],
    queryFn: () => serviceOrdersApi.getServiceParts(id!),
    enabled: !!id,
  });
  
  // Fetch service labor
  const { data: labor, refetch: refetchLabor } = useQuery({
    queryKey: ["labor", id],
    queryFn: () => serviceOrdersApi.getServiceLabor(id!),
    enabled: !!id,
  });
  
  // Fetch appointment
  const { data: appointment, refetch: refetchAppointment } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentsApi.getByOrderId(id!),
    enabled: !!id,
  });
  
  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => serviceOrdersApi.update(id!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast({
        title: "Estado actualizado",
        description: "La orden ha sido actualizada correctamente",
      });
    },
  });
  
  // Update order details mutation
  const updateDetailsMutation = useMutation({
    mutationFn: (data: any) => serviceOrdersApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast({
        title: "Cambios guardados",
        description: "Los detalles han sido actualizados correctamente",
      });
    },
  });
  
  // Add part mutation
  const addPartMutation = useMutation({
    mutationFn: (part: any) => serviceOrdersApi.addServicePart({ ...part, order_id: id! }),
    onSuccess: () => {
      refetchParts();
      setNewPart({ description: "", quantity: 1, unit_price: 0 });
      toast({
        title: "Repuesto agregado",
        description: "El repuesto ha sido agregado correctamente",
      });
    },
  });
  
  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: (partId: string) => serviceOrdersApi.deleteServicePart(partId),
    onSuccess: () => {
      refetchParts();
      toast({
        title: "Repuesto eliminado",
        description: "El repuesto ha sido eliminado correctamente",
      });
    },
  });
  
  // Add labor mutation
  const addLaborMutation = useMutation({
    mutationFn: (labor: any) => serviceOrdersApi.addServiceLabor({ ...labor, order_id: id! }),
    onSuccess: () => {
      refetchLabor();
      setNewLabor({ description: "", hours: 1, rate: 50 });
      toast({
        title: "Mano de obra agregada",
        description: "El registro de mano de obra ha sido agregado correctamente",
      });
    },
  });
  
  // Delete labor mutation
  const deleteLaborMutation = useMutation({
    mutationFn: (laborId: string) => serviceOrdersApi.deleteServiceLabor(laborId),
    onSuccess: () => {
      refetchLabor();
      toast({
        title: "Mano de obra eliminada",
        description: "El registro de mano de obra ha sido eliminado correctamente",
      });
    },
  });
  
  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: () => serviceOrdersApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate("/orders");
      toast({
        title: "Orden eliminada",
        description: "La orden de servicio ha sido eliminada correctamente",
      });
    },
  });
  
  // Update appointment
  const updateAppointmentMutation = useMutation({
    mutationFn: (data: any) => {
      if (appointment) {
        return appointmentsApi.update(appointment.id, data);
      } else {
        return appointmentsApi.create({ ...data, order_id: id! });
      }
    },
    onSuccess: () => {
      refetchAppointment();
      toast({
        title: "Cita actualizada",
        description: "La cita ha sido actualizada correctamente",
      });
    },
  });
  
  // Set initial values
  useEffect(() => {
    if (order) {
      setDiagnosis(order.observations || "");
      setObservations(order.observations || "");
    }
    
    if (appointment) {
      setAppointmentDate(appointment.date || "");
      setAppointmentTime(appointment.time_slot || "");
      setAppointmentTechnician(appointment.technician || "");
    }
  }, [order, appointment]);
  
  const handleUpdateStatus = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };
  
  const handleSaveChanges = () => {
    updateDetailsMutation.mutate({
      observations: observations,
    });
  };
  
  const handleSaveAppointment = () => {
    if (!appointmentDate || !appointmentTime) {
      toast({
        title: "Error",
        description: "Por favor complete la fecha y hora de la cita",
        variant: "destructive",
      });
      return;
    }
    
    updateAppointmentMutation.mutate({
      date: appointmentDate,
      time_slot: appointmentTime,
      technician: appointmentTechnician,
    });
  };
  
  const handleAddPart = () => {
    if (!newPart.description || newPart.quantity <= 0 || newPart.unit_price <= 0) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }
    
    addPartMutation.mutate(newPart);
  };
  
  const handleAddLabor = () => {
    if (!newLabor.description || newLabor.hours <= 0 || newLabor.rate <= 0) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }
    
    addLaborMutation.mutate(newLabor);
  };
  
  const handleDeleteOrder = () => {
    setIsDeleteDialogOpen(false);
    deleteOrderMutation.mutate();
  };
  
  // Calculate totals
  const laborTotal = labor?.reduce((sum, item) => sum + (item.hours * item.rate), 0) || 0;
  const partsTotal = parts?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  const subtotal = laborTotal + partsTotal;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  
  if (isLoadingOrder || (order && isLoadingClient)) {
    return <div className="flex justify-center p-8">Cargando información de la orden...</div>;
  }
  
  if (!order) {
    return <div className="flex justify-center p-8">No se encontró la orden de servicio</div>;
  }
  
  const applianceType = applianceTypes?.find(type => type.id === order.appliance_type);
  const brand = brands?.find(b => b.id === order.brand_id);

  return (
    <div className="container mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orden de servicio #{order.order_number}</h1>
            <p className="text-muted-foreground">Creada el {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/orders/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link to={`/orders/${id}/print`}>
            <Button>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </Link>
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
                  Esta acción no se puede deshacer. Se eliminará permanentemente esta
                  orden de servicio y todos los datos relacionados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex gap-6 mb-6">
        <Card className="w-2/3">
          <CardHeader className="pb-2">
            <CardTitle>Estado de la orden</CardTitle>
            <CardDescription>Estado actual y opciones de actualización</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={
                order.status === "Completado" ? "outline" :
                order.status === "En proceso" ? "default" :
                "secondary"
              }>
                {order.status}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdateStatus("Pendiente")}>Marcar pendiente</Button>
                <Button variant="outline" onClick={() => handleUpdateStatus("En proceso")}>Marcar en proceso</Button>
                <Button variant="default" onClick={() => handleUpdateStatus("Completado")}>Marcar como completada</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Servicio programado</CardTitle>
          </CardHeader>
          <CardContent>
            {appointment ? (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{appointment.time_slot}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Técnico: {appointment.technician || "No asignado"}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                No hay cita programada para esta orden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="client">Cliente</TabsTrigger>
          <TabsTrigger value="device">Electrodoméstico</TabsTrigger>
          <TabsTrigger value="service">Servicio y Repuestos</TabsTrigger>
          <TabsTrigger value="payment">Pago y Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Orden</CardTitle>
              <CardDescription>Información general sobre la orden de servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue">Problema reportado</Label>
                  <Textarea 
                    id="issue" 
                    value={order.problem_description} 
                    readOnly 
                    className="h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Textarea 
                    id="diagnosis" 
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="h-24"
                    placeholder="Ingrese el diagnóstico del técnico"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea 
                  id="observations" 
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="h-24"
                  placeholder="Agregue observaciones adicionales"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>Datos de contacto del cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {client ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nombre</Label>
                      <Input id="clientName" value={client.name} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Teléfono</Label>
                      <Input id="clientPhone" value={client.phone || ""} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Correo electrónico</Label>
                    <Input id="clientEmail" value={client.email || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Dirección</Label>
                    <Textarea id="clientAddress" value={client.address || ""} readOnly />
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No se encontró información del cliente
                </div>
              )}
            </CardContent>
            <CardFooter>
              {client && (
                <Link to={`/clients/${client.id}`}>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver perfil completo
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="device" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Electrodoméstico</CardTitle>
              <CardDescription>Detalles técnicos del dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Tipo</Label>
                  <Input id="deviceType" value={applianceType?.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceBrand">Marca</Label>
                  <Input id="deviceBrand" value={brand?.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceModel">Modelo</Label>
                  <Input id="deviceModel" value={order.model || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceSerial">Número de serie</Label>
                  <Input id="deviceSerial" value={order.serial_number || ""} readOnly />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Programar Servicio</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Fecha</Label>
                    <Input 
                      id="appointmentDate" 
                      type="date" 
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Hora</Label>
                    <Input 
                      id="appointmentTime" 
                      type="text" 
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      placeholder="Ej: 9:00 - 12:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTechnician">Técnico asignado</Label>
                    <Input 
                      id="appointmentTechnician" 
                      value={appointmentTechnician}
                      onChange={(e) => setAppointmentTechnician(e.target.value)}
                      placeholder="Nombre del técnico"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleSaveAppointment}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {appointment ? "Actualizar cita" : "Programar cita"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Servicio y Repuestos</CardTitle>
              <CardDescription>Trabajo realizado y materiales utilizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Mano de obra</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <Input 
                      placeholder="Descripción del trabajo" 
                      value={newLabor.description}
                      onChange={(e) => setNewLabor({...newLabor, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Input 
                      type="number" 
                      placeholder="Horas" 
                      min="0.5" 
                      step="0.5"
                      value={newLabor.hours}
                      onChange={(e) => setNewLabor({...newLabor, hours: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Tarifa $" 
                      min="1"
                      value={newLabor.rate}
                      onChange={(e) => setNewLabor({...newLabor, rate: parseFloat(e.target.value)})}
                    />
                    <Button size="icon" onClick={handleAddLabor}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-sm">
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-right">Horas</th>
                      <th className="p-2 text-right">Tarifa</th>
                      <th className="p-2 text-right">Subtotal</th>
                      <th className="p-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labor?.map((item) => (
                      <tr key={item.id} className="border-b border-muted">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{item.hours}</td>
                        <td className="p-2 text-right">${item.rate.toFixed(2)}</td>
                        <td className="p-2 text-right">${(item.hours * item.rate).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteLaborMutation.mutate(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!labor || labor.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-muted-foreground">
                          No hay registros de mano de obra
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-medium">Total Mano de Obra:</td>
                      <td className="p-2 text-right font-medium">${laborTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Repuestos utilizados</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <Input 
                      placeholder="Descripción del repuesto" 
                      value={newPart.description}
                      onChange={(e) => setNewPart({...newPart, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Input 
                      type="number" 
                      placeholder="Cantidad" 
                      min="1"
                      value={newPart.quantity}
                      onChange={(e) => setNewPart({...newPart, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Precio $" 
                      min="0.01"
                      step="0.01"
                      value={newPart.unit_price}
                      onChange={(e) => setNewPart({...newPart, unit_price: parseFloat(e.target.value)})}
                    />
                    <Button size="icon" onClick={handleAddPart}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-sm">
                      <th className="p-2 text-left">Repuesto</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-right">Precio unitario</th>
                      <th className="p-2 text-right">Subtotal</th>
                      <th className="p-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts?.map((part) => (
                      <tr key={part.id} className="border-b border-muted">
                        <td className="p-2">{part.description}</td>
                        <td className="p-2 text-right">{part.quantity}</td>
                        <td className="p-2 text-right">${part.unit_price.toFixed(2)}</td>
                        <td className="p-2 text-right">${(part.quantity * part.unit_price).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deletePartMutation.mutate(part.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!parts || parts.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-muted-foreground">
                          No hay repuestos registrados
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-medium">Total Repuestos:</td>
                      <td className="p-2 text-right font-medium">${partsTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pago y Facturación</CardTitle>
              <CardDescription>Detalle del cobro por el servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Resumen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mano de obra:</span>
                    <span>${laborTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repuestos:</span>
                    <span>${partsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de pago</Label>
                  <Select defaultValue="Efectivo">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta de crédito">Tarjeta de crédito</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Estado del pago</Label>
                  <Select defaultValue="Pendiente">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceNotes">Notas para facturación</Label>
                <Textarea id="invoiceNotes" placeholder="Ingrese información adicional para la factura" className="h-24" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Generar factura</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
