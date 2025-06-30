/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `buyer_id` (uuid, references profiles.id)
      - `product_id` (uuid, references products.id)
      - `quantity` (integer, not null)
      - `total_price` (decimal, not null)
      - `status` (enum: pending/confirmed/shipped/delivered/cancelled)
      - `payment_status` (enum: pending/completed/failed/refunded)
      - `stripe_payment_intent_id` (text)
      - `delivery_address` (text, not null)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for buyers to view their own orders
    - Add policies for farmers to view orders for their products
    - Add policy for order management
*/

-- Create enums for order status
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price > 0),
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id text,
  delivery_address text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Buyers can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Farmers can view orders for their products"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = orders.product_id 
      AND products.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Farmers can update orders for their products"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = orders.product_id 
      AND products.farmer_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_product_id_idx ON orders(product_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);