import { supabase } from '@/api/supabase';
import type { Batch, Product, StockLedger, StockLedgerInsert } from '@/types/database.types';

export interface BatchWithProduct extends Batch {
  product: Product;
}

export interface StockSummary {
  product_id: string;
  product_code: string;
  product_name: string;
  total_qty: number;
  total_value: number;
  batch_count: number;
}

export interface LowStockItem extends Product {
  current_stock: number;
  reorder_level: number;
  shortage: number;
}

export interface ExpiryAlertItem extends BatchWithProduct {
  days_to_expiry: number;
}

export const inventoryApi = {
  // Get all batches with stock
  async getAllBatches(): Promise<BatchWithProduct[]> {
    const { data, error } = await supabase
      .from('batch')
      .select(`
        *,
        product:product_id (*)
      `)
      .gt('available_qty', 0)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data as unknown as BatchWithProduct[];
  },

  // Get batch stock by product
  async getBatchesByProduct(productId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batch')
      .select('*')
      .eq('product_id', productId)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get stock summary by product
  async getStockSummary(): Promise<StockSummary[]> {
    const { data: batches, error } = await supabase
      .from('batch')
      .select(`
        product_id,
        available_qty,
        mrp,
        product:product_id (code, name)
      `)
      .gt('available_qty', 0);

    if (error) throw error;

    // Aggregate by product
    const summary: Record<string, StockSummary> = {};
    
    for (const batch of batches as unknown as Array<{ product_id: string; available_qty: number; mrp: number; product: { code: string; name: string } }>) {
      if (!summary[batch.product_id]) {
        summary[batch.product_id] = {
          product_id: batch.product_id,
          product_code: batch.product.code,
          product_name: batch.product.name,
          total_qty: 0,
          total_value: 0,
          batch_count: 0,
        };
      }
      summary[batch.product_id].total_qty += batch.available_qty;
      summary[batch.product_id].total_value += batch.available_qty * batch.mrp;
      summary[batch.product_id].batch_count += 1;
    }

    return Object.values(summary).sort((a, b) => a.product_name.localeCompare(b.product_name));
  },

  // Get low stock products
  async getLowStockProducts(): Promise<LowStockItem[]> {
    // Get all products with reorder level
    const { data: products, error: prodError } = await supabase
      .from('product')
      .select('*')
      .eq('is_active', true)
      .gt('reorder_level', 0);

    if (prodError) throw prodError;

    // Get current stock for each product
    const { data: batches, error: batchError } = await supabase
      .from('batch')
      .select('product_id, available_qty')
      .gt('available_qty', 0);

    if (batchError) throw batchError;

    // Calculate current stock per product
    const stockByProduct: Record<string, number> = {};
    for (const batch of batches as { product_id: string; available_qty: number }[]) {
      stockByProduct[batch.product_id] = (stockByProduct[batch.product_id] || 0) + batch.available_qty;
    }

    // Find low stock products
    const lowStock: LowStockItem[] = [];
    for (const product of products) {
      const currentStock = stockByProduct[product.id] || 0;
      if (currentStock < product.reorder_level) {
        lowStock.push({
          ...product,
          current_stock: currentStock,
          reorder_level: product.reorder_level,
          shortage: product.reorder_level - currentStock,
        });
      }
    }

    return lowStock.sort((a, b) => b.shortage - a.shortage);
  },

  // Get expiring batches
  async getExpiringBatches(daysThreshold: number = 90): Promise<ExpiryAlertItem[]> {
    const today = new Date();
    const thresholdDate = new Date(today.setDate(today.getDate() + daysThreshold));

    const { data, error } = await supabase
      .from('batch')
      .select(`
        *,
        product:product_id (*)
      `)
      .gt('available_qty', 0)
      .lte('expiry_date', thresholdDate.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    return (data as unknown as BatchWithProduct[]).map(batch => ({
      ...batch,
      days_to_expiry: Math.ceil(
        (new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));
  },

  // Get stock ledger
  async getStockLedger(filters?: {
    productId?: string;
    batchId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<(StockLedger & { batch: BatchWithProduct })[]> {
    let query = supabase
      .from('stock_ledger')
      .select(`
        *,
        batch:batch_id (
          *,
          product:product_id (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.productId) {
      query = query.eq('batch.product_id', filters.productId);
    }
    if (filters?.batchId) {
      query = query.eq('batch_id', filters.batchId);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.limit(500);

    if (error) throw error;
    return data as unknown as (StockLedger & { batch: BatchWithProduct })[];
  },

  // Create stock adjustment
  async createStockAdjustment(params: {
    batchId: string;
    adjustmentQty: number;
    reason: string;
    notes?: string;
  }): Promise<void> {
    // Get current batch with product_id
    const { data: batch, error: batchError } = await supabase
      .from('batch')
      .select('available_qty, product_id')
      .eq('id', params.batchId)
      .single();

    if (batchError) throw batchError;

    const newQty = batch.available_qty + params.adjustmentQty;
    if (newQty < 0) throw new Error('Adjustment would result in negative stock');

    // Update batch quantity
    const { error: updateError } = await supabase
      .from('batch')
      .update({ available_qty: newQty })
      .eq('id', params.batchId);

    if (updateError) throw updateError;

    // Create stock ledger entry with correct product_id
    const ledgerEntry: StockLedgerInsert = {
      product_id: batch.product_id,
      batch_id: params.batchId,
      transaction_type: params.adjustmentQty > 0 ? 'adjustment_in' : 'adjustment_out',
      qty_in: params.adjustmentQty > 0 ? Math.abs(params.adjustmentQty) : 0,
      qty_out: params.adjustmentQty < 0 ? Math.abs(params.adjustmentQty) : 0,
      balance_qty: newQty,
      reference_type: 'adjustment',
      reference_id: null,
      notes: `${params.reason}${params.notes ? ': ' + params.notes : ''}`,
    };

    const { error: ledgerError } = await supabase
      .from('stock_ledger')
      .insert(ledgerEntry);

    if (ledgerError) throw ledgerError;
  },
};
