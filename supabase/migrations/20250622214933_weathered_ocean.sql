/*
  # Create triggers for order notifications

  1. Functions
    - Function to create notifications when orders are created/updated
    - Function to update product quantity when orders are confirmed

  2. Triggers
    - Trigger on orders table for notifications
    - Trigger on orders table for inventory management
*/

-- Function to create order notifications
CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER AS $$
DECLARE
  farmer_id uuid;
  buyer_name text;
  product_name text;
BEGIN
  -- Get farmer_id and product details
  SELECT p.farmer_id, p.name INTO farmer_id, product_name
  FROM products p
  WHERE p.id = NEW.product_id;

  -- Get buyer name
  SELECT full_name INTO buyer_name
  FROM profiles
  WHERE id = NEW.buyer_id;

  -- Create notification for farmer when new order is placed
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      farmer_id,
      'new_order',
      'New Order Received',
      buyer_name || ' has placed an order for ' || product_name,
      jsonb_build_object('order_id', NEW.id, 'product_id', NEW.product_id)
    );

    -- Create notification for buyer confirming order placement
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.buyer_id,
      'order_placed',
      'Order Placed Successfully',
      'Your order for ' || product_name || ' has been placed',
      jsonb_build_object('order_id', NEW.id, 'product_id', NEW.product_id)
    );
  END IF;

  -- Create notifications for status updates
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify buyer of status change
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.buyer_id,
      'order_status_update',
      'Order Status Updated',
      'Your order for ' || product_name || ' is now ' || NEW.status,
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
    );

    -- Notify farmer of status change (except for farmer-initiated changes)
    IF NEW.status IN ('cancelled') THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        farmer_id,
        'order_status_update',
        'Order Status Updated',
        'Order for ' || product_name || ' is now ' || NEW.status,
        jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update product quantity when order is confirmed
CREATE OR REPLACE FUNCTION update_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes to confirmed, reduce product quantity
  IF TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    UPDATE products
    SET quantity = quantity - NEW.quantity,
        status = CASE 
          WHEN quantity - NEW.quantity <= 0 THEN 'sold'::product_status
          ELSE status
        END
    WHERE id = NEW.product_id;
  END IF;

  -- When order is cancelled, restore product quantity
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    UPDATE products
    SET quantity = quantity + NEW.quantity,
        status = CASE 
          WHEN status = 'sold' AND quantity + NEW.quantity > 0 THEN 'active'::product_status
          ELSE status
        END
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER order_notification_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_notification();

CREATE TRIGGER order_quantity_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_quantity();