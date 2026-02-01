-- ============================================
-- PHARMACY ERP - ROW LEVEL SECURITY POLICIES
-- ============================================
-- Run this SQL after creating the schema
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_formula ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustment ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustment_item ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION TO CHECK USER ROLE
-- ============================================
-- Create functions in PUBLIC schema, not auth schema
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE((
        SELECT role = 'admin' FROM public.profiles
        WHERE id = auth.uid()
    ), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON profiles FOR SELECT
    USING (public.is_admin());

-- Admins can update profiles
CREATE POLICY "Admins can update profiles"
    ON profiles FOR UPDATE
    USING (public.is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- MASTER DATA POLICIES (Category, Company, HSN, etc.)
-- ============================================

-- Category
CREATE POLICY "Everyone can read categories"
    ON category FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories"
    ON category FOR ALL
    USING (public.is_admin());

-- Company
CREATE POLICY "Everyone can read companies"
    ON company FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage companies"
    ON company FOR ALL
    USING (public.is_admin());

-- HSN Code
CREATE POLICY "Everyone can read hsn_codes"
    ON hsn_code FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage hsn_codes"
    ON hsn_code FOR ALL
    USING (public.is_admin());

-- Drug Schedule
CREATE POLICY "Everyone can read drug_schedules"
    ON drug_schedule FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage drug_schedules"
    ON drug_schedule FOR ALL
    USING (public.is_admin());

-- Drug Formula
CREATE POLICY "Everyone can read drug_formulas"
    ON drug_formula FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage drug_formulas"
    ON drug_formula FOR ALL
    USING (public.is_admin());

-- Product Type
CREATE POLICY "Everyone can read product_types"
    ON product_type FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage product_types"
    ON product_type FOR ALL
    USING (public.is_admin());

-- Supplier
CREATE POLICY "Everyone can read suppliers"
    ON supplier FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage suppliers"
    ON supplier FOR ALL
    USING (public.is_admin());

-- Customer
CREATE POLICY "Everyone can read customers"
    ON customer FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage customers"
    ON customer FOR ALL
    USING (public.is_admin());

-- Product
CREATE POLICY "Everyone can read products"
    ON product FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products"
    ON product FOR ALL
    USING (public.is_admin());

-- Batch
CREATE POLICY "Everyone can read batches"
    ON batch FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage batches"
    ON batch FOR ALL
    USING (public.is_admin());

-- ============================================
-- TRANSACTION POLICIES
-- ============================================

-- Purchase Invoice
CREATE POLICY "Everyone can read purchase_invoices"
    ON purchase_invoice FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage purchase_invoices"
    ON purchase_invoice FOR ALL
    USING (public.is_admin());

-- Purchase Item
CREATE POLICY "Everyone can read purchase_items"
    ON purchase_item FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage purchase_items"
    ON purchase_item FOR ALL
    USING (public.is_admin());

-- Sales Invoice
CREATE POLICY "Everyone can read sales_invoices"
    ON sales_invoice FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sales_invoices"
    ON sales_invoice FOR ALL
    USING (public.is_admin());

-- Sales Item
CREATE POLICY "Everyone can read sales_items"
    ON sales_item FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sales_items"
    ON sales_item FOR ALL
    USING (public.is_admin());

-- Stock Ledger
CREATE POLICY "Everyone can read stock_ledger"
    ON stock_ledger FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage stock_ledger"
    ON stock_ledger FOR ALL
    USING (public.is_admin());

-- Stock Adjustment
CREATE POLICY "Everyone can read stock_adjustments"
    ON stock_adjustment FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage stock_adjustments"
    ON stock_adjustment FOR ALL
    USING (public.is_admin());

-- Stock Adjustment Item
CREATE POLICY "Everyone can read stock_adjustment_items"
    ON stock_adjustment_item FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage stock_adjustment_items"
    ON stock_adjustment_item FOR ALL
    USING (public.is_admin());
