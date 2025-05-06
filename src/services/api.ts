
import { supabase } from "@/integrations/supabase/client";
import { Client, ApplianceType, Brand, ServiceOrder, ServicePart, ServiceLabor, Appointment } from "@/types";
import { toast } from "@/hooks/use-toast";

// Client API
export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del cliente",
        variant: "destructive",
      });
      return null;
    }
    
    return data;
  },
  
  create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> => {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Éxito",
      description: "Cliente creado correctamente",
    });
    
    return data;
  },
  
  update: async (id: string, client: Partial<Client>): Promise<Client | null> => {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...client,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Éxito",
      description: "Cliente actualizado correctamente",
    });
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Éxito",
      description: "Cliente eliminado correctamente",
    });
    
    return true;
  }
};

// Appliance Types API
export const applianceTypesApi = {
  getAll: async (): Promise<ApplianceType[]> => {
    const { data, error } = await supabase
      .from('appliance_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching appliance types:', error);
      return [];
    }
    
    return data || [];
  },
};

// Brands API
export const brandsApi = {
  getAll: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
    
    return data || [];
  },
};

// Service Orders API
export const serviceOrdersApi = {
  getAll: async (): Promise<ServiceOrder[]> => {
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching service orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes de servicio",
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<ServiceOrder | null> => {
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching service order:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la orden de servicio",
        variant: "destructive",
      });
      return null;
    }
    
    return data;
  },
  
  create: async (order: Omit<ServiceOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<ServiceOrder | null> => {
    const { data, error } = await supabase
      .from('service_orders')
      .insert([{ ...order, order_number: null }]) // Trigger will generate order_number
      .select()
      .single();
    
    if (error) {
      console.error('Error creating service order:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la orden de servicio",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Éxito",
      description: "Orden de servicio creada correctamente",
    });
    
    return data;
  },
  
  update: async (id: string, order: Partial<ServiceOrder>): Promise<ServiceOrder | null> => {
    const { data, error } = await supabase
      .from('service_orders')
      .update({
        ...order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating service order:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la orden de servicio",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Éxito",
      description: "Orden de servicio actualizada correctamente",
    });
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service order:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden de servicio",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Éxito",
      description: "Orden de servicio eliminada correctamente",
    });
    
    return true;
  },
  
  getServiceParts: async (orderId: string): Promise<ServicePart[]> => {
    const { data, error } = await supabase
      .from('service_parts')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) {
      console.error('Error fetching service parts:', error);
      return [];
    }
    
    return data || [];
  },
  
  addServicePart: async (part: Omit<ServicePart, 'id' | 'created_at'>): Promise<ServicePart | null> => {
    const { data, error } = await supabase
      .from('service_parts')
      .insert([part])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding service part:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el repuesto",
        variant: "destructive",
      });
      return null;
    }
    
    return data;
  },
  
  deleteServicePart: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('service_parts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service part:', error);
      return false;
    }
    
    return true;
  },
  
  getServiceLabor: async (orderId: string): Promise<ServiceLabor[]> => {
    const { data, error } = await supabase
      .from('service_labor')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) {
      console.error('Error fetching service labor:', error);
      return [];
    }
    
    return data || [];
  },
  
  addServiceLabor: async (labor: Omit<ServiceLabor, 'id' | 'created_at'>): Promise<ServiceLabor | null> => {
    const { data, error } = await supabase
      .from('service_labor')
      .insert([labor])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding service labor:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el trabajo",
        variant: "destructive",
      });
      return null;
    }
    
    return data;
  },
  
  deleteServiceLabor: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('service_labor')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service labor:', error);
      return false;
    }
    
    return true;
  }
};

// Appointments API
export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  },
  
  getByOrderId: async (orderId: string): Promise<Appointment | null> => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }
    
    return data;
  },
  
  create: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Éxito",
      description: "Cita creada correctamente",
    });
    
    return data;
  },
  
  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment | null> => {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...appointment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Éxito",
      description: "Cita actualizada correctamente",
    });
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Éxito",
      description: "Cita eliminada correctamente",
    });
    
    return true;
  }
};
