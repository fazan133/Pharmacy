import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  productApi,
  categoryApi,
  companyApi,
  hsnCodeApi,
  drugScheduleApi,
  drugFormulaApi,
  productTypeApi,
  supplierApi,
  customerApi,
} from '../api/mastersApi';
import type {
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

// ============================================
// PRODUCT HOOKS
// ============================================
export function useProducts(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => productApi.getAll(options),
  });
}

export function useProductDropdown() {
  return useQuery({
    queryKey: ['products', 'dropdown'],
    queryFn: productApi.getDropdownOptions,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: ProductInsert) => productApi.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      // Handle foreign key constraint errors
      if (error?.code === '23503' || error?.message?.includes('foreign key') || error?.message?.includes('violates')) {
        toast.error('Cannot delete this product as it is used in existing invoices or batches');
      } else {
        toast.error(error?.message || 'Failed to delete product');
      }
    },
  });
}

// ============================================
// CATEGORY HOOKS
// ============================================
export function useCategories(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['categories', options],
    queryFn: () => categoryApi.getAll(options),
  });
}

export function useCategoryDropdown() {
  return useQuery({
    queryKey: ['categories', 'dropdown'],
    queryFn: categoryApi.getDropdownOptions,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CategoryInsert) => categoryApi.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}

// ============================================
// COMPANY HOOKS
// ============================================
export function useCompanies(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['companies', options],
    queryFn: () => companyApi.getAll(options),
  });
}

export function useCompanyDropdown() {
  return useQuery({
    queryKey: ['companies', 'dropdown'],
    queryFn: companyApi.getDropdownOptions,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (company: CompanyInsert) => companyApi.create(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create company');
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      companyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update company');
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete company');
    },
  });
}

// ============================================
// HSN CODE HOOKS
// ============================================
export function useHsnCodes(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['hsn-codes', options],
    queryFn: () => hsnCodeApi.getAll(options),
  });
}

export function useHsnCodeDropdown() {
  return useQuery({
    queryKey: ['hsn-codes', 'dropdown'],
    queryFn: hsnCodeApi.getDropdownOptions,
  });
}

export function useCreateHsnCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hsnCode: HsnCodeInsert) => hsnCodeApi.create(hsnCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hsn-codes'] });
      toast.success('HSN Code created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create HSN code');
    },
  });
}

export function useUpdateHsnCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HsnCode> }) =>
      hsnCodeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hsn-codes'] });
      toast.success('HSN Code updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update HSN code');
    },
  });
}

export function useDeleteHsnCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hsnCodeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hsn-codes'] });
      toast.success('HSN Code deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete HSN code');
    },
  });
}

// ============================================
// DRUG SCHEDULE HOOKS
// ============================================
export function useDrugSchedules(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['drug-schedules', options],
    queryFn: () => drugScheduleApi.getAll(options),
  });
}

export function useDrugScheduleDropdown() {
  return useQuery({
    queryKey: ['drug-schedules', 'dropdown'],
    queryFn: drugScheduleApi.getDropdownOptions,
  });
}

export function useCreateDrugSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: DrugScheduleInsert) => drugScheduleApi.create(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drug-schedules'] });
      toast.success('Drug Schedule created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create drug schedule');
    },
  });
}

export function useUpdateDrugSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DrugSchedule> }) =>
      drugScheduleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drug-schedules'] });
      toast.success('Drug Schedule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update drug schedule');
    },
  });
}

export function useDeleteDrugSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => drugScheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drug-schedules'] });
      toast.success('Drug Schedule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete drug schedule');
    },
  });
}

// ============================================
// DRUG FORMULA HOOKS
// ============================================
export function useDrugFormulas(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['drug-formulas', options],
    queryFn: () => drugFormulaApi.getAll(options),
  });
}

export function useDrugFormulaDropdown() {
  return useQuery({
    queryKey: ['drug-formulas', 'dropdown'],
    queryFn: drugFormulaApi.getDropdownOptions,
  });
}

export function useCreateDrugFormula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formula: DrugFormulaInsert) => drugFormulaApi.create(formula),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drug-formulas'] });
      toast.success('Drug Formula created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create drug formula');
    },
  });
}

export function useUpdateDrugFormula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DrugFormula> }) =>
      drugFormulaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drug-formulas'] });
      toast.success('Drug Formula updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update drug formula');
    },
  });
}

export function useDeleteDrugFormula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => drugFormulaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drug-formulas'] });
      toast.success('Drug Formula deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete drug formula');
    },
  });
}

// ============================================
// PRODUCT TYPE HOOKS
// ============================================
export function useProductTypes(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['product-types', options],
    queryFn: () => productTypeApi.getAll(options),
  });
}

export function useProductTypeDropdown() {
  return useQuery({
    queryKey: ['product-types', 'dropdown'],
    queryFn: productTypeApi.getDropdownOptions,
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productType: ProductTypeInsert) => productTypeApi.create(productType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      toast.success('Product Type created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product type');
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductType> }) =>
      productTypeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      toast.success('Product Type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product type');
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productTypeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      toast.success('Product Type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product type');
    },
  });
}

// ============================================
// SUPPLIER HOOKS
// ============================================
export function useSuppliers(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['suppliers', options],
    queryFn: () => supplierApi.getAll(options),
  });
}

export function useSupplierDropdown() {
  return useQuery({
    queryKey: ['suppliers', 'dropdown'],
    queryFn: supplierApi.getDropdownOptions,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplier: SupplierInsert) => supplierApi.create(supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      supplierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier');
    },
  });
}

// ============================================
// CUSTOMER HOOKS
// ============================================
export function useCustomers(options?: { includeHidden?: boolean }) {
  return useQuery({
    queryKey: ['customers', options],
    queryFn: () => customerApi.getAll(options),
  });
}

export function useCustomerDropdown() {
  return useQuery({
    queryKey: ['customers', 'dropdown'],
    queryFn: customerApi.getDropdownOptions,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customer: CustomerInsert) => customerApi.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
}
