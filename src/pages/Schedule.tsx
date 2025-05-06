import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, serviceOrdersApi, clientsApi, techniciansApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SectionHeader } from "@/components/ui/section-header";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO, addDays, subDays, isValid } from "date-fns";
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
  ClipboardCheck,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Appointment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
];

export default function Schedule() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time_slot: "",
    order_id: "",
    technician_id: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultas
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsApi.getAll(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => serviceOrdersApi.getAll(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll(),
  });

  const { data: technicians = [], isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: () => techniciansApi.getAll(),
  });

  // Mutaciones
  const createAppointmentMutation = useMutation({
    mutationFn: (newAppointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => 
      appointmentsApi.create(newAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowNewAppointmentDialog(false);
      resetNewAppointmentForm();
      toast({
        title: "Cita programada",
        description: "La cita ha sido programada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo programar la cita",
        variant: "destructive",
      });
    }
  });

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
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive",
      });
    }
  });

  const resetNewAppointmentForm = () => {
    setNewAppointment({
      date: format(date, 'yyyy-MM-dd'),
      time_slot: "",
      order_id: "",
      technician_id: "",
    });
  };
  
  useEffect(() => {
    setNewAppointment(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
  }, [date]);

  // Handlers
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
      technician: newAppointment.technician_id || null,
    });
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    setDate(currentDate => {
      const modifier = view === "day" ? 1 : 7;
      return direction === 'prev' 
        ? subDays(currentDate, modifier)
        : addDays(currentDate, modifier);
    });
  };

  const appointmentDates = appointments.map(apt => parseISO(apt.date));

  // Helpers
  const filteredAppointments = appointments.filter(apt => 
    isSameDay(parseISO(apt.date), date)
  );

  const getClientFromOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    return order ? clients.find(c => c.id === order.client_id) : null;
  };

  const getOrderDetails = (orderId: string) => 
    orders.find(o => o.id === orderId);

  const activeTechnicians = technicians.filter(tech => tech.is_active);

  // Animaciones
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" }
    })
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Agenda de Servicios">
        <Button 
          onClick={() => {
            resetNewAppointmentForm();
            setShowNewAppointmentDialog(true);
          }}
          className="h-9 gap-1"
        >
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </SectionHeader>

      <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="day">Día</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleDateNavigation('prev')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setDate(new Date())}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleDateNavigation('next')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario y Técnicos */}
          <Card className="lg:col-span-1">
            <CardHeader className="bg-muted/30">
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Selecciona una fecha</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                className="rounded-md border"
                modifiers={{
                  hasAppointment: appointmentDates.map(d => new Date(d))
                }}
                modifiersClassNames={{
                  hasAppointment: "has-appointment"
                }}
              />
              
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium">Técnicos Disponibles</h3>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {isLoadingTechnicians ? (
                    <div className="text-center py-2">
                      <span className="inline-block animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full mr-2"></span>
                      Cargando técnicos...
                    </div>
                  ) : activeTechnicians.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <UserRound className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p>No hay técnicos registrados</p>
                    </div>
                  ) : (
                    activeTechnicians.map((tech) => (
                      <div
                        key={tech.id}
                        className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-all"
                      >
                        <div>
                          <p className="font-medium text-sm">{tech.name}</p>
                          <p className="text-xs text-muted-foreground">{tech.specialty}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">
                          Disponible
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Listado de Citas */}
          <Card className="lg:col-span-2">
            <CardHeader className="bg-muted/30">
              <CardTitle>
                {isValid(date) ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : "Fecha inválida"}
              </CardTitle>
              <CardDescription>{filteredAppointments.length} citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex justify-center items-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Cargando citas...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-3">
                  {filteredAppointments.map((apt, index) => {
                    const client = getClientFromOrder(apt.order_id);
                    const order = getOrderDetails(apt.order_id);
                    
                    return (
                      <motion.div
                        key={apt.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="p-4 border rounded-md hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                              <Clock className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{apt.time_slot}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setAppointmentToDelete(apt)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{client?.name || "Cliente no encontrado"}</span>
                                <span className="text-xs text-muted-foreground block">{client?.phone || "Sin teléfono"}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground line-clamp-2">{order?.problem_description || "Descripción no disponible"}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Orden: <span className="font-medium">{order?.order_number || "N/A"}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Técnico: <span className="font-medium">
                                  {activeTechnicians.find(t => t.id === apt.technician)?.name || "No asignado"}
                                </span>
                              </span>
                            </div>
                            {order && <Badge variant={order.status === "Completado" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-muted/40 p-4 rounded-full mb-4">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No hay citas programadas</h3>
                  <Button onClick={() => setShowNewAppointmentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cita
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Diálogo Nueva Cita */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
  <DialogContent className="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Nueva Cita</DialogTitle>
      <DialogDescription>Complete todos los campos requeridos</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Sección de Fecha */}
        <div className="space-y-2">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={newAppointment.date}
            onChange={e => setNewAppointment({...newAppointment, date: e.target.value})}
          />
        </div>

        {/* Sección de Horario */}
        <div className="space-y-2">
          <Label>Horario</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {newAppointment.time_slot || "Seleccionar"}
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Buscar horario..." />
                <CommandList>
                  <CommandEmpty>No hay horarios</CommandEmpty>
                  <CommandGroup>
                    {timeSlots.map(slot => (
                      <CommandItem
                        key={slot}
                        value={slot}
                        onSelect={() => setNewAppointment({...newAppointment, time_slot: slot})}
                      >
                        <Check className={cn(
                          "mr-2 h-4 w-4",
                          newAppointment.time_slot === slot ? "opacity-100" : "opacity-0"
                        )} />
                        {slot}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Sección de Orden de Servicio */}
      <div className="space-y-2">
        <Label>Orden de Servicio</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {orders.find(o => o.id === newAppointment.order_id)?.order_number || "Seleccionar"}
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command>
              <CommandInput placeholder="Buscar orden..." />
              <CommandList>
                <CommandEmpty>No hay órdenes</CommandEmpty>
                <CommandGroup>
                  {orders
                    .filter(order => order.status !== "Completado")
                    .map(order => (
                      <CommandItem
                        key={order.id}
                        value={order.id}
                        onSelect={() => setNewAppointment({...newAppointment, order_id: order.id})}
                      >
                        <Check className={cn(
                          "mr-2 h-4 w-4",
                          newAppointment.order_id === order.id ? "opacity-100" : "opacity-0"
                        )} />
                        <div className="flex flex-col">
                          <span>{order.order_number}</span>
                          <span className="text-xs text-muted-foreground">
                            {clients.find(c => c.id === order.client_id)?.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Sección de Técnico */}
      <div className="space-y-2">
        <Label>Técnico</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {technicians.find(t => t.id === newAppointment.technician_id)?.name || "Seleccionar"}
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command>
              <CommandInput placeholder="Buscar técnico..." />
              <CommandList>
                <CommandEmpty>No hay técnicos</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value=""
                    onSelect={() => setNewAppointment({...newAppointment, technician_id: ""})}
                  >
                    <Check className={cn(
                      "mr-2 h-4 w-4",
                      !newAppointment.technician_id ? "opacity-100" : "opacity-0"
                    )} />
                    Sin asignar
                  </CommandItem>
                  {activeTechnicians.map(tech => (
                    <CommandItem
                      key={tech.id}
                      value={tech.id}
                      onSelect={() => setNewAppointment({...newAppointment, technician_id: tech.id})}
                    >
                      <Check className={cn(
                        "mr-2 h-4 w-4",
                        newAppointment.technician_id === tech.id ? "opacity-100" : "opacity-0"
                      )} />
                      <div className="flex flex-col">
                        <span>{tech.name}</span>
                        <span className="text-xs text-muted-foreground">{tech.specialty}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
        Cancelar
      </Button>
      <Button 
        onClick={handleCreateAppointment}
        disabled={createAppointmentMutation.isPending}
      >
        {createAppointmentMutation.isPending ? "Guardando..." : "Crear Cita"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}