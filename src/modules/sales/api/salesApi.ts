import { supabase } from '@/api/supabase';
import type { 
  SalesInvoice, 
  SalesInvoiceInsert, 
  SalesItem,
  SalesItemInsert,
  Batch,
  Product
} from '@/types/database.types';

export interface SalesInvoiceWithItems extends SalesInvoice {
  items: (SalesItem & { 
    batch: Batch & { product: Product }; 
  })[];
  customer: { name: string; code: string } | null;
}

export interface BatchWithProduct extends Batch {
  product: Product;
}

export const salesInvoiceApi = {
  async getAll(): Promise<SalesInvoiceWithItems[]> {
    const { data, error } = await supabase
      .from('sales_invoice')
      .select(`
        *,
        customer:customer_id (name, code)
      `)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data as unknown as SalesInvoiceWithItems[];
  },

  async getById(id: string): Promise<SalesInvoiceWithItems> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('sales_invoice')
      .select(`
        *,
        customer:customer_id (name, code)
      `)
      .eq('id', id)
      .single();

    if (invoiceError) throw invoiceError;

    const { data: items, error: itemsError } = await supabase
      .from('sales_item')
      .select(`
        *,
        batch:batch_id (
          *,
          product:product_id (*)
        )
      `)
      .eq('sales_invoice_id', id);

    if (itemsError) throw itemsError;

    return {
      ...invoice,
      items: items || [],
    } as unknown as SalesInvoiceWithItems;
  },

  async create(invoice: SalesInvoiceInsert): Promise<SalesInvoice> {
    const { data, error } = await supabase
      .from('sales_invoice')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<SalesInvoiceInsert>): Promise<SalesInvoice> {
    const { data: updated, error } = await supabase
      .from('sales_invoice')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_invoice')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async generateInvoiceNo(): Promise<string> {
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fyYear = `${currentYear.toString().slice(2)}${(currentYear + 1).toString().slice(2)}`;
    const prefix = `SI/${fyYear}/`;
    
    // Get the latest invoice number for this financial year
    const { data, error } = await supabase
      .from('sales_invoice')
      .select('invoice_no')
      .like('invoice_no', `${prefix}%`)
      .order('invoice_no', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    let nextNum = 1;
    if (data && data.length > 0) {
      const lastNo = data[0].invoice_no;
      const numPart = lastNo.split('/').pop();
      if (numPart) {
        nextNum = parseInt(numPart, 10) + 1;
      }
    }
    
    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
  },
};

export const batchSearchApi = {
  // Search batches by product code/name or barcode
  async searchBatches(query: string): Promise<BatchWithProduct[]> {
    // First, get all batches with available stock
    const { data: batches, error: batchError } = await supabase
      .from('batch')
      .select(`
        *,
        product:product_id (*)
      `)
      .gt('available_qty', 0)
      .order('expiry_date', { ascending: true });

    if (batchError) throw batchError;
    
    // Filter batches by product name/code or batch number
    const lowerQuery = query.toLowerCase();
    const filtered = (batches || []).filter((batch: any) => {
      if (!batch.product) return false;
      return (
        batch.batch_no?.toLowerCase().includes(lowerQuery) ||
        batch.product.code?.toLowerCase().includes(lowerQuery) ||
        batch.product.name?.toLowerCase().includes(lowerQuery) ||
        batch.product.barcode === query
      );
    });
    
    return filtered.slice(0, 50) as unknown as BatchWithProduct[];
  },

  // Get all batches with stock for POS
  async getAllAvailableBatches(): Promise<BatchWithProduct[]> {
    const { data, error } = await supabase
      .from('batch')
      .select(`
        *,
        product:product_id (*)
      `)
      .gt('available_qty', 0)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return (data || []).filter((b: any) => b.product) as unknown as BatchWithProduct[];
  },

  // Get FIFO batches for a product
  async getFIFOBatches(productId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batch')
      .select('*')
      .eq('product_id', productId)
      .gt('available_qty', 0)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Allocate qty from batches using FIFO
  allocateFIFO(batches: Batch[], requiredQty: number): { batch: Batch; qty: number }[] {
    const allocations: { batch: Batch; qty: number }[] = [];
    let remaining = requiredQty;

    for (const batch of batches) {
      if (remaining <= 0) break;
      
      const allocQty = Math.min(batch.available_qty, remaining);
      if (allocQty > 0) {
        allocations.push({ batch, qty: allocQty });
        remaining -= allocQty;
      }
    }

    return allocations;
  },
};

export const salesItemApi = {
  async create(item: SalesItemInsert): Promise<SalesItem> {
    const { data, error } = await supabase
      .from('sales_item')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_item')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Create sales invoice with items (deducts stock from batches)
export const createSalesInvoiceWithItems = async (
  invoice: SalesInvoiceInsert,
  items: {
    batch_id: string;
    batch_no: string;
    expiry_date: string;
    product_id: string;
    qty: number;
    selling_rate: number;
    mrp: number;
    discount_percent: number;
    gst_percent: number;
  }[]
): Promise<SalesInvoice> => {
  // VALIDATE stock availability FIRST before creating anything
  for (const item of items) {
    const { data: batch, error: batchError } = await supabase
      .from('batch')
      .select('available_qty, batch_no')
      .eq('id', item.batch_id)
      .single();

    if (batchError) throw batchError;

    if (batch.available_qty < item.qty) {
      throw new Error(`Insufficient stock for batch ${batch.batch_no}. Available: ${batch.available_qty}, Requested: ${item.qty}`);
    }
  }

  // Now create invoice after validation passes
  const createdInvoice = await salesInvoiceApi.create(invoice);

  // Create invoice items and update batch quantities
  for (const item of items) {
    // Calculate item totals
    const grossAmount = item.qty * item.selling_rate;
    const discountAmount = grossAmount * (item.discount_percent / 100);
    const taxableAmount = grossAmount - discountAmount;

    // Create invoice item
    await salesItemApi.create({
      sales_invoice_id: createdInvoice.id,
      product_id: item.product_id,
      batch_id: item.batch_id,
      batch_no: item.batch_no,
      expiry_date: item.expiry_date,
      qty: item.qty,
      selling_rate: item.selling_rate,
      mrp: item.mrp,
      discount_percent: item.discount_percent,
      gst_percent: item.gst_percent,
      taxable_amount: taxableAmount,
      discount_amount: discountAmount,
    });

    // Update batch quantity
    const { data: batch, error: batchError } = await supabase
      .from('batch')
      .select('available_qty')
      .eq('id', item.batch_id)
      .single();

    if (batchError) throw batchError;

    const newQty = batch.available_qty - item.qty;
    
    const { error: updateError } = await supabase
      .from('batch')
      .update({ available_qty: newQty })
      .eq('id', item.batch_id);

    if (updateError) throw updateError;
  }

  return createdInvoice;
};
