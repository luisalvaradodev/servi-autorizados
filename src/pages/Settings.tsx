
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applianceTypesApi, brandsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [newApplianceType, setNewApplianceType] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch appliance types
  const { 
    data: applianceTypes = [], 
    isLoading: isLoadingApplianceTypes 
  } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });
  
  // Fetch brands
  const { 
    data: brands = [], 
    isLoading: isLoadingBrands 
  } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });
  
  // Create appliance type mutation
  const createApplianceTypeMutation = useMutation({
    mutationFn: (name: string) => applianceTypesApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applianceTypes"] });
      setNewApplianceType("");
      toast({
        title: "Éxito",
        description: "Tipo de electrodoméstico creado correctamente",
      });
    },
  });
  
  // Delete appliance type mutation
  const deleteApplianceTypeMutation = useMutation({
    mutationFn: (id: string) => applianceTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applianceTypes"] });
      toast({
        title: "Éxito",
        description: "Tipo de electrodoméstico eliminado correctamente",
      });
    },
  });
  
  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (name: string) => brandsApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setNewBrand("");
      toast({
        title: "Éxito",
        description: "Marca creada correctamente",
      });
    },
  });
  
  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({
        title: "Éxito",
        description: "Marca eliminada correctamente",
      });
    },
  });
  
  const handleAddApplianceType = () => {
    if (newApplianceType.trim()) {
      createApplianceTypeMutation.mutate(newApplianceType);
    } else {
      toast({
        title: "Error",
        description: "El nombre del tipo de electrodoméstico no puede estar vacío",
        variant: "destructive",
      });
    }
  };
  
  const handleAddBrand = () => {
    if (newBrand.trim()) {
      createBrandMutation.mutate(newBrand);
    } else {
      toast({
        title: "Error",
        description: "El nombre de la marca no puede estar vacío",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="notion-heading">Configuración</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Configura la información básica de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  defaultValue="ServiceScribe"
                  placeholder="Nombre de tu empresa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Dirección</Label>
                <Input
                  id="companyAddress"
                  defaultValue="Av. Tecnología 567, Col. Industrial"
                  placeholder="Dirección física"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono</Label>
                  <Input
                    id="companyPhone"
                    defaultValue="555-987-6543"
                    placeholder="Número de contacto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Correo Electrónico</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    defaultValue="contacto@servicescribe.com"
                    placeholder="correo@tuempresa.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Sitio Web</Label>
                <Input
                  id="companyWebsite"
                  defaultValue="www.servicescribe.com"
                  placeholder="www.tuempresa.com"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="catalog" className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Electrodomésticos</CardTitle>
              <CardDescription>
                Administra los tipos de electrodomésticos disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nuevo tipo de electrodoméstico..."
                  value={newApplianceType}
                  onChange={(e) => setNewApplianceType(e.target.value)}
                />
                <Button onClick={handleAddApplianceType} disabled={createApplianceTypeMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
              
              {isLoadingApplianceTypes ? (
                <div className="text-center py-4">Cargando...</div>
              ) : applianceTypes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay tipos de electrodomésticos registrados.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applianceTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteApplianceTypeMutation.mutate(type.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Marcas</CardTitle>
              <CardDescription>
                Administra las marcas de electrodomésticos disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nueva marca..."
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                />
                <Button onClick={handleAddBrand} disabled={createBrandMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
              
              {isLoadingBrands ? (
                <div className="text-center py-4">Cargando...</div>
              ) : brands.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay marcas registradas.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>{brand.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBrandMutation.mutate(brand.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
