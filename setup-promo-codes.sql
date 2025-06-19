-- Add Promo Code Support to Database
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. CREATE PROMO CODES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC NOT NULL,
    max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means no expiry
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) -- Who created this promo code
);

-- =============================================================================
-- 2. ADD PROMO CODE FIELDS TO PAYMENTS TABLE
-- =============================================================================

-- Add promo code related columns to payments table
DO $$ 
BEGIN
    -- Add promo_code column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'promo_code'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN promo_code TEXT;
    END IF;

    -- Add original_amount column  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'original_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN original_amount NUMERIC;
    END IF;

    -- Add discount_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN discount_amount NUMERIC DEFAULT 0;
    END IF;

    -- Add promo_code_id column for foreign key relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'promo_code_id'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN promo_code_id UUID REFERENCES public.promo_codes(id);
    END IF;
END $$;

-- =============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_dates ON public.promo_codes(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_payments_promo_code ON public.payments(promo_code);
CREATE INDEX IF NOT EXISTS idx_payments_promo_code_id ON public.payments(promo_code_id);

-- =============================================================================
-- 4. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
    code_input TEXT,
    original_amount_input NUMERIC
)
RETURNS TABLE (
    is_valid BOOLEAN,
    promo_id UUID,
    discount_amount NUMERIC,
    final_amount NUMERIC,
    error_message TEXT
) AS $$
DECLARE
    promo_record RECORD;
    calculated_discount NUMERIC;
    calculated_final NUMERIC;
BEGIN
    -- Find the promo code
    SELECT * INTO promo_record 
    FROM public.promo_codes 
    WHERE UPPER(code) = UPPER(code_input) 
    AND is_active = true;
    
    -- Check if promo code exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, original_amount_input, 'Promo code not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if promo code is within valid date range
    IF promo_record.valid_from > NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, original_amount_input, 'Promo code is not yet valid'::TEXT;
        RETURN;
    END IF;
    
    IF promo_record.valid_until IS NOT NULL AND promo_record.valid_until < NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, original_amount_input, 'Promo code has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check usage limits
    IF promo_record.max_uses IS NOT NULL AND promo_record.used_count >= promo_record.max_uses THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, original_amount_input, 'Promo code has reached maximum usage limit'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate discount
    IF promo_record.discount_type = 'percentage' THEN
        calculated_discount := (original_amount_input * promo_record.discount_value / 100);
    ELSE -- fixed_amount
        calculated_discount := promo_record.discount_value;
    END IF;
    
    -- Ensure discount doesn't exceed original amount
    IF calculated_discount > original_amount_input THEN
        calculated_discount := original_amount_input;
    END IF;
    
    calculated_final := original_amount_input - calculated_discount;
    
    -- Ensure final amount is not negative
    IF calculated_final < 0 THEN
        calculated_final := 0;
    END IF;
    
    RETURN QUERY SELECT true, promo_record.id, calculated_discount, calculated_final, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_code_usage(promo_code_id_input UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.promo_codes 
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = promo_code_id_input;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE RLS POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Service role can access all promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Users can view active promo codes" ON public.promo_codes;

-- Promo codes policies
CREATE POLICY "Admins can manage all promo codes" ON public.promo_codes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Service role can access all promo codes" ON public.promo_codes FOR ALL USING (auth.role() = 'service_role');

-- Allow users to view active promo codes for validation (read-only)
CREATE POLICY "Users can view active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true);

-- =============================================================================
-- 7. CREATE SAMPLE PROMO CODES
-- =============================================================================

-- Insert some sample promo codes
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, max_uses) VALUES
    ('WELCOME10', '10% off for new customers', 'percentage', 10, 100),
    ('SAVE20', '20 CHF off your order', 'fixed_amount', 20, 50),
    ('EARLYBIRD', '15% early bird discount', 'percentage', 15, NULL),
    ('HALFPRICE', '50% off special offer', 'percentage', 50, 10)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 8. GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(UUID) TO service_role;

-- Grant table permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- PROMO CODE SETUP COMPLETE!
-- =============================================================================

-- Available promo codes for testing:
-- - WELCOME10: 10% off (max 100 uses)
-- - SAVE20: 20 CHF off (max 50 uses)  
-- - EARLYBIRD: 15% off (unlimited uses)
-- - HALFPRICE: 50% off (max 10 uses)

-- To test the validation function:
-- SELECT * FROM validate_promo_code('WELCOME10', 99);

SELECT 'Promo code system setup completed successfully!' as status;
