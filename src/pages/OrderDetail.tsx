import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrdersApi, clientsApi, applianceTypesApi, brandsApi, appointmentsApi, techniciansApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { InfoGroup } from "@/components/ui/info-group";
import { CalendarDays, Clock, Edit, FileText, Printer, User, ArrowLeft, Plus, Trash, Save, Check, ChevronsUpDown } from "lucide-react";
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
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: technicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: techniciansApi.getAll,
  });
  
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
      setDiagnosis(order.diagnosis || "");
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
      diagnosis,
      observations,
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
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando información de la orden...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="text-3xl mb-2">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
          <p className="text-muted-foreground mb-4">No se encontró la orden de servicio solicitada</p>
          <Button onClick={() => navigate("/orders")}>
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }
  
  const applianceType = applianceTypes?.find(type => type.id === order.appliance_type);
  const brand = brands?.find(b => b.id === order.brand_id);

  return (
    <div className="container mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={`Orden #${order.order_number}`}
        subtitle={`Creada el ${new Date(order.created_at).toLocaleDateString()}`}
        onBack={() => navigate("/orders")}
      >
        <Link to={`/orders/${id}/edit`}>
          <Button variant="outline" size="sm" className="h-9">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
        <Link to={`/orders/${id}/print`}>
          <Button size="sm" className="h-9">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </Link>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="h-9">
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
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
              <CardTitle className="text-lg">Estado de la orden</CardTitle>
              <CardDescription>Estado actual y opciones de actualización</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <StatusBadge 
                  status={order.status as any} 
                  className="text-sm px-3 py-1 h-auto"
                />
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateStatus("Pendiente")}
                    className="h-9 transition-all"
                  >
                    Marcar pendiente
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdateStatus("En proceso")}
                    className="h-9 transition-all"
                  >
                    Marcar en proceso
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleUpdateStatus("Completado")}
                    className="h-9 transition-all"
                  >
                    Marcar completado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader className="bg-muted/50 pb-3">
              <CardTitle className="text-lg">Servicio programado</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
            {appointment ? (
    <div className="flex flex-col space-y-3">
      <InfoGroup
        label="Fecha"
        value={new Date(appointment.date).toLocaleDateString()}
        icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
      />
      <InfoGroup
        label="Horario"
        value={appointment.time_slot}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      <InfoGroup
        label="Técnico"
        value={technicians?.find(t => t.id === appointment.technician)?.name || "No asignado"}
        icon={<User className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No hay cita programada</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("device")}
                    className="mt-2"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Programar ahora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="details" className="text-sm">Detalles</TabsTrigger>
          <TabsTrigger value="client" className="text-sm">Cliente</TabsTrigger>
          <TabsTrigger value="device" className="text-sm">Electrodoméstico</TabsTrigger>
          <TabsTrigger value="service" className="text-sm">Servicio y Repuestos</TabsTrigger>
          <TabsTrigger value="payment" className="text-sm">Pago y Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Detalles de la Orden</CardTitle>
                <CardDescription>Información general sobre la orden de servicio</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="issue" className="text-sm font-medium">Problema reportado</Label>
                    <Textarea 
                      id="issue" 
                      value={order.problem_description} 
                      readOnly 
                      className="h-32 resize-none bg-muted/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnóstico</Label>
                    <Textarea 
                      id="diagnosis" 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="h-32 resize-none transition-all focus:border-primary"
                      placeholder="Ingrese el diagnóstico del técnico"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations" className="text-sm font-medium">Observaciones</Label>
                  <Textarea 
                    id="observations" 
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="h-32 resize-none transition-all focus:border-primary"
                    placeholder="Agregue observaciones adicionales"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 flex justify-end">
                <Button 
                  onClick={handleSaveChanges}
                  disabled={updateDetailsMutation.isPending}
                  className="transition-all"
                >
                  {updateDetailsMutation.isPending && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  )}
                  {updateDetailsMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="client">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Datos de contacto del cliente</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {client ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <InfoGroup
                          label="Nombre completo"
                          value={client.name}
                        />
                        <InfoGroup
                          label="Teléfono"
                          value={client.phone || ""}
                        />
                      </div>
                      <div className="space-y-4">
                        <InfoGroup
                          label="Correo electrónico"
                          value={client.email || ""}
                        />
                        <InfoGroup
                          label="Dirección"
                          value={client.address || ""}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-4">No se encontró información del cliente</p>
                    <Button variant="outline" onClick={() => navigate("/clients/new")}>
                      Registrar nuevo cliente
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 flex justify-end">
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
          </motion.div>
        </TabsContent>

        <TabsContent value="device">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Información del Electrodoméstico</CardTitle>
                <CardDescription>Detalles técnicos del dispositivo</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InfoGroup
                      label="Tipo de electrodoméstico"
                      value={applianceType?.name || ""}
                    />
                    <InfoGroup
                      label="Modelo"
                      value={order.model || ""}
                    />
                  </div>
                  <div className="space-y-4">
                    <InfoGroup
                      label="Marca"
                      value={brand?.name || ""}
                    />
                    <InfoGroup
                      label="Número de serie"
                      value={order.serial_number || ""}
                    />
                  </div>
                </div>
                
                <div className="mt-8">
    <h3 className="text-lg font-medium mb-4">Programar Servicio</h3>
    <div className="bg-muted/30 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointmentDate" className="text-sm">Fecha</Label>
          <Input 
            id="appointmentDate" 
            type="date" 
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Horario</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                {appointmentTime || "Seleccionar horario"}
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Buscar horario..." />
                <CommandList>
                  <CommandEmpty>No hay horarios</CommandEmpty>
                  <CommandGroup>
                    {timeSlots.map((slot) => (
                      <CommandItem
                        key={slot}
                        value={slot}
                        onSelect={() => setAppointmentTime(slot)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            appointmentTime === slot ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {slot}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Técnico</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                {appointmentTechnician
                  ? technicians?.find(t => t.id === appointmentTechnician)?.name
                  : "Seleccionar técnico"}
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Buscar técnico..." />
                <CommandList>
                  <CommandEmpty>No se encontraron técnicos</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => setAppointmentTechnician("")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !appointmentTechnician ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Sin asignar
                    </CommandItem>
                    {technicians?.map((tech) => (
                      <CommandItem
                        key={tech.id}
                        value={tech.id}
                        onSelect={() => setAppointmentTechnician(tech.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            appointmentTechnician === tech.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tech.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleSaveAppointment}
          disabled={updateAppointmentMutation.isPending}
          size="sm"
        >
          {updateAppointmentMutation.isPending && (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
          )}
          <CalendarDays className={`mr-2 h-4 w-4 ${updateAppointmentMutation.isPending ? 'hidden' : ''}`} />
          {appointment ? "Actualizar cita" : "Programar cita"}
        </Button>
      </div>
    </div>
  </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="service">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Servicio y Repuestos</CardTitle>
                <CardDescription>Trabajo realizado y materiales utilizados</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Mano de obra</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 bg-muted/30 p-3 rounded-md">
                    <div className="md:col-span-2">
                      <Input 
                        placeholder="Descripción del trabajo" 
                        value={newLabor.description}
                        onChange={(e) => setNewLabor({...newLabor, description: e.target.value})}
                        className="transition-all"
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
                        className="transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Tarifa $" 
                        min="1"
                        value={newLabor.rate}
                        onChange={(e) => setNewLabor({...newLabor, rate: parseFloat(e.target.value)})}
                        className="transition-all"
                      />
                      <Button size="icon" onClick={handleAddLabor} className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Descripción</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Horas</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Tarifa</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Subtotal</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground w-16">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {labor?.map((item) => (
                          <tr key={item.id} className="bg-card">
                            <td className="px-4 py-2 text-sm">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.hours}</td>
                            <td className="px-4 py-2 text-sm text-right">${item.rate.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right">${(item.hours * item.rate).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteLaborMutation.mutate(item.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!labor || labor.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-center text-sm text-muted-foreground">
                              No hay registros de mano de obra
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/50">
                          <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium">Total Mano de Obra:</td>
                          <td className="px-4 py-2 text-right text-sm font-medium">${laborTotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Repuestos utilizados</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 bg-muted/30 p-3 rounded-md">
                    <div className="md:col-span-2">
                      <Input 
                        placeholder="Descripción del repuesto" 
                        value={newPart.description}
                        onChange={(e) => setNewPart({...newPart, description: e.target.value})}
                        className="transition-all"
                      />
                    </div>
                    <div>
                      <Input 
                        type="number" 
                        placeholder="Cantidad" 
                        min="1"
                        value={newPart.quantity}
                        onChange={(e) => setNewPart({...newPart, quantity: parseInt(e.target.value)})}
                        className="transition-all"
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
                        className="transition-all"
                      />
                      <Button size="icon" onClick={handleAddPart} className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Repuesto</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Precio unitario</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Subtotal</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground w-16">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parts?.map((part) => (
                          <tr key={part.id} className="bg-card">
                            <td className="px-4 py-2 text-sm">{part.description}</td>
                            <td className="px-4 py-2 text-sm text-right">{part.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">${part.unit_price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right">${(part.quantity * part.unit_price).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deletePartMutation.mutate(part.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!parts || parts.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-center text-sm text-muted-foreground">
                              No hay repuestos registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/50">
                          <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium">Total Repuestos:</td>
                          <td className="px-4 py-2 text-right text-sm font-medium">${partsTotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="payment">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Pago y Facturación</CardTitle>
                <CardDescription>Detalle del cobro por el servicio</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="bg-card p-5 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Resumen</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Mano de obra:</span>
                      <span className="font-medium">${laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Repuestos:</span>
                      <span className="font-medium">${partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">IVA (16%):</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px w-full bg-border my-2"></div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-medium text-lg">Total:</span>
                      <span className="font-bold text-lg">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-sm">Método de pago</Label>
                    <Select defaultValue="Efectivo">
                      <SelectTrigger className="w-full transition-all">
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
                    <Label htmlFor="paymentStatus" className="text-sm">Estado del pago</Label>
                    <Select defaultValue="Pendiente">
                      <SelectTrigger className="w-full transition-all">
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
                  <Label htmlFor="invoiceNotes" className="text-sm">Notas para facturación</Label>
                  <Textarea 
                    id="invoiceNotes" 
                    placeholder="Ingrese información adicional para la factura" 
                    className="h-24 resize-none transition-all"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 flex justify-between flex-wrap gap-2">
                <Button variant="outline">Generar factura</Button>
                <Button>Guardar cambios</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}