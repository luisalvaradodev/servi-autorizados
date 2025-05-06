
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, serviceOrdersApi, clientsApi, techniciansApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Plus, 
  Clock, 
  Wrench, 
  UserRound, 
  ArrowLeft, 
  ArrowRight,
  CalendarDays,
  Trash,
} from "lucide-react";
import { Appointment, ServiceOrder, Client, Technician } from "@/types";

// Time slots disponibles
const timeSlots = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
];

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().split('T')[0],
    time_slot: "",
    order_id: "",
    technician: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentsApi.getAll,
  });

  // Fetch service orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: serviceOrdersApi.getAll,
  });

  // Fetch clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });

  // Fetch technicians
  const { data: technicians = [], isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: techniciansApi.getAll,
  });

  // Filter out technicians that are not active
  const activeTechnicians = technicians.filter(tech => tech.is_active);

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowNewAppointmentDialog(false);
      resetNewAppointmentForm();
      toast({
        title: "Cita programada",
        description: "La cita ha sido programada correctamente",
      });
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowDeleteDialog(false);
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada correctamente",
      });
    },
  });

  // Reset new appointment form
  const resetNewAppointmentForm = () => {
    setNewAppointment({
      date: new Date().toISOString().split('T')[0],
      time_slot: "",
      order_id: "",
      technician: "",
    });
  };
  
  // Filtrar citas para la fecha seleccionada
  const filteredAppointments = appointments.filter((apt) => {
    if (!date) return false;
    return isSameDay(parseISO(apt.date), date);
  });
  
  // Handle the create appointment action
  const handleCreateAppointment = () => {
    if (!newAppointment.order_id || !newAppointment.time_slot) {
      toast({
        title: "Error",
        description: "La orden de servicio y el horario son obligatorios",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      order_id: newAppointment.order_id,
      date: newAppointment.date,
      time_slot: newAppointment.time_slot,
      technician: newAppointment.technician || null,
    });
  };

  // Find client from order
  const getClientFromOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    return clients.find(c => c.id === order.client_id);
  };

  // Get order details
  const getOrderDetails = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  // Handle delete appointment
  const handleDeleteAppointment = () => {
    if (appointmentToDelete) {
      deleteAppointmentMutation.mutate(appointmentToDelete.id);
    }
  };

  // Confirm delete appointment
  const confirmDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="notion-heading">Agenda de Servicios</h1>
        <Button className="notion-button" onClick={() => setShowNewAppointmentDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="day">Día</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(date || new Date());
                newDate.setDate(newDate.getDate() - (view === "day" ? 1 : 7));
                setDate(newDate);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setDate(new Date())}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(date || new Date());
                newDate.setDate(newDate.getDate() + (view === "day" ? 1 : 7));
                setDate(newDate);
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>
                Selecciona una fecha para ver las citas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                className="rounded-md border"
              />
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Técnicos Disponibles</h3>
                <div className="space-y-2">
                  {isLoadingTechnicians ? (
                    <div className="text-center py-2">Cargando técnicos...</div>
                  ) : activeTechnicians.length === 0 ? (
                    <div className="text-center py-2 text-muted-foreground">No hay técnicos registrados.</div>
                  ) : (
                    activeTechnicians.map((tech) => (
                      <div
                        key={tech.id}
                        className="flex items-center justify-between p-2 rounded-md border border-notion-border"
                      >
                        <div>
                          <p className="text-sm font-medium">{tech.name}</p>
                          <p className="text-xs text-notion-gray">{tech.specialty}</p>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full bg-green-500"
                        ></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : "Sin fecha seleccionada"}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length} citas programadas para este día
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="text-center py-12">Cargando citas...</div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((apt) => {
                    const client = getClientFromOrder(apt.order_id);
                    const order = getOrderDetails(apt.order_id);
                    
                    return (
                      <div
                        key={apt.id}
                        className="p-4 border border-notion-border rounded-md hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-notion-blue" />
                            <span className="font-medium">{apt.time_slot}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => confirmDeleteAppointment(apt)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm flex items-center">
                              <UserRound className="h-4 w-4 mr-2 text-notion-gray" />
                              <span>
                                <span className="font-medium">{client?.name || "Cliente no encontrado"}</span> 
                                <span className="text-notion-gray ml-1">({client?.phone || "N/A"})</span>
                              </span>
                            </p>
                            <p className="text-sm flex items-center">
                              <Wrench className="h-4 w-4 mr-2 text-notion-gray" />
                              <span>{order?.problem_description || "Descripción no disponible"}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm flex items-center">
                              <CalendarDays className="h-4 w-4 mr-2 text-notion-gray" />
                              <span className="text-notion-gray">Orden:</span>
                              <span className="ml-1 font-medium">{order?.order_number || "N/A"}</span>
                            </p>
                            <p className="text-sm flex items-center">
                              <UserRound className="h-4 w-4 mr-2 text-notion-gray" />
                              <span className="text-notion-gray">Técnico:</span>
                              <span className="ml-1">{apt.technician || "No asignado"}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-notion-gray opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No hay citas programadas</h3>
                  <p className="mt-1 text-notion-gray">
                    Programa una nueva cita para este día haciendo clic en "Nueva Cita"
                  </p>
                  <Button 
                    className="mt-4 notion-button"
                    onClick={() => setShowNewAppointmentDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Cita
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Dialog para crear nueva cita */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Programar nueva cita</DialogTitle>
            <DialogDescription>
              Rellena los detalles para programar una nueva cita de servicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Fecha de la cita</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => {
                    setNewAppointment({
                      ...newAppointment,
                      date: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Horario</Label>
                <Select
                  value={newAppointment.time_slot}
                  onValueChange={(value) => setNewAppointment({
                    ...newAppointment,
                    time_slot: value,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orderId">Orden de servicio</Label>
              <Select
                value={newAppointment.order_id}
                onValueChange={(value) => setNewAppointment({
                  ...newAppointment,
                  order_id: value,
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar orden" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => {
                    const client = clients.find(c => c.id === order.client_id);
                    return (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {client?.name || "Cliente no encontrado"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="technicianId">Técnico</Label>
              <Select
                value={newAppointment.technician}
                onValueChange={(value) => setNewAppointment({
                  ...newAppointment,
                  technician: value,
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {activeTechnicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.name}>
                      {tech.name} - {tech.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewAppointmentDialog(false);
                resetNewAppointmentForm();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAppointment}
              disabled={createAppointmentMutation.isPending}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {createAppointmentMutation.isPending ? "Programando..." : "Programar Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para confirmar eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAppointment}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? "Eliminando..." : "Eliminar Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
