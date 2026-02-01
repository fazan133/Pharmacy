import { useState } from 'react';
import { Box, Card, IconButton, TextField, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader, ConfirmDialog, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useDrugSchedules, useCreateDrugSchedule, useUpdateDrugSchedule, useDeleteDrugSchedule } from '../hooks/useMasters';
import { SimpleMasterFormDialog } from '../components/SimpleMasterFormDialog';
import { drugScheduleApi } from '../api/mastersApi';
import type { DrugSchedule } from '@/types/database.types';

export function DrugSchedulesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<DrugSchedule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error, refetch } = useDrugSchedules({ includeHidden: true });
  const createMutation = useCreateDrugSchedule();
  const updateMutation = useUpdateDrugSchedule();
  const deleteMutation = useDeleteDrugSchedule();

  const filtered = data?.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: Partial<DrugSchedule>) => {
    if (selected) {
      await updateMutation.mutateAsync({ id: selected.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData as DrugSchedule);
    }
    setFormOpen(false);
    setSelected(null);
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', flex: 0.5, minWidth: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 100 },
    { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 120 },
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
        title="Drug Schedules"
        subtitle="Manage drug schedule categories (H, H1, X, etc.)"
        onAdd={() => { setSelected(null); setFormOpen(true); }}
        addLabel="Add Schedule"
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
        title="Drug Schedule"
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onGenerateCode={drugScheduleApi.generateCode}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Drug Schedule"
        message={`Are you sure you want to delete "${selected?.name}"?`}
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
