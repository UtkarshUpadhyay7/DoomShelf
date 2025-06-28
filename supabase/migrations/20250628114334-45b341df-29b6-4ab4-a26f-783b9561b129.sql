
-- Create products table to store inventory items
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  barcode TEXT,
  expiry_date DATE NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  supplier TEXT,
  alert_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_products_expiry_date ON public.products(expiry_date);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL;

-- Enable Row Level Security (RLS) - for now, allow public access since no auth is implemented
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (will be updated when auth is added)
CREATE POLICY "Allow all operations on products" ON public.products
FOR ALL USING (true) WITH CHECK (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
