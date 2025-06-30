/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `farmer_id` (uuid, references profiles.id)
      - `name` (text, not null)
      - `description` (text)
      - `price` (decimal, not null)
      - `quantity` (integer, not null)
      - `unit` (text, not null, default 'kg')
      - `category` (text, not null)
      - `image_url` (text)
      - `status` (enum: active/sold/inactive, default 'active')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for farmers to manage their own products
    - Add policy for public read access to active products
*/

-- Create enum for product status
CREATE TYPE product_status AS ENUM ('active', 'sold', 'inactive');

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price > 0),
  quantity integer NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'kg',
  category text NOT NULL,
  image_url text,
  status product_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Farmers can manage their own products"
  ON products
  FOR ALL
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE POLICY "Everyone can view active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Create trigger for updated_at
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_farmer_id_idx ON products(farmer_id);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at DESC);