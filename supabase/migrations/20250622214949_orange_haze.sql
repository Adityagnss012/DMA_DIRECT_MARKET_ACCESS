/*
  # Enable Realtime for real-time notifications

  1. Enable Realtime
    - Enable realtime for notifications table
    - Enable realtime for orders table
    - Enable realtime for products table

  2. Security
    - Ensure RLS policies work with realtime subscriptions
*/

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE products;