import { supabase } from "@/integrations/supabase/client";
import { Client, ApplianceType, Brand, ServiceOrder, ServicePart, ServiceLabor, Appointment, Technician } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Helper to get toast outside components
const toastMessage = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  // For server-side or non-component contexts
  console.log(`${variant}: ${title} - ${description}`);
};

// Client API
export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching clients:', error);
      toastMessage("Error", "No se pudieron cargar los clientes", "destructive");
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
      toastMessage("Error", "No se pudo cargar la información del cliente", "destructive");
      return null;
    }
    
    return data;
  },
  
  create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> => {
    // Make sure required fields exist and aren't undefined
    if (!client.name) {
      toastMessage("Error", "El nombre del cliente es obligatorio", "destructive");
      return null;
    }
    
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      toastMessage("Error", "No se pudo crear el cliente", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Cliente creado correctamente");
    
    return data;
  },
  
  update: async (id: string, client: Partial<Client>): Promise<Client | null> => {
    // Make sure required fields exist and aren't undefined
    if (client.name === undefined || client.name === "") {
      toastMessage("Error", "El nombre del cliente es obligatorio", "destructive");
      return null;
    }
    
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
      toastMessage("Error", "No se pudo actualizar el cliente", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Cliente actualizado correctamente");
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      toastMessage("Error", "No se pudo eliminar el cliente", "destructive");
      return false;
    }
    
    toastMessage("Éxito", "Cliente eliminado correctamente");
    
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
  
  create: async (applianceType: { name: string }): Promise<ApplianceType | null> => {
    const { data, error } = await supabase
      .from('appliance_types')
      .insert([applianceType])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating appliance type:', error);
      toastMessage("Error", "No se pudo crear el tipo de electrodoméstico", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Tipo de electrodoméstico creado correctamente");
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('appliance_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting appliance type:', error);
      toastMessage("Error", "No se pudo eliminar el tipo de electrodoméstico", "destructive");
      return false;
    }
    
    toastMessage("Éxito", "Tipo de electrodoméstico eliminado correctamente");
    
    return true;
  }
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
  
  create: async (brand: { name: string }): Promise<Brand | null> => {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating brand:', error);
      toastMessage("Error", "No se pudo crear la marca", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Marca creada correctamente");
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting brand:', error);
      toastMessage("Error", "No se pudo eliminar la marca", "destructive");
      return false;
    }
    
    toastMessage("Éxito", "Marca eliminada correctamente");
    
    return true;
  }
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
      toastMessage("Error", "No se pudieron cargar las órdenes de servicio", "destructive");
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
      toastMessage("Error", "No se pudo cargar la información de la orden de servicio", "destructive");
      return null;
    }
    
    return data;
  },
  
  create: async (order: Omit<ServiceOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<ServiceOrder | null> => {
    // Validate required fields
    if (!order.client_id || !order.appliance_type || !order.brand_id || !order.problem_description || !order.service_type || !order.urgency || !order.status) {
      toastMessage("Error", "Faltan campos obligatorios", "destructive");
      return null;
    }
    
    const { data, error } = await supabase
      .from('service_orders')
      .insert([{ ...order, order_number: null }]) // Trigger will generate order_number
      .select()
      .single();
    
    if (error) {
      console.error('Error creating service order:', error);
      toastMessage("Error", "No se pudo crear la orden de servicio", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Orden de servicio creada correctamente");
    
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
      toastMessage("Error", "No se pudo actualizar la orden de servicio", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Orden de servicio actualizada correctamente");
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service order:', error);
      toastMessage("Error", "No se pudo eliminar la orden de servicio", "destructive");
      return false;
    }
    
    toastMessage("Éxito", "Orden de servicio eliminada correctamente");
    
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
      toastMessage("Error", "No se pudo agregar el repuesto", "destructive");
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
      toastMessage("Error", "No se pudo agregar el trabajo", "destructive");
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
      toastMessage("Error", "No se pudieron cargar las citas", "destructive");
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
      toastMessage("Error", "No se pudo crear la cita", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Cita creada correctamente");
    
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
      toastMessage("Error", "No se pudo actualizar la cita", "destructive");
      return null;
    }
    
    toastMessage("Éxito", "Cita actualizada correctamente");
    
    return data;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting appointment:', error);
      toastMessage("Error", "No se pudo eliminar la cita", "destructive");
      return false;
    }
    
    toastMessage("Éxito", "Cita eliminada correctamente");
    
    return true;
  }
};

// Technicians API
export const techniciansApi = {
  getAll: async (): Promise<Technician[]> => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching technicians:', error);
        toastMessage("Error", "No se pudieron cargar los técnicos", "destructive");
        return [];
      }
      
      return data as Technician[] || [];
    } catch (error) {
      console.error('Error in technicians getAll:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Technician | null> => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching technician:', error);
        toastMessage("Error", "No se pudo cargar la información del técnico", "destructive");
        return null;
      }
      
      return data as Technician;
    } catch (error) {
      console.error('Error in technician getById:', error);
      return null;
    }
  },
  
  create: async (technician: Omit<Technician, 'id' | 'created_at'>): Promise<Technician | null> => {
    try {
      if (!technician.name || !technician.specialty) {
        toastMessage("Error", "El nombre y la especialidad son obligatorios", "destructive");
        return null;
      }
      
      const { data, error } = await supabase
        .from('technicians')
        .insert([technician])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating technician:', error);
        toastMessage("Error", "No se pudo crear el técnico", "destructive");
        return null;
      }
      
      toastMessage("Éxito", "Técnico creado correctamente");
      
      return data as Technician;
    } catch (error) {
      console.error('Error in technician create:', error);
      return null;
    }
  },
  
  update: async (id: string, technician: Partial<Technician>): Promise<Technician | null> => {
    try {
      // Ensure name and specialty are present if they're being updated
      if ((technician.name !== undefined && !technician.name) || 
          (technician.specialty !== undefined && !technician.specialty)) {
        toastMessage("Error", "El nombre y la especialidad son obligatorios", "destructive");
        return null;
      }
      
      const { data, error } = await supabase
        .from('technicians')
        .update(technician)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating technician:', error);
        toastMessage("Error", "No se pudo actualizar el técnico", "destructive");
        return null;
      }
      
      toastMessage("Éxito", "Técnico actualizado correctamente");
      
      return data as Technician;
    } catch (error) {
      console.error('Error in technician update:', error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting technician:', error);
        toastMessage("Error", "No se pudo eliminar el técnico", "destructive");
        return false;
      }
      
      toastMessage("Éxito", "Técnico eliminado correctamente");
      
      return true;
    } catch (error) {
      console.error('Error in technician delete:', error);
      return false;
    }
  }
};
