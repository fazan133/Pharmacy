export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'staff';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: UserRole;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      category: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
          updated_at?: string;
        };
      };
      company: {
        Row: {
          id: string;
          code: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          gst_no: string | null;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          gst_no?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          gst_no?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      hsn_code: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          gst_percent: number;
          cgst_percent: number;
          sgst_percent: number;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          gst_percent?: number;
          cgst_percent?: number;
          sgst_percent?: number;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          description?: string | null;
          gst_percent?: number;
          cgst_percent?: number;
          sgst_percent?: number;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      drug_schedule: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      drug_formula: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      product_type: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      supplier: {
        Row: {
          id: string;
          code: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          gst_no: string | null;
          drug_license_no: string | null;
          credit_days: number;
          credit_limit: number;
          opening_balance: number;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          gst_no?: string | null;
          drug_license_no?: string | null;
          credit_days?: number;
          credit_limit?: number;
          opening_balance?: number;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          gst_no?: string | null;
          drug_license_no?: string | null;
          credit_days?: number;
          credit_limit?: number;
          opening_balance?: number;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      customer: {
        Row: {
          id: string;
          code: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          gst_no: string | null;
          credit_days: number;
          credit_limit: number;
          opening_balance: number;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          gst_no?: string | null;
          credit_days?: number;
          credit_limit?: number;
          opening_balance?: number;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          gst_no?: string | null;
          credit_days?: number;
          credit_limit?: number;
          opening_balance?: number;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      product: {
        Row: {
          id: string;
          code: string;
          name: string;
          category_id: string | null;
          company_id: string | null;
          product_type_id: string | null;
          hsn_id: string | null;
          schedule_id: string | null;
          formula_id: string | null;
          unit: string;
          pack_size: number;
          mrp: number;
          purchase_rate: number;
          selling_rate: number;
          gst_percent: number;
          min_stock: number;
          max_stock: number;
          reorder_level: number;
          barcode: string | null;
          rack_location: string | null;
          image_url: string | null;
          is_active: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          category_id?: string | null;
          company_id?: string | null;
          product_type_id?: string | null;
          hsn_id?: string | null;
          schedule_id?: string | null;
          formula_id?: string | null;
          unit?: string;
          pack_size?: number;
          mrp?: number;
          purchase_rate?: number;
          selling_rate?: number;
          gst_percent?: number;
          min_stock?: number;
          max_stock?: number;
          reorder_level?: number;
          barcode?: string | null;
          rack_location?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          category_id?: string | null;
          company_id?: string | null;
          product_type_id?: string | null;
          hsn_id?: string | null;
          schedule_id?: string | null;
          formula_id?: string | null;
          unit?: string;
          pack_size?: number;
          mrp?: number;
          purchase_rate?: number;
          selling_rate?: number;
          gst_percent?: number;
          min_stock?: number;
          max_stock?: number;
          reorder_level?: number;
          barcode?: string | null;
          rack_location?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_hidden?: boolean;
        };
      };
      batch: {
        Row: {
          id: string;
          product_id: string;
          batch_no: string;
          expiry_date: string;
          mfg_date: string | null;
          purchase_rate: number;
          mrp: number;
          selling_rate: number;
          available_qty: number;
          reserved_qty: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          batch_no: string;
          expiry_date: string;
          mfg_date?: string | null;
          purchase_rate?: number;
          mrp?: number;
          selling_rate?: number;
          available_qty?: number;
          reserved_qty?: number;
          is_active?: boolean;
        };
        Update: {
          product_id?: string;
          batch_no?: string;
          expiry_date?: string;
          mfg_date?: string | null;
          purchase_rate?: number;
          mrp?: number;
          selling_rate?: number;
          available_qty?: number;
          reserved_qty?: number;
          is_active?: boolean;
        };
      };
      purchase_invoice: {
        Row: {
          id: string;
          invoice_no: string;
          invoice_date: string;
          supplier_id: string;
          supplier_invoice_no: string | null;
          supplier_invoice_date: string | null;
          subtotal: number;
          discount_amount: number;
          discount_percent: number;
          taxable_amount: number;
          cgst_amount: number;
          sgst_amount: number;
          igst_amount: number;
          total_gst: number;
          round_off: number;
          grand_total: number;
          paid_amount: number;
          balance_amount: number;
          payment_status: 'pending' | 'partial' | 'paid';
          notes: string | null;
          created_by: string | null;
          is_cancelled: boolean;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_no: string;
          invoice_date?: string;
          supplier_id: string;
          supplier_invoice_no?: string | null;
          supplier_invoice_date?: string | null;
          subtotal?: number;
          discount_amount?: number;
          discount_percent?: number;
          taxable_amount?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          round_off?: number;
          grand_total?: number;
          paid_amount?: number;
          balance_amount?: number;
          payment_status?: 'pending' | 'partial' | 'paid';
          notes?: string | null;
          created_by?: string | null;
          is_cancelled?: boolean;
        };
        Update: {
          invoice_no?: string;
          invoice_date?: string;
          supplier_id?: string;
          supplier_invoice_no?: string | null;
          supplier_invoice_date?: string | null;
          subtotal?: number;
          discount_amount?: number;
          discount_percent?: number;
          taxable_amount?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          round_off?: number;
          grand_total?: number;
          paid_amount?: number;
          balance_amount?: number;
          payment_status?: 'pending' | 'partial' | 'paid';
          notes?: string | null;
          is_cancelled?: boolean;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
        };
      };
      purchase_item: {
        Row: {
          id: string;
          purchase_invoice_id: string;
          product_id: string;
          batch_id: string | null;
          batch_no: string;
          expiry_date: string;
          mfg_date: string | null;
          qty: number;
          free_qty: number;
          total_qty: number;
          purchase_rate: number;
          mrp: number;
          discount_percent: number;
          discount_amount: number;
          taxable_amount: number;
          gst_percent: number;
          cgst_percent: number;
          sgst_percent: number;
          igst_percent: number;
          cgst_amount: number;
          sgst_amount: number;
          igst_amount: number;
          total_gst: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_invoice_id: string;
          product_id: string;
          batch_id?: string | null;
          batch_no: string;
          expiry_date: string;
          mfg_date?: string | null;
          qty?: number;
          free_qty?: number;
          purchase_rate?: number;
          mrp?: number;
          discount_percent?: number;
          discount_amount?: number;
          taxable_amount?: number;
          gst_percent?: number;
          cgst_percent?: number;
          sgst_percent?: number;
          igst_percent?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          total_amount?: number;
        };
        Update: {
          product_id?: string;
          batch_id?: string | null;
          batch_no?: string;
          expiry_date?: string;
          mfg_date?: string | null;
          qty?: number;
          free_qty?: number;
          purchase_rate?: number;
          mrp?: number;
          discount_percent?: number;
          discount_amount?: number;
          taxable_amount?: number;
          gst_percent?: number;
          cgst_percent?: number;
          sgst_percent?: number;
          igst_percent?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          total_amount?: number;
        };
      };
      sales_invoice: {
        Row: {
          id: string;
          invoice_no: string;
          invoice_date: string;
          invoice_time: string;
          customer_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          subtotal: number;
          discount_amount: number;
          discount_percent: number;
          taxable_amount: number;
          cgst_amount: number;
          sgst_amount: number;
          igst_amount: number;
          total_gst: number;
          round_off: number;
          grand_total: number;
          paid_amount: number;
          balance_amount: number;
          payment_mode: 'cash' | 'card' | 'upi' | 'credit';
          payment_status: 'pending' | 'partial' | 'paid';
          notes: string | null;
          created_by: string | null;
          is_cancelled: boolean;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_no: string;
          invoice_date?: string;
          invoice_time?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          subtotal?: number;
          discount_amount?: number;
          discount_percent?: number;
          taxable_amount?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          round_off?: number;
          grand_total?: number;
          paid_amount?: number;
          balance_amount?: number;
          payment_mode?: 'cash' | 'card' | 'upi' | 'credit';
          payment_status?: 'pending' | 'partial' | 'paid';
          notes?: string | null;
          created_by?: string | null;
          is_cancelled?: boolean;
        };
        Update: {
          invoice_no?: string;
          invoice_date?: string;
          invoice_time?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          subtotal?: number;
          discount_amount?: number;
          discount_percent?: number;
          taxable_amount?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          round_off?: number;
          grand_total?: number;
          paid_amount?: number;
          balance_amount?: number;
          payment_mode?: 'cash' | 'card' | 'upi' | 'credit';
          payment_status?: 'pending' | 'partial' | 'paid';
          notes?: string | null;
          is_cancelled?: boolean;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
        };
      };
      sales_item: {
        Row: {
          id: string;
          sales_invoice_id: string;
          product_id: string;
          batch_id: string;
          batch_no: string;
          expiry_date: string;
          qty: number;
          mrp: number;
          selling_rate: number;
          discount_percent: number;
          discount_amount: number;
          taxable_amount: number;
          gst_percent: number;
          cgst_percent: number;
          sgst_percent: number;
          igst_percent: number;
          cgst_amount: number;
          sgst_amount: number;
          igst_amount: number;
          total_gst: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sales_invoice_id: string;
          product_id: string;
          batch_id: string;
          batch_no: string;
          expiry_date: string;
          qty?: number;
          mrp?: number;
          selling_rate?: number;
          discount_percent?: number;
          discount_amount?: number;
          taxable_amount?: number;
          gst_percent?: number;
          cgst_percent?: number;
          sgst_percent?: number;
          igst_percent?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          total_amount?: number;
        };
        Update: {
          product_id?: string;
          batch_id?: string;
          batch_no?: string;
          expiry_date?: string;
          qty?: number;
          mrp?: number;
          selling_rate?: number;
          discount_percent?: number;
          discount_amount?: number;
          taxable_amount?: number;
          gst_percent?: number;
          cgst_percent?: number;
          sgst_percent?: number;
          igst_percent?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_gst?: number;
          total_amount?: number;
        };
      };
      stock_ledger: {
        Row: {
          id: string;
          product_id: string;
          batch_id: string;
          transaction_type: string;
          reference_type: string | null;
          reference_id: string | null;
          qty_in: number;
          qty_out: number;
          balance_qty: number;
          rate: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          batch_id: string;
          transaction_type: string;
          reference_type?: string | null;
          reference_id?: string | null;
          qty_in?: number;
          qty_out?: number;
          balance_qty?: number;
          rate?: number;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          product_id?: string;
          batch_id?: string;
          transaction_type?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          qty_in?: number;
          qty_out?: number;
          balance_qty?: number;
          rate?: number;
          notes?: string | null;
        };
      };
      stock_adjustment: {
        Row: {
          id: string;
          adjustment_no: string;
          adjustment_date: string;
          adjustment_type: 'in' | 'out';
          reason: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          adjustment_no: string;
          adjustment_date?: string;
          adjustment_type: 'in' | 'out';
          reason: string;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          adjustment_no?: string;
          adjustment_date?: string;
          adjustment_type?: 'in' | 'out';
          reason?: string;
          notes?: string | null;
        };
      };
      stock_adjustment_item: {
        Row: {
          id: string;
          adjustment_id: string;
          product_id: string;
          batch_id: string;
          qty: number;
          rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          adjustment_id: string;
          product_id: string;
          batch_id: string;
          qty?: number;
          rate?: number;
        };
        Update: {
          adjustment_id?: string;
          product_id?: string;
          batch_id?: string;
          qty?: number;
          rate?: number;
        };
      };
    };
    Functions: {
      generate_purchase_invoice_no: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_sales_invoice_no: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_adjustment_no: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_product_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_supplier_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_customer_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_fifo_batches: {
        Args: {
          p_product_id: string;
          p_required_qty: number;
        };
        Returns: {
          batch_id: string;
          batch_no: string;
          expiry_date: string;
          available_qty: number;
          allocated_qty: number;
          mrp: number;
          selling_rate: number;
        }[];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['category']['Row'];
export type Company = Database['public']['Tables']['company']['Row'];
export type HsnCode = Database['public']['Tables']['hsn_code']['Row'];
export type DrugSchedule = Database['public']['Tables']['drug_schedule']['Row'];
export type DrugFormula = Database['public']['Tables']['drug_formula']['Row'];
export type ProductType = Database['public']['Tables']['product_type']['Row'];
export type Supplier = Database['public']['Tables']['supplier']['Row'];
export type Customer = Database['public']['Tables']['customer']['Row'];
export type Product = Database['public']['Tables']['product']['Row'];
export type Batch = Database['public']['Tables']['batch']['Row'];
export type PurchaseInvoice = Database['public']['Tables']['purchase_invoice']['Row'];
export type PurchaseItem = Database['public']['Tables']['purchase_item']['Row'];
export type SalesInvoice = Database['public']['Tables']['sales_invoice']['Row'];
export type SalesItem = Database['public']['Tables']['sales_item']['Row'];
export type StockLedger = Database['public']['Tables']['stock_ledger']['Row'];
export type StockAdjustment = Database['public']['Tables']['stock_adjustment']['Row'];
export type StockAdjustmentItem = Database['public']['Tables']['stock_adjustment_item']['Row'];

// Insert types
export type CategoryInsert = Database['public']['Tables']['category']['Insert'];
export type CompanyInsert = Database['public']['Tables']['company']['Insert'];
export type HsnCodeInsert = Database['public']['Tables']['hsn_code']['Insert'];
export type DrugScheduleInsert = Database['public']['Tables']['drug_schedule']['Insert'];
export type DrugFormulaInsert = Database['public']['Tables']['drug_formula']['Insert'];
export type ProductTypeInsert = Database['public']['Tables']['product_type']['Insert'];
export type SupplierInsert = Database['public']['Tables']['supplier']['Insert'];
export type CustomerInsert = Database['public']['Tables']['customer']['Insert'];
export type ProductInsert = Database['public']['Tables']['product']['Insert'];
export type BatchInsert = Database['public']['Tables']['batch']['Insert'];
export type PurchaseInvoiceInsert = Database['public']['Tables']['purchase_invoice']['Insert'];
export type PurchaseItemInsert = Database['public']['Tables']['purchase_item']['Insert'];
export type SalesInvoiceInsert = Database['public']['Tables']['sales_invoice']['Insert'];
export type SalesItemInsert = Database['public']['Tables']['sales_item']['Insert'];
export type StockLedgerInsert = Database['public']['Tables']['stock_ledger']['Insert'];

// Update types
export type CategoryUpdate = Database['public']['Tables']['category']['Update'];
export type CompanyUpdate = Database['public']['Tables']['company']['Update'];
export type ProductUpdate = Database['public']['Tables']['product']['Update'];
export type SupplierUpdate = Database['public']['Tables']['supplier']['Update'];
export type CustomerUpdate = Database['public']['Tables']['customer']['Update'];
