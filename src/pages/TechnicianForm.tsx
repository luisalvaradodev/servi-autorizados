
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { techniciansApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

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
    return <div className="flex justify-center p-8">Cargando datos del técnico...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/technicians")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="notion-heading">
            {isEditMode ? "Editar Técnico" : "Nuevo Técnico"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Editar información del técnico" : "Registrar nuevo técnico"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Modifica los datos del técnico según sea necesario"
              : "Completa el formulario para registrar un nuevo técnico"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre y apellidos" />
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
                      <Input {...field} placeholder="Ej: Refrigeración, Lavadoras, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="correo@ejemplo.com" />
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
                        <Input {...field} placeholder="Número de contacto" />
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado activo</FormLabel>
                      <CardDescription>
                        Determina si el técnico está disponible para asignar a órdenes de servicio
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
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
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending
                  ? "Guardando..."
                  : "Guardar Técnico"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
