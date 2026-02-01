import { useState, useEffect } from 'react';
import { Grid2 as Grid, TextField, FormControlLabel, Checkbox, InputAdornment, IconButton } from '@mui/material';
import { AutoAwesome as AutoCodeIcon } from '@mui/icons-material';
import { FormDialog } from '@/components/common';

interface SimpleMasterFormDialogProps<T> {
  open: boolean;
  onClose: () => void;
  item: T | null;
  title: string;
  onSave: (data: Partial<T>) => Promise<void>;
  isSaving: boolean;
  onGenerateCode?: () => Promise<string>;
  fields?: {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'textarea';
    required?: boolean;
  }[];
}

const defaultFields = [
  { name: 'code', label: 'Code', required: true },
  { name: 'name', label: 'Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' as const },
];

export function SimpleMasterFormDialog<T extends Record<string, unknown>>({
  open,
  onClose,
  item,
  title,
  onSave,
  isSaving,
  onGenerateCode,
  fields = defaultFields,
}: SimpleMasterFormDialogProps<T>) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      const initial: Record<string, unknown> = {
        is_active: true,
        is_hidden: false,
      };
      fields.forEach((f) => {
        initial[f.name] = f.type === 'number' ? 0 : '';
      });
      setFormData(initial);
    }
  }, [item, open, fields]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = async () => {
    if (onGenerateCode) {
      try {
        const code = await onGenerateCode();
        setFormData((prev) => ({ ...prev, code }));
      } catch (error) {
        console.error('Failed to generate code:', error);
      }
    }
  };

  const handleSave = async () => {
    await onSave(formData as Partial<T>);
  };

  const requiredFields = fields.filter((f) => f.required);
  const isValid = requiredFields.every((f) => formData[f.name]);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`${isEditing ? 'Edit' : 'Add'} ${title}`}
      onSave={handleSave}
      isSaving={isSaving}
      maxWidth="sm"
      disableSave={!isValid}
    >
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid key={field.name} size={field.type === 'textarea' ? 12 : 6}>
            <TextField
              label={field.label}
              type={field.type === 'number' ? 'number' : 'text'}
              value={formData[field.name] || ''}
              onChange={(e) =>
                handleChange(
                  field.name,
                  field.type === 'number'
                    ? parseFloat(e.target.value) || 0
                    : e.target.value
                )
              }
              required={field.required}
              fullWidth
              multiline={field.type === 'textarea'}
              rows={field.type === 'textarea' ? 3 : 1}
              InputProps={
                field.name === 'code' && onGenerateCode
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleGenerateCode} title="Generate Code">
                            <AutoCodeIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : undefined
              }
            />
          </Grid>
        ))}

        <Grid size={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(formData.is_active)}
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
                checked={Boolean(formData.is_hidden)}
                onChange={(e) => handleChange('is_hidden', e.target.checked)}
              />
            }
            label="Hidden from dropdowns"
          />
        </Grid>
      </Grid>
    </FormDialog>
  );
}
