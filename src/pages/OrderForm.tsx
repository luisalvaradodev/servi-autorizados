
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, applianceTypesApi, brandsApi, serviceOrdersApi } from "@/services/api";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const orderSchema = z.object({
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  appliance_type: z.string().min(1, "Debe seleccionar un tipo de electrodoméstico"),
  brand_id: z.string().min(1, "Debe seleccionar una marca"),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  problem_description: z.string().min(10, "La descripción del problema debe tener al menos 10 caracteres"),
  observations: z.string().optional(),
  service_type: z.string().min(1, "Debe seleccionar un tipo de servicio"),
  urgency: z.string().min(1, "Debe seleccionar un nivel de urgencia"),
  status: z.string().default("Pendiente"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrderForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const preselectedClientId = searchParams.get("clientId");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: preselectedClientId || "",
      appliance_type: "",
      brand_id: "",
      model: "",
      serial_number: "",
      problem_description: "",
      observations: "",
      service_type: "domicilio",
      urgency: "normal",
      status: "Pendiente",
    },
  });

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });

  // Fetch appliance types
  const { data: applianceTypes } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });

  // Fetch order data if in edit mode
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => serviceOrdersApi.getById(id!),
    enabled: isEditMode,
  });

  // Set form values when order data is loaded
  useEffect(() => {
    if (order) {
      form.reset({
        client_id: order.client_id,
        appliance_type: order.appliance_type,
        brand_id: order.brand_id,
        model: order.model || "",
        serial_number: order.serial_number || "",
        problem_description: order.problem_description,
        observations: order.observations || "",
        service_type: order.service_type,
        urgency: order.urgency,
        status: order.status,
      });
    }
  }, [order, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: OrderFormValues) => serviceOrdersApi.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Orden creada",
        description: "La orden de servicio ha sido creada correctamente",
      });
      navigate(`/orders/${data?.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: OrderFormValues) => serviceOrdersApi.update(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast({
        title: "Orden actualizada",
        description: "La orden de servicio ha sido actualizada correctamente",
      });
      navigate(`/orders/${id}`);
    },
  });

  const onSubmit = (values: OrderFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  if (isEditMode && isLoadingOrder) {
    return <div className="flex justify-center p-8">Cargando datos de la orden...</div>;
  }

  return (
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
          <h1 className="notion-heading">
            {isEditMode ? "Editar Orden de Servicio" : "Nueva Orden de Servicio"}
          </h1>
        </div>
        <Button
          className="notion-button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar Orden"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    Selecciona el cliente para la orden de servicio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Cliente *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/clients/new")}
                    >
                      Nuevo cliente
                    </Button>
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
                    <FormField
                      control={form.control}
                      name="appliance_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de electrodoméstico *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {applianceTypes?.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="brand_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar marca" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Modelo del electrodoméstico" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="serial_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de serie</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Número de serie (opcional)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="problem_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción de la falla *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe el problema reportado por el cliente"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    <FormField
                      control={form.control}
                      name="service_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de servicio *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="domicilio">Servicio a domicilio</SelectItem>
                              <SelectItem value="taller">Reparación en taller</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgencia *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar prioridad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="baja">Baja</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones adicionales</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Cualquier información adicional relevante para el servicio"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-notion-gray">
                    * Campos obligatorios
                  </p>
                  <Button type="submit" className="notion-button" disabled={createMutation.isPending || updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar Orden"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
