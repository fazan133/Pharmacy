import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  salesInvoiceApi, 
  batchSearchApi,
  createSalesInvoiceWithItems,
  type SalesInvoiceWithItems,
  type BatchWithProduct
} from '../api/salesApi';
import type { SalesInvoiceInsert, Batch } from '@/types/database.types';

export function useSalesInvoices() {
  return useQuery<SalesInvoiceWithItems[]>({
    queryKey: ['sales-invoices'],
    queryFn: salesInvoiceApi.getAll,
  });
}

export function useSalesInvoice(id: string | undefined) {
  return useQuery<SalesInvoiceWithItems>({
    queryKey: ['sales-invoice', id],
    queryFn: () => salesInvoiceApi.getById(id!),
    enabled: !!id,
  });
}

export function useSearchBatches(query: string) {
  return useQuery<BatchWithProduct[]>({
    queryKey: ['batch-search', query],
    queryFn: () => batchSearchApi.searchBatches(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAllAvailableBatches() {
  return useQuery<BatchWithProduct[]>({
    queryKey: ['all-available-batches'],
    queryFn: batchSearchApi.getAllAvailableBatches,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useFIFOBatches(productId: string | undefined) {
  return useQuery<Batch[]>({
    queryKey: ['fifo-batches', productId],
    queryFn: () => batchSearchApi.getFIFOBatches(productId!),
    enabled: !!productId,
  });
}

export function useCreateSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      invoice: SalesInvoiceInsert;
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
      }[];
    }) => createSalesInvoiceWithItems(params.invoice, params.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch-search'] });
      queryClient.invalidateQueries({ queryKey: ['fifo-batches'] });
      toast.success('Sales invoice created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
}

export function useDeleteSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesInvoiceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });
}

export function useGenerateSalesInvoiceNo() {
  return useQuery({
    queryKey: ['sales-invoice-no'],
    queryFn: salesInvoiceApi.generateInvoiceNo,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
