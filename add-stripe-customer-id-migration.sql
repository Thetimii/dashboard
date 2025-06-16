-- Add stripe_customer_id column to payments table
ALTER TABLE payments ADD COLUMN stripe_customer_id text;

-- Update the existing check constraint to maintain data integrity
-- No need to recreate since we're only adding a nullable column
