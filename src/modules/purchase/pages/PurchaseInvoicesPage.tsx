import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, IconButton, TextField, Chip, Tooltip, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Visibility as ViewIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { PageHeader, ConfirmDialog, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { usePurchaseInvoices, useDeletePurchaseInvoice } from '../hooks/usePurchase';
import type { PurchaseInvoiceWithItems } from '../api/purchaseApi';

export function PurchaseInvoicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PurchaseInvoiceWithItems | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error, refetch } = usePurchaseInvoices();
  const deleteMutation = useDeletePurchaseInvoice();

  const filtered = data?.filter(
    (item) =>
      item.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier_invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier?.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { 
      field: 'invoice_no', 
      headerName: 'Invoice No', 
      flex: 0.8, minWidth: 100
    },
    { 
      field: 'invoice_date', 
      headerName: 'Date', 
      flex: 0.5, minWidth: 80,
      valueFormatter: (value) => format(new Date(value), 'dd/MM/yyyy'),
    },
    { 
      field: 'supplier', 
      headerName: 'Supplier', 
      flex: 1.2, minWidth: 100,
      valueGetter: (value: { name: string }) => value?.name || '-',
    },
    { field: 'supplier_invoice_no', headerName: 'Supplier Inv#', flex: 0.6, minWidth: 80 },
    { 
      field: 'subtotal', 
      headerName: 'Gross', 
      flex: 0.5, minWidth: 70,
      type: 'number',
      valueFormatter: (value: number | null) => `₹${value?.toLocaleString('en-IN') || '0'}`,
    },
    { 
      field: 'total_gst', 
      headerName: 'GST', 
      width: 80,
      type: 'number',
      valueFormatter: (value: number | null) => `₹${value?.toLocaleString('en-IN') || '0'}`,
    },
    { 
      field: 'grand_total', 
      headerName: 'Net Amount', 
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          ₹{params.value?.toLocaleString('en-IN') || '0'}
        </Typography>
      ),
    },
    {
      field: 'payment_status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || 'pending'}
          color={
            params.value === 'paid' ? 'success' :
            params.value === 'partial' ? 'warning' : 'default'
          }
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
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => navigate(`/purchase/invoices/${params.row.id}`)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => { setSelected(params.row); setDeleteOpen(true); }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  return (
    <Box>
      <PageHeader
        title="Purchase Invoices"
        subtitle="Manage purchase bills from suppliers"
        onAdd={() => navigate('/purchase/invoices/new')}
        addLabel="New Purchase"
        onRefresh={refetch}
      />

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search by invoice no, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 350 }}
          />
        </Box>
        <DataGrid
          rows={filtered || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ 
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'invoice_date', sort: 'desc' }] }
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Purchase Invoice"
        message={`Are you sure you want to delete invoice "${selected?.invoice_no}"? This will also delete all associated items and batches.`}
        onConfirm={async () => {
          if (selected) await deleteMutation.mutateAsync(selected.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteMutation.isPending}
        severity="error"
      />
    </Box>
  );
}
