import { useState, useEffect } from 'react';
import { Grid2 as Grid, TextField, FormControlLabel, Checkbox, InputAdornment, IconButton } from '@mui/material';
import { AutoMode as AutoCodeIcon } from '@mui/icons-material';
import { FormDialog } from '@/components/common';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useMasters';
import { customerApi } from '../api/mastersApi';
import type { Customer, CustomerInsert } from '@/types/database.types';

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const initialData: Partial<CustomerInsert> = {
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gst_no: '',
  credit_days: 0,
  credit_limit: 0,
  opening_balance: 0,
  is_active: true,
  is_hidden: false,
};

export function CustomerFormDialog({ open, onClose, customer }: CustomerFormDialogProps) {
  const [formData, setFormData] = useState<Partial<CustomerInsert>>(initialData);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEditing = !!customer;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    } else {
      setFormData(initialData);
    }
  }, [customer, open]);

  const handleChange = (field: keyof CustomerInsert, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = async () => {
    try {
      const code = await customerApi.generateCode();
      setFormData((prev) => ({ ...prev, code }));
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) return;

    if (isEditing && customer) {
      await updateMutation.mutateAsync({ id: customer.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData as CustomerInsert);
    }
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Customer' : 'Add Customer'}
      onSave={handleSave}
      isSaving={isSaving}
      maxWidth="md"
      disableSave={!formData.code || !formData.name}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleGenerateCode}>
                    <AutoCodeIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="GST No"
            value={formData.gst_no}
            onChange={(e) => handleChange('gst_no', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="State"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Pincode"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Credit Days"
            type="number"
            value={formData.credit_days}
            onChange={(e) => handleChange('credit_days', parseInt(e.target.value) || 0)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Credit Limit"
            type="number"
            value={formData.credit_limit}
            onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Opening Balance"
            type="number"
            value={formData.opening_balance}
            onChange={(e) => handleChange('opening_balance', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
            }
            label="Active"
          />
        </Grid>

        <Grid size={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_hidden}
                onChange={(e) => handleChange('is_hidden', e.target.checked)}
              />
            }
            label="Hidden"
          />
        </Grid>
      </Grid>
    </FormDialog>
  );
}
