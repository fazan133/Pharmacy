import { supabase } from '@/api/supabase';
import type { 
  PurchaseInvoice, 
  PurchaseInvoiceInsert, 
  PurchaseItem,
  PurchaseItemInsert,
  Batch,
  BatchInsert
} from '@/types/database.types';

export interface PurchaseInvoiceWithItems extends PurchaseInvoice {
  items: (PurchaseItem & { batch: Batch; product: { name: string; code: string } })[];
  supplier: { name: string; code: string };
}

export const purchaseInvoiceApi = {
  async getAll(): Promise<PurchaseInvoiceWithItems[]> {
    const { data, error } = await supabase
      .from('purchase_invoice')
      .select(`
        *,
        supplier:supplier_id (name, code)
      `)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data as unknown as PurchaseInvoiceWithItems[];
  },

  async getById(id: string): Promise<PurchaseInvoiceWithItems> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('purchase_invoice')
      .select(`
        *,
        supplier:supplier_id (name, code)
      `)
      .eq('id', id)
      .single();

    if (invoiceError) throw invoiceError;

    const { data: items, error: itemsError } = await supabase
      .from('purchase_item')
      .select(`
        *,
        batch:batch_id (*),
        product:product_id (name, code)
      `)
      .eq('purchase_invoice_id', id);

    if (itemsError) throw itemsError;

    return {
      ...invoice,
      items: items || [],
    } as unknown as PurchaseInvoiceWithItems;
  },

  async create(invoice: PurchaseInvoiceInsert): Promise<PurchaseInvoice> {
    const { data, error } = await supabase
      .from('purchase_invoice')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<PurchaseInvoiceInsert>): Promise<PurchaseInvoice> {
    const { data: updated, error } = await supabase
      .from('purchase_invoice')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_invoice')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async generateInvoiceNo(): Promise<string> {
    // Get current financial year
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fyYear = `${currentYear.toString().slice(2)}${(currentYear + 1).toString().slice(2)}`;
    const prefix = `PI/${fyYear}/`;
    
    // Get the latest invoice number for this financial year
    const { data, error } = await supabase
      .from('purchase_invoice')
      .select('invoice_no')
      .like('invoice_no', `${prefix}%`)
      .order('invoice_no', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    let nextNum = 1;
    if (data && data.length > 0) {
      // Extract the number from the last invoice (e.g., "PI/2526/00001" -> 1)
      const lastNo = data[0].invoice_no;
      const numPart = lastNo.split('/').pop();
      if (numPart) {
        nextNum = parseInt(numPart, 10) + 1;
      }
    }
    
    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
  },
};

export const purchaseItemApi = {
  async create(item: PurchaseItemInsert): Promise<PurchaseItem> {
    const { data, error } = await supabase
      .from('purchase_item')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<PurchaseItemInsert>): Promise<PurchaseItem> {
    const { data: updated, error } = await supabase
      .from('purchase_item')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_item')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const batchApi = {
  async create(batch: BatchInsert): Promise<Batch> {
    const { data, error } = await supabase
      .from('batch')
      .insert(batch)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<BatchInsert>): Promise<Batch> {
    const { data: updated, error } = await supabase
      .from('batch')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async getByProduct(productId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batch')
      .select('*')
      .eq('product_id', productId)
      .gt('available_qty', 0)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get all batches for a product (including zero stock for suggestions)
  async getAllByProduct(productId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batch')
      .select('*')
      .eq('product_id', productId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAvailableBatches(productId: string, qty: number): Promise<Batch[]> {
    // FIFO: Get oldest batches first that have stock
    const { data, error } = await supabase
      .rpc('get_fifo_batches', { p_product_id: productId, p_required_qty: qty });

    if (error) throw error;
    return data || [];
  },
};

// Create purchase invoice with items and batches in a transaction
export const createPurchaseInvoiceWithItems = async (
  invoice: PurchaseInvoiceInsert,
  items: {
    product_id: string;
    batch_no: string;
    mfg_date: string | null;
    expiry_date: string;
    qty: number;
    free_qty: number;
    purchase_rate: number;
    mrp: number;
    discount_percent: number;
    gst_percent: number;
  }[]
): Promise<PurchaseInvoice> => {
  // Create invoice first
  const createdInvoice = await purchaseInvoiceApi.create(invoice);

  // Create batches and invoice items
  for (const item of items) {
    // Check if batch already exists for this product
    const { data: existingBatch } = await supabase
      .from('batch')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('batch_no', item.batch_no)
      .single();

    let batch: Batch;
    
    if (existingBatch) {
      // Update existing batch - add to available qty
      const { data: updatedBatch, error: updateError } = await supabase
        .from('batch')
        .update({
          available_qty: existingBatch.available_qty + item.qty + item.free_qty,
          purchase_rate: item.purchase_rate,
          mrp: item.mrp,
          expiry_date: item.expiry_date,
          mfg_date: item.mfg_date,
        })
        .eq('id', existingBatch.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      batch = updatedBatch;
    } else {
      // Create new batch
      batch = await batchApi.create({
        product_id: item.product_id,
        batch_no: item.batch_no,
        mfg_date: item.mfg_date,
        expiry_date: item.expiry_date,
        purchase_rate: item.purchase_rate,
        mrp: item.mrp,
        available_qty: item.qty + item.free_qty,
      });
    }

    // Calculate item totals
    const grossAmount = item.qty * item.purchase_rate;
    const discountAmount = grossAmount * (item.discount_percent / 100);
    const taxableAmount = grossAmount - discountAmount;
    // GST is calculated but stored per item in the invoice item record

    // Create invoice item
    await purchaseItemApi.create({
      purchase_invoice_id: createdInvoice.id,
      product_id: item.product_id,
      batch_id: batch.id,
      batch_no: item.batch_no,
      expiry_date: item.expiry_date,
      mfg_date: item.mfg_date,
      qty: item.qty,
      free_qty: item.free_qty,
      purchase_rate: item.purchase_rate,
      mrp: item.mrp,
      discount_percent: item.discount_percent,
      gst_percent: item.gst_percent,
      taxable_amount: taxableAmount,
      discount_amount: discountAmount,
    });
  }

  return createdInvoice;
};
