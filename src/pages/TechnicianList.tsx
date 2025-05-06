import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { techniciansApi } from "@/services/api";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash } from "lucide-react";
import { Technician } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function TechnicianList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [techToDelete, setTechToDelete] = useState<Technician | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch technicians
  const { data: technicians = [], isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: techniciansApi.getAll,
  });
  
  // Delete technician mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => techniciansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Técnico eliminado",
        description: "El técnico ha sido eliminado correctamente"
      });
    },
  });
  
  // Filter technicians based on search term
  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tech.email && tech.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tech.phone && tech.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const confirmDelete = (tech: Technician) => {
    setTechToDelete(tech);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (techToDelete) {
      deleteMutation.mutate(techToDelete.id);
    }
  };
  
  const columns = [
    {
      header: "Nombre",
      accessorKey: "name",
      cell: (item: any) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      header: "Especialidad",
      accessorKey: "specialty",
    },
    {
      header: "Contacto",
      cell: (item: any) => (
        <div className="space-y-1">
          {item.email && (
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground mr-2">Email:</span>
              {item.email}
            </div>
          )}
          {item.phone && (
            <div className="text-sm flex items-center">
              <span className="text-muted-foreground mr-2">Tel:</span>
              {item.phone}
            </div>
          )}
          {!item.email && !item.phone && (
            <div className="text-sm text-muted-foreground italic">Sin información de contacto</div>
          )}
        </div>
      ),
    },
    {
      header: "Estado",
      cell: (item: any) => (
        <Badge variant={item.is_active ? "default" : "destructive"} className="capitalize">
          {item.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      cell: (item: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/technicians/${item.id}/edit`)}
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => confirmDelete(item)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Técnicos">
        <Button 
          onClick={() => navigate("/technicians/new")}
          className="h-9 gap-1"
        >
          <Plus className="h-4 w-4" />
          Nuevo Técnico
        </Button>
      </SectionHeader>

      <Card className="border-border">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="text-lg flex items-center">
            <div className="relative flex-1 mr-auto w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, especialidad, email o teléfono..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 transition-all w-full h-9"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DataTable
              columns={columns}
              data={filteredTechnicians}
              isLoading={isLoading}
              noDataMessage={searchTerm 
                ? "No se encontraron técnicos con ese término de búsqueda." 
                : "No hay técnicos registrados."
              }
              keyExtractor={(item) => item.id}
            />
          </motion.div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar al técnico <span className="font-semibold">{techToDelete?.name}</span>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
              )}
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}