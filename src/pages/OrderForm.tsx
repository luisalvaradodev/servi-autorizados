import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, applianceTypesApi, brandsApi, serviceOrdersApi, techniciansApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/ui/section-header";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, UserPlus, ChevronsUpDown, Check } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timeSlots = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
];

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
  technician_id: z.string().optional(),
  time_slot: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState("client");

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
      technician_id: "",
      time_slot: "",
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });

  const { data: applianceTypes } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });

  const { data: technicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: techniciansApi.getAll,
  });

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => serviceOrdersApi.getById(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (order) {
      form.reset({
        ...order,
        model: order.model || "",
        serial_number: order.serial_number || "",
        observations: order.observations || "",
        technician_id: order.technician_id || "",
        time_slot: order.time_slot || "",
      });
    }
  }, [order, form]);

  const createMutation = useMutation({
    mutationFn: (values: OrderFormValues) => {
      const orderData = {
        ...values,
        model: values.model || null,
        serial_number: values.serial_number || null,
        observations: values.observations || null,
        technician_id: values.technician_id || null,
        time_slot: values.time_slot || null,
      };
      return serviceOrdersApi.create(orderData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Orden creada",
        description: "La orden de servicio ha sido creada correctamente",
      });
      navigate(`/orders/${data?.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: OrderFormValues) => {
      const orderData = {
        ...values,
        model: values.model || null,
        serial_number: values.serial_number || null,
        observations: values.observations || null,
        technician_id: values.technician_id || null,
        time_slot: values.time_slot || null,
      };
      return serviceOrdersApi.update(id!, orderData);
    },
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
  
  const handleNextTab = () => {
    if (activeTab === "client") setActiveTab("appliance");
    else if (activeTab === "appliance") setActiveTab("service");
  };
  
  const handlePrevTab = () => {
    if (activeTab === "service") setActiveTab("appliance");
    else if (activeTab === "appliance") setActiveTab("client");
  };

  if (isEditMode && isLoadingOrder) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de la orden...</p>
        </div>
      </div>
    );
  }

  const isFirstTabValid = !!form.getValues().client_id;
  const isSecondTabValid = !!form.getValues().appliance_type && 
                          !!form.getValues().brand_id && 
                          !!form.getValues().problem_description;
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <SectionHeader
        title={isEditMode ? "Editar Orden de Servicio" : "Nueva Orden de Servicio"}
        subtitle={isEditMode ? "Modifica los datos de la orden existente" : "Completa el formulario para crear una nueva orden"}
        onBack={() => navigate("/orders")}
      >
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={createMutation.isPending || updateMutation.isPending}
          className="h-9"
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
          )}
          <Save className={`mr-2 h-4 w-4 ${createMutation.isPending || updateMutation.isPending ? 'hidden' : ''}`} />
          {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar Orden"}
        </Button>
      </SectionHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="client" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                1. Datos del Cliente
              </TabsTrigger>
              <TabsTrigger 
                value="appliance" 
                disabled={!isFirstTabValid && !isEditMode}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                2. Electrodoméstico
              </TabsTrigger>
              <TabsTrigger 
                value="service" 
                disabled={(!isFirstTabValid || !isSecondTabValid) && !isEditMode}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                3. Detalles del Servicio
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              {activeTab === "client" && (
                <motion.div
                  key="client-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="client" className="pt-2">
                    <Card>
                      <CardHeader className="bg-muted/50">
                        <CardTitle>Información del Cliente</CardTitle>
                        <CardDescription>
                          Selecciona el cliente para la orden de servicio
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <FormField
                          control={form.control}
                          name="client_id"
                          render={({ field }) => (
                            <FormItem className="mb-6">
                              <FormLabel className="text-base">Cliente *</FormLabel>
                              <div className="mt-1">
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full transition-all">
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
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between items-center mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/clients/new")}
                            className="gap-2"
                          >
                            <UserPlus className="h-4 w-4" />
                            Nuevo cliente
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={handleNextTab}
                            disabled={!isFirstTabValid && !isEditMode}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              )}
            
              {activeTab === "appliance" && (
                <motion.div
                  key="appliance-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="appliance" className="pt-2">
                    <Card>
                      <CardHeader className="bg-muted/50">
                        <CardTitle>Datos del Electrodoméstico</CardTitle>
                        <CardDescription>
                          Ingresa la información del electrodoméstico a reparar
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="appliance_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Tipo de electrodoméstico *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full transition-all">
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
                                <FormLabel className="text-base">Marca *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full transition-all">
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Modelo</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Modelo del electrodoméstico" 
                                    className="transition-all"
                                  />
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
                                <FormLabel className="text-base">Número de serie</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Número de serie (opcional)" 
                                    className="transition-all"
                                  />
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
                              <FormLabel className="text-base">Descripción de la falla *</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Describe el problema reportado por el cliente"
                                  rows={4}
                                  className="resize-none transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between items-center mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevTab}
                          >
                            Anterior
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={handleNextTab}
                            disabled={!isSecondTabValid && !isEditMode}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "service" && (
                <motion.div
                  key="service-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="service" className="pt-2">
                    <Card>
                      <CardHeader className="bg-muted/50">
                        <CardTitle>Detalles del Servicio</CardTitle>
                        <CardDescription>
                          Configura los detalles del servicio a realizar
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="service_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Tipo de servicio *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full transition-all">
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
                                <FormLabel className="text-base">Urgencia *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full transition-all">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="technician_id"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Técnico asignado</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-between"
                                    >
                                      {field.value
                                        ? technicians?.find(t => t.id === field.value)?.name
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
                                            onSelect={() => form.setValue('technician_id', '')}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                !field.value ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            Sin asignar
                                          </CommandItem>
                                          {technicians?.map((tech) => (
                                            <CommandItem
                                              key={tech.id}
                                              value={tech.id}
                                              onSelect={() => form.setValue('technician_id', tech.id)}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === tech.id ? "opacity-100" : "opacity-0"
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="time_slot"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Horario preferente</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-between"
                                    >
                                      {field.value || "Seleccionar horario"}
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
                                              onSelect={() => form.setValue('time_slot', slot)}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === slot ? "opacity-100" : "opacity-0"
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
                              <FormLabel className="text-base">Observaciones adicionales</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Cualquier información adicional relevante para el servicio"
                                  rows={4}
                                  className="resize-none transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="bg-muted/30 py-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevTab}
                        >
                          Anterior
                        </Button>
                        
                        <Button 
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {(createMutation.isPending || updateMutation.isPending) && (
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                          )}
                          <Save className={`mr-2 h-4 w-4 ${createMutation.isPending || updateMutation.isPending ? 'hidden' : ''}`} />
                          {isEditMode ? "Actualizar Orden" : "Crear Orden"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}