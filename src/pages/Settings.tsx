import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applianceTypesApi, brandsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Save, Building2, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [newApplianceType, setNewApplianceType] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [typeToDelete, setTypeToDelete] = useState<{id: string, name: string} | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<{id: string, name: string} | null>(null);
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
      setTypeToDelete(null);
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
      setBrandToDelete(null);
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
  
  const confirmDeleteType = (id: string, name: string) => {
    setTypeToDelete({ id, name });
  };
  
  const confirmDeleteBrand = (id: string, name: string) => {
    setBrandToDelete({ id, name });
  };
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Configuración" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2"
          >
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="catalog" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>
                  Configura la información básica de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-sm">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    defaultValue="ServiAutorizados"
                    placeholder="Nombre de tu empresa"
                    className="transition-all"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="companyAddress" className="text-sm">Dirección</Label>
                  <Input
                    id="companyAddress"
                    defaultValue="Av. Tecnología 567, Col. Industrial"
                    placeholder="Dirección física"
                    className="transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="companyPhone" className="text-sm">Teléfono</Label>
                    <Input
                      id="companyPhone"
                      defaultValue="555-987-6543"
                      placeholder="Número de contacto"
                      className="transition-all"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="companyEmail" className="text-sm">Correo Electrónico</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      defaultValue="contacto@ServiAutorizados.com"
                      placeholder="correo@tuempresa.com"
                      className="transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="companyWebsite" className="text-sm">Sitio Web</Label>
                  <Input
                    id="companyWebsite"
                    defaultValue="www.ServiAutorizados.com"
                    placeholder="www.tuempresa.com"
                    className="transition-all"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-4 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="catalog">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle>Tipos de Electrodomésticos</CardTitle>
                  <CardDescription>
                    Administra los tipos de electrodomésticos disponibles en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Input
                      placeholder="Nuevo tipo de electrodoméstico..."
                      value={newApplianceType}
                      onChange={(e) => setNewApplianceType(e.target.value)}
                      className="transition-all"
                    />
                    <Button 
                      onClick={handleAddApplianceType} 
                      disabled={createApplianceTypeMutation.isPending}
                      className="shrink-0 gap-2"
                    >
                      {createApplianceTypeMutation.isPending && (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent"></span>
                      )}
                      <Plus className={`h-4 w-4 ${createApplianceTypeMutation.isPending ? 'hidden' : ''}`} />
                      Agregar
                    </Button>
                  </div>
                  
                  {isLoadingApplianceTypes ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-muted-foreground text-sm">Cargando...</p>
                      </div>
                    </div>
                  ) : applianceTypes.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 rounded-md">
                      <Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="text-muted-foreground">
                        No hay tipos de electrodomésticos registrados.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applianceTypes.map((type) => (
                            <TableRow key={type.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{type.name}</TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de electrodoméstico <span className="font-bold">{type.name}</span>.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deleteApplianceTypeMutation.mutate(type.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle>Marcas</CardTitle>
                  <CardDescription>
                    Administra las marcas de electrodomésticos disponibles en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Input
                      placeholder="Nueva marca..."
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="transition-all"
                    />
                    <Button 
                      onClick={handleAddBrand} 
                      disabled={createBrandMutation.isPending}
                      className="shrink-0 gap-2"
                    >
                      {createBrandMutation.isPending && (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent"></span>
                      )}
                      <Plus className={`h-4 w-4 ${createBrandMutation.isPending ? 'hidden' : ''}`} />
                      Agregar
                    </Button>
                  </div>
                  
                  {isLoadingBrands ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-muted-foreground text-sm">Cargando...</p>
                      </div>
                    </div>
                  ) : brands.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 rounded-md">
                      <Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="text-muted-foreground">
                        No hay marcas registradas.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {brands.map((brand) => (
                            <TableRow key={brand.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{brand.name}</TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la marca <span className="font-bold">{brand.name}</span>.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deleteBrandMutation.mutate(brand.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}