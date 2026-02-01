import { Box, Card, Typography, Alert, AlertTitle } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Warning as WarningIcon } from '@mui/icons-material';
import { PageHeader, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useLowStockProducts } from '../hooks/useInventory';

export function LowStockPage() {
  const { data, isLoading, error, refetch } = useLowStockProducts();

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', flex: 0.5, minWidth: 70 },
    { field: 'name', headerName: 'Product', flex: 1.5, minWidth: 120 },
    { 
      field: 'current_stock', 
      headerName: 'Current Stock', 
      flex: 0.6, minWidth: 80,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="error">
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'reorder_level', 
      headerName: 'Reorder Level', 
      flex: 0.6, minWidth: 80,
      type: 'number',
    },
    { 
      field: 'shortage', 
      headerName: 'Shortage', 
      flex: 0.5, minWidth: 70,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="warning.main">
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'mrp', 
      headerName: 'MRP', 
      flex: 0.5, minWidth: 70,
      type: 'number',
      valueFormatter: (value) => value ? `₹${value}` : '-',
    },
  ];

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  return (
    <Box>
      <PageHeader
        title="Low Stock Alert"
        subtitle="Products below reorder level"
        onRefresh={refetch}
      />

      {data && data.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          <AlertTitle>Attention Required</AlertTitle>
          {data.length} products are below their reorder level and need to be restocked.
        </Alert>
      )}

      <Card>
        <DataGrid
          rows={data || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ 
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'shortage', sort: 'desc' }] }
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
          localeText={{
            noRowsLabel: 'No low stock items - all products are adequately stocked!',
          }}
        />
      </Card>
    </Box>
  );
}
