import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, IconButton, TextField, Chip, Typography, Tooltip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Visibility as ViewIcon, Delete as DeleteIcon, Print as PrintIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { PageHeader, ConfirmDialog, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useSalesInvoices, useDeleteSalesInvoice } from '../hooks/useSales';
import type { SalesInvoiceWithItems } from '../api/salesApi';

export function SalesInvoicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SalesInvoiceWithItems | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error, refetch } = useSalesInvoices();
  const deleteMutation = useDeleteSalesInvoice();

  const filtered = data?.filter(
    (item) =>
      item.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      item.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { 
      field: 'invoice_no', 
      headerName: 'Invoice No', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'invoice_date', 
      headerName: 'Date', 
      width: 100,
      valueFormatter: (value) => format(new Date(value), 'dd/MM/yyyy'),
    },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      flex: 1,
      valueGetter: (value: { name: string } | null) => value?.name || 'Walk-in',
    },
    {
      field: 'invoice_type',
      headerName: 'Type',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'cash' ? 'success' : 'primary'}
          variant="outlined"
        />
      ),
    },
    { 
      field: 'net_amount', 
      headerName: 'Amount', 
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
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
          label={params.value || 'paid'}
          color={
            params.value === 'paid' ? 'success' :
            params.value === 'partial' ? 'warning' : 'error'
          }
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/sales/invoices/${params.row.id}`)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton size="small" color="primary">
              <PrintIcon fontSize="small" />
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
        title="Sales Invoices"
        subtitle="View sales history"
        onAdd={() => navigate('/sales/pos')}
        addLabel="New Sale (POS)"
        onRefresh={refetch}
      />

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search by invoice no, customer..."
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
        title="Delete Sales Invoice"
        message={`Are you sure you want to delete invoice "${selected?.invoice_no}"? This action cannot be undone.`}
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
