
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Edit, FileText, Printer, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function OrderDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Datos simulados para la orden de servicio
  const orderData = {
    id: id || "123",
    number: "ORD-2023-" + id,
    date: "2023-05-15",
    status: "En proceso",
    client: {
      id: "CLI001",
      name: "Juan Pérez",
      address: "Calle Principal 123",
      phone: "555-1234",
      email: "juan@ejemplo.com"
    },
    device: {
      type: "Refrigerador",
      brand: "Samsung",
      model: "RF28R7351SR",
      serialNumber: "XYZ12345678"
    },
    issue: "El refrigerador no enfría correctamente y hace ruidos extraños al funcionar.",
    diagnosis: "Compresor defectuoso y fuga de refrigerante.",
    observations: "El cliente menciona que el problema comenzó hace aproximadamente 2 semanas.",
    technician: "Carlos Rodríguez",
    service: {
      date: "2023-05-17",
      timeSlot: "09:00 - 12:00",
      status: "Programado"
    },
    partsUsed: [
      { id: "P001", name: "Compresor", quantity: 1, unitPrice: 450 },
      { id: "P002", name: "Refrigerante R134a", quantity: 2, unitPrice: 75 }
    ],
    labor: [
      { description: "Diagnóstico inicial", hours: 1, rate: 50 },
      { description: "Reemplazo de compresor", hours: 3, rate: 60 },
      { description: "Recarga de refrigerante", hours: 1, rate: 50 }
    ],
    payment: {
      subtotal: 600,
      tax: 96,
      total: 696,
      method: "Tarjeta de crédito",
      status: "Pendiente"
    },
    timeline: [
      { date: "2023-05-15 09:30", action: "Orden creada", user: "María López" },
      { date: "2023-05-15 14:45", action: "Servicio programado", user: "María López" },
      { date: "2023-05-17 09:15", action: "Técnico asignado", user: "Sistema" },
    ]
  };

  const handleUpdateStatus = (newStatus: string) => {
    toast({
      title: "Estado actualizado",
      description: `La orden ahora está ${newStatus}`,
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Cambios guardados",
      description: "Los cambios se han guardado correctamente",
    });
  };

  // Calcular totales
  const laborTotal = orderData.labor.reduce((sum, item) => sum + (item.hours * item.rate), 0);
  const partsTotal = orderData.partsUsed.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const subtotal = laborTotal + partsTotal;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orden de servicio #{orderData.number}</h1>
          <p className="text-muted-foreground">Creada el {orderData.date}</p>
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
                orderData.status === "Completada" ? "outline" :
                orderData.status === "En proceso" ? "default" :
                "secondary"
              }>
                {orderData.status}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdateStatus("En espera")}>Marcar en espera</Button>
                <Button variant="outline" onClick={() => handleUpdateStatus("En proceso")}>Marcar en proceso</Button>
                <Button variant="default" onClick={() => handleUpdateStatus("Completada")}>Marcar como completada</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Servicio programado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{orderData.service.date}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{orderData.service.timeSlot}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Técnico: {orderData.technician}</span>
              </div>
            </div>
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
                    value={orderData.issue} 
                    readOnly 
                    className="h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Textarea 
                    id="diagnosis" 
                    value={orderData.diagnosis}
                    className="h-24"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea 
                  id="observations" 
                  value={orderData.observations}
                  className="h-24"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre</Label>
                  <Input id="clientName" value={orderData.client.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Teléfono</Label>
                  <Input id="clientPhone" value={orderData.client.phone} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Correo electrónico</Label>
                <Input id="clientEmail" value={orderData.client.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Dirección</Label>
                <Textarea id="clientAddress" value={orderData.client.address} readOnly />
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/clients/${orderData.client.id}`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver perfil completo
                </Button>
              </Link>
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
                  <Select defaultValue={orderData.device.type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Refrigerador">Refrigerador</SelectItem>
                      <SelectItem value="Lavadora">Lavadora</SelectItem>
                      <SelectItem value="Secadora">Secadora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceBrand">Marca</Label>
                  <Input id="deviceBrand" value={orderData.device.brand} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceModel">Modelo</Label>
                  <Input id="deviceModel" value={orderData.device.model} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceSerial">Número de serie</Label>
                  <Input id="deviceSerial" value={orderData.device.serialNumber} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges}>Guardar cambios</Button>
            </CardFooter>
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
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-sm">
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-right">Horas</th>
                      <th className="p-2 text-right">Tarifa</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.labor.map((item, index) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{item.hours}</td>
                        <td className="p-2 text-right">${item.rate.toFixed(2)}</td>
                        <td className="p-2 text-right">${(item.hours * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-medium">Total Mano de Obra:</td>
                      <td className="p-2 text-right font-medium">${laborTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Repuestos utilizados</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-sm">
                      <th className="p-2 text-left">Repuesto</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-right">Precio unitario</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.partsUsed.map((part) => (
                      <tr key={part.id} className="border-b border-muted">
                        <td className="p-2">{part.name}</td>
                        <td className="p-2 text-right">{part.quantity}</td>
                        <td className="p-2 text-right">${part.unitPrice.toFixed(2)}</td>
                        <td className="p-2 text-right">${(part.quantity * part.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-medium">Total Repuestos:</td>
                      <td className="p-2 text-right font-medium">${partsTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" onClick={handleSaveChanges}>Guardar cambios</Button>
            </CardFooter>
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
                  <Select defaultValue={orderData.payment.method}>
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
                  <Select defaultValue={orderData.payment.status}>
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
              <Button onClick={handleSaveChanges}>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historial de actividad</CardTitle>
          <CardDescription>Registro de acciones realizadas en esta orden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderData.timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{event.action}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
