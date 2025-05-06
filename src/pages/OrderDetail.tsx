
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  FileText, 
  Printer, 
  Send, 
  Trash, 
  UserRound, 
  Wrench,
  Plus,
  Save,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Datos simulados de una orden
const orderData = {
  id: "OS-2023-042",
  date: "15/05/2023",
  status: "En proceso",
  client: {
    name: "María Rodríguez",
    phone: "555-123-4567",
    email: "maria.rodriguez@ejemplo.com",
    address: "Av. Independencia 1234, Col. Centro, Ciudad de México, CP 12345",
  },
  appliance: {
    type: "Refrigerador",
    brand: "Samsung",
    model: "RT38K5982BS",
    serialNumber: "SN12345678",
    problem: "No enfría correctamente, emite sonidos fuertes y la puerta no sella bien.",
  },
  service: {
    type: "domicilio",
    urgency: "normal",
    observations: "Cliente menciona que el problema comenzó hace aproximadamente 2 semanas. Ya intentó desconectarlo y volverlo a conectar sin éxito.",
    technician: "Carlos Méndez",
    scheduledDate: "18/05/2023",
    scheduledTime: "10:00 - 12:00",
  },
  diagnostics: "Compresor funcionando de manera intermitente, sello de puerta dañado. Sistema de refrigeración con posible fuga.",
  repairs: [
    {
      description: "Reemplazo de sello de puerta",
      status: "Completado",
    },
    {
      description: "Revisión y recarga del sistema de refrigeración",
      status: "Pendiente",
    },
    {
      description: "Verificación de funcionamiento del compresor",
      status: "En proceso",
    },
  ],
  parts: [
    {
      name: "Sello de puerta para Samsung RT38K",
      quantity: 1,
      price: "$450.00",
    },
    {
      name: "Refrigerante R600a",
      quantity: 1,
      price: "$320.00",
    },
  ],
  payment: {
    total: "$1,270.00",
    serviceCost: "$500.00",
    partsCost: "$770.00",
    status: "Pendiente",
    method: "Efectivo",
  },
  history: [
    {
      date: "15/05/2023 09:30",
      action: "Orden creada por Laura López (Recepcionista)",
    },
    {
      date: "15/05/2023 14:20",
      action: "Asignada a técnico Carlos Méndez",
    },
    {
      date: "16/05/2023 10:15",
      action: "Se contactó al cliente para programar visita",
    },
    {
      date: "18/05/2023 11:30",
      action: "Técnico en camino al domicilio",
    },
  ],
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [showAddRepairDialog, setShowAddRepairDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Datos para los diálogos
  const [newPart, setNewPart] = useState({ name: "", quantity: 1, price: "" });
  const [newRepair, setNewRepair] = useState({ description: "", status: "Pendiente" });
  
  // Manejadores para diálogos
  const handleAddPart = () => {
    // Aquí se integraría con Supabase para añadir la pieza
    toast({
      title: "Pieza añadida",
      description: "La pieza ha sido agregada a la orden de servicio",
    });
    setShowAddPartDialog(false);
  };
  
  const handleAddRepair = () => {
    // Aquí se integraría con Supabase para añadir la reparación
    toast({
      title: "Tarea de reparación añadida",
      description: "La tarea ha sido agregada a la orden de servicio",
    });
    setShowAddRepairDialog(false);
  };
  
  const handleDeleteOrder = () => {
    // Aquí se integraría con Supabase para eliminar la orden
    toast({
      title: "Orden eliminada",
      description: "La orden de servicio ha sido eliminada correctamente",
    });
    setShowDeleteDialog(false);
    navigate("/orders");
  };
  
  const handlePrintOrder = () => {
    toast({
      title: "Preparando impresión",
      description: "Generando documento para imprimir",
    });
    // Aquí se implementaría la lógica de impresión
  };
  
  const handleGenerateInvoice = () => {
    navigate(`/invoices/new?orderId=${id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/orders")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="notion-heading mb-0">{orderData.id}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  orderData.status === "Completado" 
                    ? "success" 
                    : orderData.status === "En proceso" 
                    ? "default" 
                    : "secondary"
                }>
                  {orderData.status}
                </Badge>
                <span className="text-sm text-notion-gray">
                  {orderData.date}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePrintOrder}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={() => navigate(`/orders/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="default" className="notion-button" onClick={handleGenerateInvoice}>
              <FileText className="mr-2 h-4 w-4" />
              Generar Factura
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="service">Servicio</TabsTrigger>
            <TabsTrigger value="parts">Repuestos</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserRound className="mr-2 h-5 w-5 text-notion-blue" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{orderData.client.name}</p>
                    <p className="text-sm text-notion-gray">{orderData.client.phone}</p>
                    <p className="text-sm text-notion-gray">{orderData.client.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-notion-gray">
                      {orderData.client.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Información del electrodoméstico */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-notion-blue" />
                    Electrodoméstico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">Tipo</p>
                      <p className="text-sm">{orderData.appliance.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Marca</p>
                      <p className="text-sm">{orderData.appliance.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Modelo</p>
                      <p className="text-sm">{orderData.appliance.model}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">N° Serie</p>
                      <p className="text-sm">{orderData.appliance.serialNumber || "N/A"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Problema reportado</p>
                    <p className="text-sm text-notion-gray">
                      {orderData.appliance.problem}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Historial de la orden */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center">
                    Historial de la Orden
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {showHistory && (
                <CardContent>
                  <div className="space-y-3">
                    {orderData.history.map((entry, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-notion-blue mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.date}</p>
                          <p className="text-sm text-notion-gray">{entry.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="service" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detalles del servicio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-notion-blue" />
                    Detalles del Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">Tipo de servicio</p>
                      <p className="text-sm">
                        {orderData.service.type === "domicilio" 
                          ? "Servicio a domicilio" 
                          : "Reparación en taller"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Urgencia</p>
                      <p className="text-sm capitalize">{orderData.service.urgency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Técnico asignado</p>
                      <p className="text-sm">{orderData.service.technician || "Sin asignar"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Observaciones</p>
                    <p className="text-sm text-notion-gray">
                      {orderData.service.observations || "Sin observaciones"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Agenda */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-notion-blue" />
                    Programación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">Fecha programada</p>
                      <p className="text-sm">{orderData.service.scheduledDate || "Sin programar"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Horario</p>
                      <p className="text-sm">{orderData.service.scheduledTime || "Sin definir"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-center">
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Reprogramar visita
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Diagnóstico y reparaciones */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Diagnóstico y Reparaciones</CardTitle>
                  <Button onClick={() => setShowAddRepairDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Tarea
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Diagnóstico técnico</h3>
                  <p className="text-sm text-notion-gray p-3 bg-notion-lightgray rounded-md">
                    {orderData.diagnostics || "No se ha registrado un diagnóstico"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Tareas de reparación</h3>
                  <div className="divide-y divide-notion-border">
                    {orderData.repairs.map((repair, index) => (
                      <div key={index} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm">{repair.description}</p>
                        </div>
                        <Badge variant={
                          repair.status === "Completado" 
                            ? "success" 
                            : repair.status === "En proceso" 
                            ? "default" 
                            : "secondary"
                        }>
                          {repair.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="parts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Repuestos y Materiales</CardTitle>
                  <Button onClick={() => setShowAddPartDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Repuesto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-notion-border">
                        <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                          Descripción
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-notion-gray">
                          Cantidad
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-notion-gray">
                          Precio unitario
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-notion-gray">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-notion-border">
                      {orderData.parts.map((part, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{part.name}</td>
                          <td className="px-4 py-3 text-sm text-center">{part.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">{part.price}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {`$${(parseFloat(part.price.replace('$', '').replace(',', '')) * part.quantity).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {orderData.parts.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-notion-gray">No hay repuestos registrados</p>
                  </div>
                )}
                
                {orderData.parts.length > 0 && (
                  <div className="mt-4 text-right">
                    <p className="text-sm font-medium">
                      Total Repuestos: {orderData.payment.partsCost}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-notion-blue" />
                  Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Resumen de costos</h3>
                    <div className="bg-notion-lightgray rounded-md p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Costo de servicio:</span>
                        <span className="text-sm font-medium">{orderData.payment.serviceCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Repuestos:</span>
                        <span className="text-sm font-medium">{orderData.payment.partsCost}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total:</span>
                        <span className="text-sm font-bold">{orderData.payment.total}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Estado de pago</h3>
                    <div className="bg-notion-lightgray rounded-md p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Estado:</span>
                        <Badge variant={
                          orderData.payment.status === "Pagado" 
                            ? "success" 
                            : "secondary"
                        }>
                          {orderData.payment.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Método de pago:</span>
                        <span className="text-sm">{orderData.payment.method}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button className="flex-1" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Registrar Pago
                  </Button>
                  <Button className="flex-1 notion-button">
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Factura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog para añadir repuesto */}
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir repuesto</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del repuesto o material utilizado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partName">Descripción</Label>
              <Input
                id="partName"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                placeholder="Nombre o descripción del repuesto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newPart.quantity}
                  onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio unitario</Label>
                <Input
                  id="price"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                  placeholder="$0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPart}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para añadir tarea de reparación */}
      <Dialog open={showAddRepairDialog} onOpenChange={setShowAddRepairDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir tarea de reparación</DialogTitle>
            <DialogDescription>
              Ingresa los detalles de la tarea a realizar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repairDescription">Descripción</Label>
              <Textarea
                id="repairDescription"
                value={newRepair.description}
                onChange={(e) => setNewRepair({ ...newRepair, description: e.target.value })}
                placeholder="Descripción de la tarea de reparación"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repairStatus">Estado</Label>
              <Select
                value={newRepair.status}
                onValueChange={(value) => setNewRepair({ ...newRepair, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRepairDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRepair}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar orden de servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta orden de servicio? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
