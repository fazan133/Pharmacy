import { useState } from 'react';
import { Box, Card, Typography, Alert, AlertTitle, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Warning as WarningIcon, Error as ErrorIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { PageHeader, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useExpiringBatches } from '../hooks/useInventory';

export function ExpiryAlertPage() {
  const [daysFilter, setDaysFilter] = useState<number>(90);

  const { data, isLoading, error, refetch } = useExpiringBatches(daysFilter);

  const expiredCount = data?.filter(b => b.days_to_expiry < 0).length || 0;
  const criticalCount = data?.filter(b => b.days_to_expiry >= 0 && b.days_to_expiry <= 30).length || 0;
  const warningCount = data?.filter(b => b.days_to_expiry > 30 && b.days_to_expiry <= 90).length || 0;

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
      flex: 0.6, minWidth: 90,
      valueFormatter: (value) => format(new Date(value), 'dd/MM/yyyy'),
    },
    { 
      field: 'days_to_expiry', 
      headerName: 'Status', 
      flex: 0.6, minWidth: 90,
      renderCell: (params) => {
        const days = params.value;
        if (days < 0) {
          return <Chip icon={<ErrorIcon />} label="Expired" color="error" size="small" />;
        }
        if (days <= 30) {
          return <Chip icon={<WarningIcon />} label={`${days} days`} color="error" size="small" />;
        }
        return <Chip label={`${days} days`} color="warning" size="small" />;
      },
    },
    { 
      field: 'available_qty', 
      headerName: 'Stock', 
      flex: 0.4, minWidth: 60,
      type: 'number',
    },
    { 
      field: 'mrp', 
      headerName: 'MRP', 
      width: 90,
      type: 'number',
      valueFormatter: (value: number) => `₹${value}`,
    },
    { 
      field: 'stock_value', 
      headerName: 'At Risk Value', 
      width: 120,
      type: 'number',
      valueGetter: (_, row) => row.available_qty * row.mrp,
      valueFormatter: (value: number) => `₹${value?.toLocaleString('en-IN')}`,
    },
  ];

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  const totalAtRisk = data?.reduce((sum, b) => sum + (b.available_qty * b.mrp), 0) || 0;

  return (
    <Box>
      <PageHeader
        title="Expiry Alert"
        subtitle="Track expiring and expired batches"
        onRefresh={refetch}
      />

      {expiredCount > 0 && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
          <AlertTitle>Expired Stock</AlertTitle>
          {expiredCount} batch(es) have already expired and should be removed from inventory.
        </Alert>
      )}

      {criticalCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          <AlertTitle>Critical - Expiring Soon</AlertTitle>
          {criticalCount} batch(es) will expire within 30 days. Consider promotional sales.
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Card sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'error.light' }}>
          <Typography variant="body2" color="error.contrastText">Expired</Typography>
          <Typography variant="h5" color="error.contrastText">{expiredCount}</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'warning.light' }}>
          <Typography variant="body2">≤30 Days</Typography>
          <Typography variant="h5">{criticalCount}</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'info.light' }}>
          <Typography variant="body2">31-90 Days</Typography>
          <Typography variant="h5">{warningCount}</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1, minWidth: 150 }}>
          <Typography variant="body2" color="text.secondary">At Risk Value</Typography>
          <Typography variant="h5" color="error">₹{totalAtRisk.toLocaleString('en-IN')}</Typography>
        </Card>
      </Box>

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <ToggleButtonGroup
            value={daysFilter}
            exclusive
            onChange={(_, value) => value && setDaysFilter(value)}
            size="small"
          >
            <ToggleButton value={30}>30 Days</ToggleButton>
            <ToggleButton value={60}>60 Days</ToggleButton>
            <ToggleButton value={90}>90 Days</ToggleButton>
            <ToggleButton value={180}>6 Months</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <DataGrid
          rows={data || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[25, 50, 100]}
          initialState={{ 
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'days_to_expiry', sort: 'asc' }] }
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
          localeText={{
            noRowsLabel: `No batches expiring within ${daysFilter} days!`,
          }}
        />
      </Card>
    </Box>
  );
}
