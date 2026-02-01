import { supabase } from '@/api/supabase';
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  Category,
  CategoryInsert,
  Company,
  CompanyInsert,
  HsnCode,
  HsnCodeInsert,
  DrugSchedule,
  DrugScheduleInsert,
  DrugFormula,
  DrugFormulaInsert,
  ProductType,
  ProductTypeInsert,
  Supplier,
  SupplierInsert,
  Customer,
  CustomerInsert,
} from '@/types/database.types';

// Generic fetch for dropdown options (non-hidden, active only)
async function fetchDropdownOptions<T>(
  table: string,
  orderBy: string = 'name'
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('is_hidden', false)
    .eq('is_active', true)
    .order(orderBy);

  if (error) throw error;
  return data as T[];
}

// ============================================
// PRODUCT API
// ============================================
export const productApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<Product[]> {
    let query = supabase
      .from('product')
      .select(`
        *,
        category:category_id(id, name),
        company:company_id(id, name),
        hsn:hsn_id(id, code, gst_percent),
        schedule:schedule_id(id, code, name),
        formula:formula_id(id, name),
        product_type:product_type_id(id, name)
      `)
      .order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('product')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, product: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('product')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('product').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_product_code');
    if (error) throw error;
    return data;
  },

  async searchByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('barcode', barcode)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('is_active', true)
      .eq('is_hidden', false)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,barcode.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  getDropdownOptions: () => fetchDropdownOptions<Product>('product'),
};

// ============================================
// CATEGORY API
// ============================================
export const categoryApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<Category[]> {
    let query = supabase.from('category').select('*').order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(category: CategoryInsert): Promise<Category> {
    const { data, error } = await supabase
      .from('category')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('category')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('category').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase
      .from('category')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);
    if (error) throw error;
    const lastCode = data?.[0]?.code || 'CAT000';
    const num = parseInt(lastCode.replace(/\D/g, '')) || 0;
    return `CAT${String(num + 1).padStart(3, '0')}`;
  },

  getDropdownOptions: () => fetchDropdownOptions<Category>('category'),
};

// ============================================
// COMPANY API
// ============================================
export const companyApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<Company[]> {
    let query = supabase.from('company').select('*').order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(company: CompanyInsert): Promise<Company> {
    const { data, error } = await supabase
      .from('company')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, company: Partial<Company>): Promise<Company> {
    const { data, error } = await supabase
      .from('company')
      .update(company)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('company').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase
      .from('company')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);
    if (error) throw error;
    const lastCode = data?.[0]?.code || 'COM000';
    const num = parseInt(lastCode.replace(/\D/g, '')) || 0;
    return `COM${String(num + 1).padStart(3, '0')}`;
  },

  getDropdownOptions: () => fetchDropdownOptions<Company>('company'),
};

// ============================================
// HSN CODE API
// ============================================
export const hsnCodeApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<HsnCode[]> {
    let query = supabase.from('hsn_code').select('*').order('code');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(hsnCode: HsnCodeInsert): Promise<HsnCode> {
    const { data, error } = await supabase
      .from('hsn_code')
      .insert(hsnCode)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, hsnCode: Partial<HsnCode>): Promise<HsnCode> {
    const { data, error } = await supabase
      .from('hsn_code')
      .update(hsnCode)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('hsn_code').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase
      .from('hsn_code')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);
    if (error) throw error;
    const lastCode = data?.[0]?.code || '0';
    const num = parseInt(lastCode) || 0;
    return String(num + 1).padStart(4, '0');
  },

  getDropdownOptions: () => fetchDropdownOptions<HsnCode>('hsn_code', 'code'),
};

// ============================================
// DRUG SCHEDULE API
// ============================================
export const drugScheduleApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<DrugSchedule[]> {
    let query = supabase.from('drug_schedule').select('*').order('code');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(schedule: DrugScheduleInsert): Promise<DrugSchedule> {
    const { data, error } = await supabase
      .from('drug_schedule')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, schedule: Partial<DrugSchedule>): Promise<DrugSchedule> {
    const { data, error } = await supabase
      .from('drug_schedule')
      .update(schedule)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('drug_schedule').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase
      .from('drug_schedule')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);
    if (error) throw error;
    const lastCode = data?.[0]?.code || 'SCH000';
    const num = parseInt(lastCode.replace(/\D/g, '')) || 0;
    return `SCH${String(num + 1).padStart(3, '0')}`;
  },

  getDropdownOptions: () => fetchDropdownOptions<DrugSchedule>('drug_schedule', 'code'),
};

// ============================================
// DRUG FORMULA API
// ============================================
export const drugFormulaApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<DrugFormula[]> {
    let query = supabase.from('drug_formula').select('*').order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(formula: DrugFormulaInsert): Promise<DrugFormula> {
    const { data, error } = await supabase
      .from('drug_formula')
      .insert(formula)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formula: Partial<DrugFormula>): Promise<DrugFormula> {
    const { data, error } = await supabase
      .from('drug_formula')
      .update(formula)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('drug_formula').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase
      .from('drug_formula')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);
    if (error) throw error;
    const lastCode = data?.[0]?.code || 'FRM000';
    const num = parseInt(lastCode.replace(/\D/g, '')) || 0;
    return `FRM${String(num + 1).padStart(3, '0')}`;
  },

  getDropdownOptions: () => fetchDropdownOptions<DrugFormula>('drug_formula'),
};

// ============================================
// PRODUCT TYPE API
// ============================================
export const productTypeApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<ProductType[]> {
    let query = supabase.from('product_type').select('*').order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(productType: ProductTypeInsert): Promise<ProductType> {
    const { data, error } = await supabase
      .from('product_type')
      .insert(productType)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, productType: Partial<ProductType>): Promise<ProductType> {
    const { data, error } = await supabase
      .from('product_type')
      .update(productType)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('product_type').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase
      .from('product_type')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);
    if (error) throw error;
    const lastCode = data?.[0]?.code || 'TYP000';
    const num = parseInt(lastCode.replace(/\D/g, '')) || 0;
    return `TYP${String(num + 1).padStart(3, '0')}`;
  },

  getDropdownOptions: () => fetchDropdownOptions<ProductType>('product_type'),
};

// ============================================
// SUPPLIER API
// ============================================
export const supplierApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<Supplier[]> {
    let query = supabase.from('supplier').select('*').order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(supplier: SupplierInsert): Promise<Supplier> {
    const { data, error } = await supabase
      .from('supplier')
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('supplier')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('supplier').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_supplier_code');
    if (error) throw error;
    return data;
  },

  getDropdownOptions: () => fetchDropdownOptions<Supplier>('supplier'),
};

// ============================================
// CUSTOMER API
// ============================================
export const customerApi = {
  async getAll(options?: { includeHidden?: boolean }): Promise<Customer[]> {
    let query = supabase.from('customer').select('*').order('name');

    if (!options?.includeHidden) {
      query = query.eq('is_hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase
      .from('customer')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customer')
      .update(customer)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('customer').delete().eq('id', id);
    if (error) throw error;
  },

  async generateCode(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_customer_code');
    if (error) throw error;
    return data;
  },

  async search(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('is_active', true)
      .eq('is_hidden', false)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  getDropdownOptions: () => fetchDropdownOptions<Customer>('customer'),
};
