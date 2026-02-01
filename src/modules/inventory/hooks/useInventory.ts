import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  inventoryApi, 
  type BatchWithProduct, 
  type StockSummary,
  type LowStockItem,
  type ExpiryAlertItem
} from '../api/inventoryApi';
import type { StockLedger } from '@/types/database.types';

export function useBatches() {
  return useQuery<BatchWithProduct[]>({
    queryKey: ['batches'],
    queryFn: inventoryApi.getAllBatches,
  });
}

export function useBatchesByProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['batches', 'product', productId],
    queryFn: () => inventoryApi.getBatchesByProduct(productId!),
    enabled: !!productId,
  });
}

export function useStockSummary() {
  return useQuery<StockSummary[]>({
    queryKey: ['stock-summary'],
    queryFn: inventoryApi.getStockSummary,
  });
}

export function useLowStockProducts() {
  return useQuery<LowStockItem[]>({
    queryKey: ['low-stock'],
    queryFn: inventoryApi.getLowStockProducts,
  });
}

export function useExpiringBatches(daysThreshold: number = 90) {
  return useQuery<ExpiryAlertItem[]>({
    queryKey: ['expiring-batches', daysThreshold],
    queryFn: () => inventoryApi.getExpiringBatches(daysThreshold),
  });
}

export function useStockLedger(filters?: {
  productId?: string;
  batchId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<(StockLedger & { batch: BatchWithProduct })[]>({
    queryKey: ['stock-ledger', filters],
    queryFn: () => inventoryApi.getStockLedger(filters),
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.createStockAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
      toast.success('Stock adjustment created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create adjustment: ${error.message}`);
    },
  });
}
