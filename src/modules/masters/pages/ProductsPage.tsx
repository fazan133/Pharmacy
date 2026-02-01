import { useState } from 'react';
import { Box, Card, IconButton, TextField, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader, ConfirmDialog, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useProducts, useDeleteProduct } from '../hooks/useMasters';
import { ProductFormDialog } from '../components/ProductFormDialog';
import type { Product } from '@/types/database.types';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: products, isLoading, error, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      await deleteProduct.mutateAsync(selectedProduct.id);
      setDeleteConfirmOpen(false);
      setSelectedProduct(null);
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', flex: 0.5, minWidth: 20 },
    { field: 'name', headerName: 'Name', flex: 1.5, minWidth: 50 },
    {
      field: 'category',
      headerName: 'Category',
      flex: 0.8, minWidth: 50,
      valueGetter: (_, row) => row.category?.name || '-',
    },
    {
      field: 'company',
      headerName: 'Company',
      flex: 0.8, minWidth: 50,
      valueGetter: (_, row) => row.company?.name || '-',
    },
    {
      field: 'mrp',
      headerName: 'MRP',
      flex: 0.5, minWidth: 50,
      type: 'number',
      valueFormatter: (value: number | null) => `₹${value?.toFixed(2) || '0.00'}`,
    },
    {
      field: 'gst_percent',
      headerName: 'GST %',
      flex: 0.4, minWidth: 50,
      type: 'number',
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        onAdd={handleAdd}
        addLabel="Add Product"
        onRefresh={refetch}
      />

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>
        <DataGrid
          rows={filteredProducts || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={selectedProduct}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        isLoading={deleteProduct.isPending}
        severity="error"
      />
    </Box>
  );
}
