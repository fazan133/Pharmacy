import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  purchaseInvoiceApi, 
  createPurchaseInvoiceWithItems,
  type PurchaseInvoiceWithItems 
} from '../api/purchaseApi';
import type { PurchaseInvoiceInsert } from '@/types/database.types';

export function usePurchaseInvoices() {
  return useQuery<PurchaseInvoiceWithItems[]>({
    queryKey: ['purchase-invoices'],
    queryFn: purchaseInvoiceApi.getAll,
  });
}

export function usePurchaseInvoice(id: string | undefined) {
  return useQuery<PurchaseInvoiceWithItems>({
    queryKey: ['purchase-invoice', id],
    queryFn: () => purchaseInvoiceApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      invoice: PurchaseInvoiceInsert;
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
      }[];
    }) => createPurchaseInvoiceWithItems(params.invoice, params.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Purchase invoice created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
}

export function useUpdatePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: Partial<PurchaseInvoiceInsert> }) =>
      purchaseInvoiceApi.update(params.id, params.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoice', id] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });
}

export function useDeletePurchaseInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseInvoiceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });
}

export function useGeneratePurchaseInvoiceNo() {
  return useQuery({
    queryKey: ['purchase-invoice-no'],
    queryFn: purchaseInvoiceApi.generateInvoiceNo,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
