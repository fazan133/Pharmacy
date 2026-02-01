import { useState } from 'react';
import { Box, Card, TextField, Chip, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { PageHeader, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useStockLedger } from '../hooks/useInventory';

export function StockLedgerPage() {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data, isLoading, error, refetch } = useStockLedger({
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
  });

  const filtered = data?.filter((entry) => {
    if (!search) return true;
    return (
      entry.batch?.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      entry.batch?.batch_no?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getTransactionColor = (type: string) => {
    if (type.includes('in') || type === 'purchase') return 'success';
    if (type.includes('out') || type === 'sale') return 'error';
    return 'default';
  };

  const columns: GridColDef[] = [
    { 
      field: 'created_at', 
      headerName: 'Date/Time', 
      width: 150,
      valueFormatter: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm'),
    },
    { 
      field: 'product_name', 
      headerName: 'Product', 
      flex: 1,
      valueGetter: (_, row) => row.batch?.product?.name,
    },
    { 
      field: 'batch_no', 
      headerName: 'Batch', 
      width: 100,
      valueGetter: (_, row) => row.batch?.batch_no,
    },
    { 
      field: 'transaction_type', 
      headerName: 'Type', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value.replace('_', ' ')} 
          size="small"
          color={getTransactionColor(params.value) as 'success' | 'error' | 'default'}
          variant="outlined"
        />
      ),
    },
    { 
      field: 'qty', 
      headerName: 'Qty', 
      width: 80,
      type: 'number',
      renderCell: (params) => {
        const isIn = params.row.transaction_type.includes('in') || params.row.transaction_type === 'purchase';
        return (
          <Typography 
            variant="body2" 
            fontWeight="bold"
            color={isIn ? 'success.main' : 'error.main'}
          >
            {isIn ? '+' : '-'}{params.value}
          </Typography>
        );
      },
    },
    { 
      field: 'balance_qty', 
      headerName: 'Balance', 
      width: 90,
      type: 'number',
    },
    { 
      field: 'reference_type', 
      headerName: 'Reference', 
      width: 120,
    },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      flex: 1,
    },
  ];

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  return (
    <Box>
      <PageHeader
        title="Stock Ledger"
        subtitle="Track all stock movements"
        onRefresh={refetch}
      />

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search product, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />
          <DatePicker
            label="From Date"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
          />
          <DatePicker
            label="To Date"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
          />
        </Box>
        <DataGrid
          rows={filtered || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[25, 50, 100]}
          initialState={{ 
            pagination: { paginationModel: { pageSize: 50 } },
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>
    </Box>
  );
}
