
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const applianceTypes = [
  "Refrigerador",
  "Lavadora",
  "Secadora",
  "Lavavajillas",
  "Estufa",
  "Horno",
  "Microondas",
  "Licuadora",
  "Batidora",
  "Cafetera",
  "Otro",
];

const brands = [
  "Samsung",
  "LG",
  "Whirlpool",
  "Mabe",
  "Maytag",
  "Bosch",
  "GE",
  "Electrolux",
  "Frigidaire",
  "KitchenAid",
  "Teka",
  "Daewoo",
  "Otra",
];

export default function OrderForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    // Cliente
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    
    // Electrodoméstico
    applianceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    
    // Detalles
    problemDescription: "",
    observations: "",
    
    // Servicio
    serviceType: "domicilio", // domicilio o taller
    urgency: "normal", // baja, normal, alta
  });
  
  // Manejador para cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Manejador para selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío (aquí integraremos Supabase más adelante)
    setTimeout(() => {
      toast({
        title: "Orden creada con éxito",
        description: "La orden de servicio ha sido registrada correctamente",
      });
      setIsSubmitting(false);
      navigate("/orders");
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/orders")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="notion-heading">Nueva Orden de Servicio</h1>
          </div>
          <Button
            className="notion-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar Orden"}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="client">Datos del Cliente</TabsTrigger>
              <TabsTrigger value="appliance">Electrodoméstico</TabsTrigger>
              <TabsTrigger value="service">Detalles del Servicio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="client" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                  <CardDescription>
                    Ingresa los datos del cliente para la orden de servicio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nombre completo *</Label>
                      <Input
                        id="clientName"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        placeholder="Nombre y apellidos"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Teléfono *</Label>
                      <Input
                        id="clientPhone"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleChange}
                        placeholder="Número de contacto"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Correo electrónico</Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Dirección completa *</Label>
                    <Textarea
                      id="clientAddress"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      placeholder="Calle, número, colonia, ciudad, código postal"
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appliance" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Datos del Electrodoméstico</CardTitle>
                  <CardDescription>
                    Ingresa la información del electrodoméstico a reparar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applianceType">Tipo de electrodoméstico *</Label>
                      <Select 
                        value={formData.applianceType} 
                        onValueChange={(value) => handleSelectChange("applianceType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {applianceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca *</Label>
                      <Select 
                        value={formData.brand} 
                        onValueChange={(value) => handleSelectChange("brand", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo *</Label>
                      <Input
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Modelo del electrodoméstico"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serialNumber">Número de serie</Label>
                      <Input
                        id="serialNumber"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="Número de serie (opcional)"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="problemDescription">Descripción de la falla *</Label>
                    <Textarea
                      id="problemDescription"
                      name="problemDescription"
                      value={formData.problemDescription}
                      onChange={handleChange}
                      placeholder="Describe el problema reportado por el cliente"
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="service" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Servicio</CardTitle>
                  <CardDescription>
                    Configura los detalles del servicio a realizar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de servicio *</Label>
                      <Select 
                        value={formData.serviceType} 
                        onValueChange={(value) => handleSelectChange("serviceType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domicilio">Servicio a domicilio</SelectItem>
                          <SelectItem value="taller">Reparación en taller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Urgencia *</Label>
                      <Select 
                        value={formData.urgency} 
                        onValueChange={(value) => handleSelectChange("urgency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observations">Observaciones adicionales</Label>
                    <Textarea
                      id="observations"
                      name="observations"
                      value={formData.observations}
                      onChange={handleChange}
                      placeholder="Cualquier información adicional relevante para el servicio"
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-notion-gray">
                    * Campos obligatorios
                  </p>
                  <Button type="submit" className="notion-button" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Guardando..." : "Guardar Orden"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AppLayout>
  );
}
