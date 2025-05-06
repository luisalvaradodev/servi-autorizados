
-- Create the technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add some initial data
INSERT INTO public.technicians (name, specialty, is_active)
VALUES 
  ('Carlos Méndez', 'Refrigeración y Lavadoras', TRUE),
  ('Miguel Ángel Soto', 'Estufas y Hornos', TRUE),
  ('Laura Ramírez', 'Electrodomésticos Pequeños', TRUE);
