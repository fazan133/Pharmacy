import { useState } from 'react';
import { Box, Card, IconButton, TextField, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader, ConfirmDialog, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useHsnCodes, useCreateHsnCode, useUpdateHsnCode, useDeleteHsnCode } from '../hooks/useMasters';
import { SimpleMasterFormDialog } from '../components/SimpleMasterFormDialog';
import { hsnCodeApi } from '../api/mastersApi';
import type { HsnCode } from '@/types/database.types';

const fields = [
  { name: 'code', label: 'HSN Code', required: true },
  { name: 'cgst_percent', label: 'CGST %', type: 'number' as const, required: true },
  { name: 'sgst_percent', label: 'SGST %', type: 'number' as const, required: true },
  { name: 'description', label: 'Description', type: 'textarea' as const },
];

export function HsnCodesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<HsnCode | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error, refetch } = useHsnCodes({ includeHidden: true });
  const createMutation = useCreateHsnCode();
  const updateMutation = useUpdateHsnCode();
  const deleteMutation = useDeleteHsnCode();

  const filtered = data?.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handleSave = async (formData: Partial<HsnCode>) => {
    // Calculate total gst_percent from cgst + sgst
    const dataToSave = {
      ...formData,
      gst_percent: (formData.cgst_percent || 0) + (formData.sgst_percent || 0),
    };
    if (selected) {
      await updateMutation.mutateAsync({ id: selected.id, data: dataToSave });
    } else {
      await createMutation.mutateAsync(dataToSave as HsnCode);
    }
    setFormOpen(false);
    setSelected(null);
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'HSN Code', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'cgst_percent', headerName: 'CGST %', width: 90, type: 'number' },
    { field: 'sgst_percent', headerName: 'SGST %', width: 90, type: 'number' },
    { 
      field: 'total_gst', 
      headerName: 'Total GST %', 
      width: 100, 
      type: 'number',
      valueGetter: (_value, row) => (row.cgst_percent || 0) + (row.sgst_percent || 0),
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
          <IconButton size="small" onClick={() => { setSelected(params.row); setFormOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => { setSelected(params.row); setDeleteOpen(true); }}>
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
        title="HSN Codes"
        subtitle="Manage HSN codes and GST rates"
        onAdd={() => { setSelected(null); setFormOpen(true); }}
        addLabel="Add HSN Code"
        onRefresh={refetch}
      />

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>
        <DataGrid
          rows={filtered || []}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      <SimpleMasterFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={selected}
        title="HSN Code"
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
        fields={fields}
        onGenerateCode={hsnCodeApi.generateCode}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete HSN Code"
        message={`Are you sure you want to delete "${selected?.code}"?`}
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
