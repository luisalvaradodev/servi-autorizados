import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { techniciansApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const technicianSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  specialty: z.string().min(2, "La especialidad es requerida"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

export default function TechnicianForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      name: "",
      specialty: "",
      email: "",
      phone: "",
      is_active: true,
    },
  });

  // Fetch technician data if in edit mode
  const { data: technician, isLoading: isLoadingTechnician } = useQuery({
    queryKey: ["technician", id],
    queryFn: () => techniciansApi.getById(id!),
    enabled: isEditMode,
  });

  // Set form values when technician data is loaded
  useEffect(() => {
    if (technician) {
      form.reset({
        name: technician.name,
        specialty: technician.specialty,
        email: technician.email || "",
        phone: technician.phone || "",
        is_active: technician.is_active,
      });
    }
  }, [technician, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: TechnicianFormValues) => {
      // Ensure name and specialty are required for the API
      if (!values.name || !values.specialty) {
        throw new Error("Nombre y especialidad son obligatorios");
      }
      return techniciansApi.create({
        name: values.name,
        specialty: values.specialty,
        email: values.email || null,
        phone: values.phone || null,
        is_active: values.is_active
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Técnico creado",
        description: "El técnico ha sido registrado correctamente"
      });
      navigate("/technicians");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: TechnicianFormValues) => {
      if (!values.name || !values.specialty) {
        throw new Error("Nombre y especialidad son obligatorios");
      }
      return techniciansApi.update(id!, {
        name: values.name,
        specialty: values.specialty,
        email: values.email || null,
        phone: values.phone || null,
        is_active: values.is_active
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      queryClient.invalidateQueries({ queryKey: ["technician", id] });
      toast({
        title: "Técnico actualizado",
        description: "Los datos del técnico han sido actualizados correctamente"
      });
      navigate("/technicians");
    },
  });

  const onSubmit = (values: TechnicianFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  if (isEditMode && isLoadingTechnician) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del técnico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={isEditMode ? "Editar Técnico" : "Nuevo Técnico"}
        subtitle={isEditMode ? "Modifica los datos del técnico" : "Registra un nuevo técnico en el sistema"}
        onBack={() => navigate("/technicians")}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle>{isEditMode ? "Editar información del técnico" : "Registrar nuevo técnico"}</CardTitle>
            <CardDescription>
              {isEditMode
                ? "Modifica los datos del técnico según sea necesario"
                : "Completa el formulario para registrar un nuevo técnico"}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nombre y apellidos" 
                          className="transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ej: Refrigeración, Lavadoras, etc."
                          className="transition-all" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            placeholder="correo@ejemplo.com"
                            className="transition-all" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Número de contacto"
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
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado activo</FormLabel>
                        <FormDescription>
                          Determina si el técnico está disponible para asignar a órdenes de servicio
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="bg-muted/30 py-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/technicians")}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  )}
                  <Save className={`mr-2 h-4 w-4 ${createMutation.isPending || updateMutation.isPending ? 'hidden' : ''}`} />
                  {isEditMode ? "Actualizar Técnico" : "Guardar Técnico"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}