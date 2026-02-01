-- ============================================
-- PHARMACY ERP - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to create profile on user signup
-- NOTE: This needs to be set up via Supabase Dashboard > Database > Triggers
-- Or use Supabase Auth Hooks (recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
    );
    RETURN NEW;
END;
$$;

-- NOTE: Run this trigger creation SEPARATELY in Supabase SQL Editor
-- It requires being run as a superuser/service_role
-- Alternatively, create it via Dashboard > Database > Triggers
-- 
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CATEGORY TABLE
-- ============================================
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMPANY TABLE (Manufacturers/Brands)
-- ============================================
CREATE TABLE company (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_no VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- HSN CODE TABLE
-- ============================================
CREATE TABLE hsn_code (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DRUG SCHEDULE TABLE
-- ============================================
CREATE TABLE drug_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DRUG FORMULA TABLE (Salt/Composition)
-- ============================================
CREATE TABLE drug_formula (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PRODUCT TYPE TABLE
-- ============================================
CREATE TABLE product_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SUPPLIER TABLE
-- ============================================
CREATE TABLE supplier (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_no VARCHAR(20),
    drug_license_no VARCHAR(50),
    credit_days INTEGER DEFAULT 0,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CUSTOMER TABLE
-- ============================================
CREATE TABLE customer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_no VARCHAR(20),
    credit_days INTEGER DEFAULT 0,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PRODUCT TABLE
-- ============================================
CREATE TABLE product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES category(id),
    company_id UUID REFERENCES company(id),
    product_type_id UUID REFERENCES product_type(id),
    hsn_id UUID REFERENCES hsn_code(id),
    schedule_id UUID REFERENCES drug_schedule(id),
    formula_id UUID REFERENCES drug_formula(id),
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
    pack_size INTEGER DEFAULT 1,
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0,
    purchase_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    barcode VARCHAR(50),
    rack_location VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- BATCH TABLE (Stock lives here)
-- ============================================
CREATE TABLE batch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    batch_no VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    mfg_date DATE,
    purchase_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    available_qty INTEGER NOT NULL DEFAULT 0,
    reserved_qty INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, batch_no)
);

-- Index for FIFO selection
CREATE INDEX idx_batch_fifo ON batch(product_id, expiry_date, created_at) WHERE available_qty > 0 AND is_active = true;

-- ============================================
-- PURCHASE INVOICE TABLE
-- ============================================
CREATE TABLE purchase_invoice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    supplier_invoice_no VARCHAR(50),
    supplier_invoice_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    cgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    sgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    igst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_gst DECIMAL(15,2) NOT NULL DEFAULT 0,
    round_off DECIMAL(10,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    is_cancelled BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PURCHASE ITEM TABLE
-- ============================================
CREATE TABLE purchase_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoice(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id),
    batch_id UUID REFERENCES batch(id),
    batch_no VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    mfg_date DATE,
    qty INTEGER NOT NULL DEFAULT 0,
    free_qty INTEGER NOT NULL DEFAULT 0,
    total_qty INTEGER GENERATED ALWAYS AS (qty + free_qty) STORED,
    purchase_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    cgst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    sgst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    igst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    cgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    sgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    igst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SALES INVOICE TABLE
-- ============================================
CREATE TABLE sales_invoice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_time TIME NOT NULL DEFAULT CURRENT_TIME,
    customer_id UUID REFERENCES customer(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    cgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    sgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    igst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_gst DECIMAL(15,2) NOT NULL DEFAULT 0,
    round_off DECIMAL(10,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'card', 'upi', 'credit')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    is_cancelled BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SALES ITEM TABLE
-- ============================================
CREATE TABLE sales_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_invoice_id UUID NOT NULL REFERENCES sales_invoice(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id),
    batch_id UUID NOT NULL REFERENCES batch(id),
    batch_no VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    qty INTEGER NOT NULL DEFAULT 0,
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    cgst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    sgst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    igst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    cgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    sgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    igst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- STOCK LEDGER TABLE (Audit Trail)
-- ============================================
CREATE TABLE stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES product(id),
    batch_id UUID NOT NULL REFERENCES batch(id),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'purchase', 'purchase_return',
        'sale', 'sale_return',
        'adjustment_in', 'adjustment_out',
        'opening_stock', 'transfer'
    )),
    reference_type VARCHAR(30),
    reference_id UUID,
    qty_in INTEGER NOT NULL DEFAULT 0,
    qty_out INTEGER NOT NULL DEFAULT 0,
    balance_qty INTEGER NOT NULL DEFAULT 0,
    rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for stock ledger queries
CREATE INDEX idx_stock_ledger_product ON stock_ledger(product_id, created_at);
CREATE INDEX idx_stock_ledger_batch ON stock_ledger(batch_id, created_at);

-- ============================================
-- STOCK ADJUSTMENT TABLE
-- ============================================
CREATE TABLE stock_adjustment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adjustment_no VARCHAR(50) UNIQUE NOT NULL,
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('in', 'out')),
    reason VARCHAR(100) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stock_adjustment_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adjustment_id UUID NOT NULL REFERENCES stock_adjustment(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id),
    batch_id UUID NOT NULL REFERENCES batch(id),
    qty INTEGER NOT NULL DEFAULT 0,
    rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SEQUENCES FOR AUTO-NUMBERING
-- ============================================
CREATE SEQUENCE IF NOT EXISTS purchase_invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS sales_invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS stock_adjustment_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS supplier_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS customer_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS category_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS company_code_seq START 1;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate next invoice number
CREATE OR REPLACE FUNCTION generate_purchase_invoice_no()
RETURNS TEXT AS $$
BEGIN
    RETURN 'PI-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(nextval('purchase_invoice_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_sales_invoice_no()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SI-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(nextval('sales_invoice_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_adjustment_no()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ADJ-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(nextval('stock_adjustment_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate auto codes for masters
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'PRD' || LPAD(nextval('product_code_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SUP' || LPAD(nextval('supplier_code_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CUS' || LPAD(nextval('customer_code_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIFO BATCH SELECTION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_fifo_batches(
    p_product_id UUID,
    p_required_qty INTEGER
)
RETURNS TABLE (
    batch_id UUID,
    batch_no VARCHAR(50),
    expiry_date DATE,
    available_qty INTEGER,
    allocated_qty INTEGER,
    mrp DECIMAL(10,2),
    selling_rate DECIMAL(10,2)
) AS $$
DECLARE
    remaining_qty INTEGER := p_required_qty;
    batch_record RECORD;
BEGIN
    FOR batch_record IN
        SELECT
            b.id,
            b.batch_no,
            b.expiry_date,
            b.available_qty,
            b.mrp,
            b.selling_rate
        FROM batch b
        WHERE b.product_id = p_product_id
            AND b.available_qty > 0
            AND b.is_active = true
            AND b.expiry_date > CURRENT_DATE
        ORDER BY b.expiry_date ASC, b.created_at ASC
    LOOP
        IF remaining_qty <= 0 THEN
            EXIT;
        END IF;

        batch_id := batch_record.id;
        batch_no := batch_record.batch_no;
        expiry_date := batch_record.expiry_date;
        available_qty := batch_record.available_qty;
        mrp := batch_record.mrp;
        selling_rate := batch_record.selling_rate;

        IF batch_record.available_qty >= remaining_qty THEN
            allocated_qty := remaining_qty;
            remaining_qty := 0;
        ELSE
            allocated_qty := batch_record.available_qty;
            remaining_qty := remaining_qty - batch_record.available_qty;
        END IF;

        RETURN NEXT;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE TIMESTAMPS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_company_updated_at BEFORE UPDATE ON company FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hsn_code_updated_at BEFORE UPDATE ON hsn_code FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_drug_schedule_updated_at BEFORE UPDATE ON drug_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_drug_formula_updated_at BEFORE UPDATE ON drug_formula FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_type_updated_at BEFORE UPDATE ON product_type FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_supplier_updated_at BEFORE UPDATE ON supplier FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON customer FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_batch_updated_at BEFORE UPDATE ON batch FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_purchase_invoice_updated_at BEFORE UPDATE ON purchase_invoice FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sales_invoice_updated_at BEFORE UPDATE ON sales_invoice FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stock_adjustment_updated_at BEFORE UPDATE ON stock_adjustment FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert default HSN codes
INSERT INTO hsn_code (code, description, gst_percent) VALUES
('3004', 'Medicaments', 12),
('3003', 'Medicaments (not dosage form)', 12),
('3006', 'Pharmaceutical goods', 12),
('2106', 'Food preparations', 18),
('3401', 'Soap and organic surface-active', 18);

-- Insert default drug schedules
INSERT INTO drug_schedule (code, name, description) VALUES
('H', 'Schedule H', 'Prescription drugs'),
('H1', 'Schedule H1', 'Prescription drugs with special restrictions'),
('X', 'Schedule X', 'Narcotic and psychotropic substances'),
('G', 'Schedule G', 'Drugs requiring caution'),
('OTC', 'Over The Counter', 'Non-prescription drugs');

-- Insert default product types
INSERT INTO product_type (code, name) VALUES
('TAB', 'Tablet'),
('CAP', 'Capsule'),
('SYR', 'Syrup'),
('INJ', 'Injection'),
('CRM', 'Cream'),
('OIN', 'Ointment'),
('DRP', 'Drops'),
('PWD', 'Powder'),
('GEL', 'Gel'),
('SPR', 'Spray');

-- Insert default categories
INSERT INTO category (code, name) VALUES
('MED', 'Medicines'),
('OTC', 'OTC Products'),
('AYU', 'Ayurvedic'),
('HOM', 'Homeopathy'),
('SUR', 'Surgical'),
('COS', 'Cosmetics'),
('GEN', 'General');

COMMIT;
