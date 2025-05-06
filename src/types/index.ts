
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplianceType {
  id: string;
  name: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  client_id: string;
  appliance_type: string;
  brand_id: string;
  model: string | null;
  serial_number: string | null;
  problem_description: string;
  observations: string | null;
  service_type: string;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ServicePart {
  id: string;
  order_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface ServiceLabor {
  id: string;
  order_id: string;
  description: string;
  hours: number;
  rate: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  order_id: string;
  date: string;
  time_slot: string;
  technician: string | null;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}
