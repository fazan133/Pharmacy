import { useState } from 'react';
import { Box, Card, TextField, Chip, Typography, Tabs, Tab } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { format, differenceInDays } from 'date-fns';
import { PageHeader, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useBatches } from '../hooks/useInventory';

export function BatchStockPage() {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'low'>('all');

  const { data, isLoading, error, refetch } = useBatches();

  const filtered = data?.filter((batch) => {
    const matchesSearch = 
      batch.product.name.toLowerCase().includes(search.toLowerCase()) ||
      batch.product.code.toLowerCase().includes(search.toLowerCase()) ||
      batch.batch_no.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === 'instock') return batch.available_qty > 0;
    if (stockFilter === 'low') return batch.available_qty > 0 && batch.available_qty <= (batch.product.reorder_level || 10);
    return true;
  });

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { label: 'Expired', color: 'error' as const };
    if (days <= 30) return { label: `${days}d`, color: 'error' as const };
    if (days <= 90) return { label: `${days}d`, color: 'warning' as const };
    return { label: format(new Date(expiryDate), 'MM/yy'), color: 'default' as const };
  };

  const columns: GridColDef[] = [
    { 
      field: 'product_code', 
      headerName: 'Code', 
      flex: 0.5, minWidth: 70,
      valueGetter: (_, row) => row.product?.code,
    },
    { 
      field: 'product_name', 
      headerName: 'Product', 
      flex: 1.5, minWidth: 120,
      valueGetter: (_, row) => row.product?.name,
    },
    { field: 'batch_no', headerName: 'Batch', flex: 0.6, minWidth: 80 },
    { 
      field: 'expiry_date', 
      headerName: 'Expiry', 
      flex: 0.5, minWidth: 70,
      renderCell: (params) => {
        const status = getExpiryStatus(params.value);
        return <Chip label={status.label} size="small" color={status.color} />;
      },
    },
    { 
      field: 'available_qty', 
      headerName: 'Stock', 
      flex: 0.5, minWidth: 60,
      type: 'number',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          fontWeight="bold"
          color={params.value <= 0 ? 'error' : params.value <= 10 ? 'warning.main' : 'inherit'}
        >
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'purchase_rate', 
      headerName: 'P.Rate', 
      width: 90,
      type: 'number',
      valueFormatter: (value) => `₹${value}`,
    },
    { 
      field: 'mrp', 
      headerName: 'MRP', 
      width: 90,
      type: 'number',
      valueFormatter: (value) => `₹${value}`,
    },
    { 
      field: 'stock_value', 
      headerName: 'Value', 
      width: 120,
      type: 'number',
      valueGetter: (_, row) => row.available_qty * row.mrp,
      valueFormatter: (value: number) => `₹${value?.toLocaleString('en-IN')}`,
    },
  ];

  // Calculate summary
  const summary = filtered?.reduce((acc, batch) => ({
    totalBatches: acc.totalBatches + 1,
    totalQty: acc.totalQty + batch.available_qty,
    totalValue: acc.totalValue + (batch.available_qty * batch.mrp),
  }), { totalBatches: 0, totalQty: 0, totalValue: 0 });

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  return (
    <Box>
      <PageHeader
        title="Batch Stock"
        subtitle="View stock by batch with expiry tracking"
        onRefresh={refetch}
      />

      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search product, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />

          <Tabs value={stockFilter} onChange={(_, v) => setStockFilter(v)} sx={{ ml: 'auto' }}>
            <Tab label="All" value="all" />
            <Tab label="In Stock" value="instock" />
            <Tab label="Low Stock" value="low" />
          </Tabs>
        </Box>
      </Card>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Total Batches</Typography>
          <Typography variant="h5">{summary?.totalBatches || 0}</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
          <Typography variant="h5">{summary?.totalQty?.toLocaleString() || 0}</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Stock Value (MRP)</Typography>
          <Typography variant="h5" color="primary">₹{summary?.totalValue?.toLocaleString('en-IN') || 0}</Typography>
        </Card>
      </Box>

      <Card>
        <DataGrid
          rows={filtered || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[25, 50, 100]}
          initialState={{ 
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'expiry_date', sort: 'asc' }] }
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>
    </Box>
  );
}
