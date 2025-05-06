
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { techniciansApi } from "@/services/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash } from "lucide-react";
import { Technician } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="notion-heading">Técnicos</h1>
        <Button 
          className="notion-button" 
          onClick={() => navigate("/technicians/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Técnico
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Técnicos</CardTitle>
          <div className="flex items-center py-2">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, especialidad, email o teléfono..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando técnicos...</div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? "No se encontraron técnicos con ese término de búsqueda." : "No hay técnicos registrados."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTechnicians.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell>{tech.specialty}</TableCell>
                      <TableCell>
                        {tech.email && <div>{tech.email}</div>}
                        {tech.phone && <div>{tech.phone}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tech.is_active ? "success" : "destructive"}>
                          {tech.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/technicians/${tech.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(tech)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al técnico <span className="font-semibold">{techToDelete?.name}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
