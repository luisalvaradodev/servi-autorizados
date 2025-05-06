
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Plus, 
  Clock, 
  Wrench, 
  UserRound, 
  ArrowLeft, 
  ArrowRight,
  CalendarDays,
  CalendarIcon,
  ClockIcon,
  Trash, 
} from "lucide-react";

// Datos de ejemplo para las citas
const appointments = [
  {
    id: "APT-001",
    date: new Date(2023, 4, 18),
    timeSlot: "09:00 - 11:00",
    client: {
      id: "CL-002",
      name: "María Rodríguez",
      phone: "555-234-5678",
    },
    orderId: "OS-2023-042",
    serviceType: "Reparación de Refrigerador Samsung",
    technician: "Carlos Méndez",
    address: "Av. Reforma 456, Col. Juárez",
    status: "Programada",
  },
  {
    id: "APT-002",
    date: new Date(2023, 4, 18),
    timeSlot: "13:00 - 15:00",
    client: {
      id: "CL-004",
      name: "Ana García",
      phone: "555-456-7890",
    },
    orderId: "OS-2023-047",
    serviceType: "Reparación de Lavavajillas Bosch",
    technician: "Carlos Méndez",
    address: "Calle Durango 234, Col. Condesa",
    status: "Programada",
  },
  {
    id: "APT-003",
    date: new Date(2023, 4, 19),
    timeSlot: "10:00 - 12:00",
    client: {
      id: "CL-001",
      name: "Juan Pérez",
      phone: "555-123-4567",
    },
    orderId: "OS-2023-049",
    serviceType: "Reparación de Lavadora Maytag",
    technician: "Miguel Ángel Soto",
    address: "Calle Principal 123, Col. Centro",
    status: "Programada",
  },
  {
    id: "APT-004",
    date: new Date(2023, 4, 20),
    timeSlot: "15:00 - 17:00",
    client: {
      id: "CL-003",
      name: "Carlos López",
      phone: "555-345-6789",
    },
    orderId: "OS-2023-050",
    serviceType: "Reparación de Refrigerador LG",
    technician: "Miguel Ángel Soto",
    address: "Blvd. Insurgentes 789, Col. Roma",
    status: "Programada",
  },
];

// Datos de ejemplo para los técnicos
const technicians = [
  {
    id: "TECH-001",
    name: "Carlos Méndez",
    specialty: "Refrigeración y Lavadoras",
    available: true,
  },
  {
    id: "TECH-002",
    name: "Miguel Ángel Soto",
    specialty: "Estufas y Hornos",
    available: true,
  },
  {
    id: "TECH-003",
    name: "Laura Ramírez",
    specialty: "Electrodomésticos Pequeños",
    available: false,
  },
];

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
  const [newAppointment, setNewAppointment] = useState({
    date: new Date(),
    timeSlot: "",
    clientId: "",
    orderId: "",
    technicianId: "",
  });
  const { toast } = useToast();

  // Filtrar citas para la fecha seleccionada
  const filteredAppointments = appointments.filter((apt) => {
    if (!date) return false;
    return isSameDay(apt.date, date);
  });
  
  // Manejar la creación de una nueva cita
  const handleCreateAppointment = () => {
    // Aquí se implementaría la lógica para guardar en Supabase
    toast({
      title: "Cita programada",
      description: "La cita ha sido programada correctamente",
    });
    setShowNewAppointmentDialog(false);
  };

  return (
    <AppLayout>
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
                    {technicians.map((tech) => (
                      <div
                        key={tech.id}
                        className="flex items-center justify-between p-2 rounded-md border border-notion-border"
                      >
                        <div>
                          <p className="text-sm font-medium">{tech.name}</p>
                          <p className="text-xs text-notion-gray">{tech.specialty}</p>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            tech.available ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                    ))}
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
                {filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 border border-notion-border rounded-md hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-notion-blue" />
                            <span className="font-medium">{apt.timeSlot}</span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm flex items-center">
                              <UserRound className="h-4 w-4 mr-2 text-notion-gray" />
                              <span>
                                <span className="font-medium">{apt.client.name}</span> 
                                <span className="text-notion-gray ml-1">({apt.client.phone})</span>
                              </span>
                            </p>
                            <p className="text-sm flex items-center">
                              <Wrench className="h-4 w-4 mr-2 text-notion-gray" />
                              <span>{apt.serviceType}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm flex items-center">
                              <CalendarDays className="h-4 w-4 mr-2 text-notion-gray" />
                              <span className="text-notion-gray">Orden:</span>
                              <span className="ml-1 font-medium">{apt.orderId}</span>
                            </p>
                            <p className="text-sm flex items-center">
                              <UserRound className="h-4 w-4 mr-2 text-notion-gray" />
                              <span className="text-notion-gray">Técnico:</span>
                              <span className="ml-1">{apt.technician}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
      </div>
      
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
                <div className="flex">
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={newAppointment.date.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setNewAppointment({
                        ...newAppointment,
                        date: newDate,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Horario</Label>
                <Select
                  value={newAppointment.timeSlot}
                  onValueChange={(value) => setNewAppointment({
                    ...newAppointment,
                    timeSlot: value,
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
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                value={newAppointment.clientId}
                onValueChange={(value) => setNewAppointment({
                  ...newAppointment,
                  clientId: value,
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((apt) => (
                    <SelectItem key={apt.client.id} value={apt.client.id}>
                      {apt.client.name} - {apt.client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orderId">Orden de servicio</Label>
              <Select
                value={newAppointment.orderId}
                onValueChange={(value) => setNewAppointment({
                  ...newAppointment,
                  orderId: value,
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar orden" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((apt) => (
                    <SelectItem key={apt.orderId} value={apt.orderId}>
                      {apt.orderId} - {apt.serviceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="technicianId">Técnico</Label>
              <Select
                value={newAppointment.technicianId}
                onValueChange={(value) => setNewAppointment({
                  ...newAppointment,
                  technicianId: value,
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id} disabled={!tech.available}>
                      {tech.name} - {tech.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Programar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
