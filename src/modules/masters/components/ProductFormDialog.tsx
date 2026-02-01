import { useState, useEffect } from 'react';
import {
  Grid2 as Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { AutoMode as AutoCodeIcon, Add as AddIcon } from '@mui/icons-material';
import { FormDialog } from '@/components/common';
import {
  useCreateProduct,
  useUpdateProduct,
  useCategoryDropdown,
  useCompanyDropdown,
  useHsnCodeDropdown,
  useDrugScheduleDropdown,
  useDrugFormulaDropdown,
  useProductTypeDropdown,
  useCreateCategory,
  useCreateCompany,
  useCreateHsnCode,
  useCreateDrugSchedule,
  useCreateDrugFormula,
  useCreateProductType,
} from '../hooks/useMasters';
import { productApi, categoryApi, companyApi, hsnCodeApi, drugScheduleApi, drugFormulaApi, productTypeApi } from '../api/mastersApi';
import { SimpleMasterFormDialog } from './SimpleMasterFormDialog';
import type { Product, ProductInsert, Category, Company, HsnCode, DrugSchedule, DrugFormula, ProductType } from '@/types/database.types';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const initialFormData: Partial<ProductInsert> = {
  code: '',
  name: '',
  category_id: null,
  company_id: null,
  product_type_id: null,
  hsn_id: null,
  schedule_id: null,
  formula_id: null,
  unit: 'PCS',
  pack_size: 1,
  mrp: 0,
  purchase_rate: 0,
  selling_rate: 0,
  gst_percent: 0,
  min_stock: 0,
  max_stock: 0,
  reorder_level: 0,
  barcode: '',
  rack_location: '',
  is_active: true,
  is_hidden: false,
};

export function ProductFormDialog({ open, onClose, product }: ProductFormDialogProps) {
  const [formData, setFormData] = useState<Partial<ProductInsert>>(initialFormData);
  
  // Quick add dialogs state
  const [quickAddDialog, setQuickAddDialog] = useState<{
    type: 'category' | 'company' | 'hsn' | 'schedule' | 'formula' | 'productType' | null;
    open: boolean;
  }>({ type: null, open: false });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { data: categories, refetch: refetchCategories } = useCategoryDropdown();
  const { data: companies, refetch: refetchCompanies } = useCompanyDropdown();
  const { data: hsnCodes, refetch: refetchHsnCodes } = useHsnCodeDropdown();
  const { data: schedules, refetch: refetchSchedules } = useDrugScheduleDropdown();
  const { data: formulas, refetch: refetchFormulas } = useDrugFormulaDropdown();
  const { data: productTypes, refetch: refetchProductTypes } = useProductTypeDropdown();
  
  // Quick add mutations
  const createCategory = useCreateCategory();
  const createCompany = useCreateCompany();
  const createHsnCode = useCreateHsnCode();
  const createSchedule = useCreateDrugSchedule();
  const createFormula = useCreateDrugFormula();
  const createProductType = useCreateProductType();

  const isEditing = !!product;
  const isSaving = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        category_id: product.category_id,
        company_id: product.company_id,
        product_type_id: product.product_type_id,
        hsn_id: product.hsn_id,
        schedule_id: product.schedule_id,
        formula_id: product.formula_id,
        unit: product.unit,
        pack_size: product.pack_size,
        mrp: product.mrp,
        purchase_rate: product.purchase_rate,
        selling_rate: product.selling_rate,
        gst_percent: product.gst_percent,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
        reorder_level: product.reorder_level,
        barcode: product.barcode || '',
        rack_location: product.rack_location || '',
        is_active: product.is_active,
        is_hidden: product.is_hidden,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [product, open]);

  const handleChange = (field: keyof ProductInsert, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill GST percent from HSN code (total = cgst + sgst)
    if (field === 'hsn_id' && value) {
      const hsn = hsnCodes?.find((h) => h.id === value);
      if (hsn) {
        const totalGst = (hsn.cgst_percent || 0) + (hsn.sgst_percent || 0);
        setFormData((prev) => ({ ...prev, gst_percent: totalGst }));
      }
    }
  };

  const handleGenerateCode = async () => {
    try {
      const code = await productApi.generateCode();
      setFormData((prev) => ({ ...prev, code }));
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };

  const handleQuickAddSave = async (data: Record<string, unknown>) => {
    const type = quickAddDialog.type;
    if (!type) return;

    try {
      let newItem: { id: string } | null = null;
      switch (type) {
        case 'category':
          newItem = await createCategory.mutateAsync(data as Category);
          await refetchCategories();
          setFormData((prev) => ({ ...prev, category_id: newItem?.id }));
          break;
        case 'company':
          newItem = await createCompany.mutateAsync(data as Company);
          await refetchCompanies();
          setFormData((prev) => ({ ...prev, company_id: newItem?.id }));
          break;
        case 'hsn':
          newItem = await createHsnCode.mutateAsync(data as HsnCode);
          await refetchHsnCodes();
          setFormData((prev) => ({ ...prev, hsn_id: newItem?.id }));
          break;
        case 'schedule':
          newItem = await createSchedule.mutateAsync(data as DrugSchedule);
          await refetchSchedules();
          setFormData((prev) => ({ ...prev, schedule_id: newItem?.id }));
          break;
        case 'formula':
          newItem = await createFormula.mutateAsync(data as DrugFormula);
          await refetchFormulas();
          setFormData((prev) => ({ ...prev, formula_id: newItem?.id }));
          break;
        case 'productType':
          newItem = await createProductType.mutateAsync(data as ProductType);
          await refetchProductTypes();
          setFormData((prev) => ({ ...prev, product_type_id: newItem?.id }));
          break;
      }
      setQuickAddDialog({ type: null, open: false });
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const getQuickAddConfig = () => {
    switch (quickAddDialog.type) {
      case 'category':
        return { title: 'Category', onGenerateCode: categoryApi.generateCode, isSaving: createCategory.isPending };
      case 'company':
        return { title: 'Company', onGenerateCode: companyApi.generateCode, isSaving: createCompany.isPending, fields: [
          { name: 'code', label: 'Code', required: true },
          { name: 'name', label: 'Name', required: true },
        ]};
      case 'hsn':
        return { title: 'HSN Code', onGenerateCode: hsnCodeApi.generateCode, isSaving: createHsnCode.isPending, fields: [
          { name: 'code', label: 'HSN Code', required: true },
          { name: 'cgst_percent', label: 'CGST %', type: 'number' as const, required: true },
          { name: 'sgst_percent', label: 'SGST %', type: 'number' as const, required: true },
        ]};
      case 'schedule':
        return { title: 'Drug Schedule', onGenerateCode: drugScheduleApi.generateCode, isSaving: createSchedule.isPending };
      case 'formula':
        return { title: 'Drug Formula', onGenerateCode: drugFormulaApi.generateCode, isSaving: createFormula.isPending };
      case 'productType':
        return { title: 'Product Type', onGenerateCode: productTypeApi.generateCode, isSaving: createProductType.isPending };
      default:
        return { title: '', isSaving: false };
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) return;

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({
          id: product.id,
          data: formData,
        });
      } else {
        await createProduct.mutateAsync(formData as ProductInsert);
      }
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add Product'}
      onSave={handleSave}
      isSaving={isSaving}
      maxWidth="md"
      disableSave={!formData.code || !formData.name}
    >
      <Grid container spacing={2}>
        {/* Basic Info */}
        <Grid size={12}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Basic Information
          </Typography>
        </Grid>

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

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category_id || ''}
                label="Category"
                onChange={(e) => handleChange('category_id', e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {categories?.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" color="primary" onClick={() => setQuickAddDialog({ type: 'category', open: true })} title="Add Category">
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Company/Brand</InputLabel>
              <Select
                value={formData.company_id || ''}
                label="Company/Brand"
                onChange={(e) => handleChange('company_id', e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {companies?.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" color="primary" onClick={() => setQuickAddDialog({ type: 'company', open: true })} title="Add Company">
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Product Type</InputLabel>
              <Select
                value={formData.product_type_id || ''}
                label="Product Type"
                onChange={(e) => handleChange('product_type_id', e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {productTypes?.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" color="primary" onClick={() => setQuickAddDialog({ type: 'productType', open: true })} title="Add Product Type">
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        {/* Drug Info */}
        <Grid size={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Drug Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>HSN Code</InputLabel>
              <Select
                value={formData.hsn_id || ''}
                label="HSN Code"
                onChange={(e) => handleChange('hsn_id', e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {hsnCodes?.map((h) => (
                  <MenuItem key={h.id} value={h.id}>
                    {h.code} ({(h.cgst_percent || 0) + (h.sgst_percent || 0)}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" color="primary" onClick={() => setQuickAddDialog({ type: 'hsn', open: true })} title="Add HSN Code">
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Schedule</InputLabel>
              <Select
                value={formData.schedule_id || ''}
                label="Schedule"
                onChange={(e) => handleChange('schedule_id', e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {schedules?.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" color="primary" onClick={() => setQuickAddDialog({ type: 'schedule', open: true })} title="Add Schedule">
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Formula/Salt</InputLabel>
              <Select
                value={formData.formula_id || ''}
                label="Formula/Salt"
                onChange={(e) => handleChange('formula_id', e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {formulas?.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small" color="primary" onClick={() => setQuickAddDialog({ type: 'formula', open: true })} title="Add Formula">
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        {/* Pricing */}
        <Grid size={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Pricing & Stock
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Unit"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="Pack Size"
            type="number"
            value={formData.pack_size}
            onChange={(e) => handleChange('pack_size', parseInt(e.target.value) || 1)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="MRP"
            type="number"
            value={formData.mrp}
            onChange={(e) => handleChange('mrp', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="GST %"
            type="number"
            value={formData.gst_percent}
            onChange={(e) => handleChange('gst_percent', parseFloat(e.target.value) || 0)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            label="Purchase Rate"
            type="number"
            value={formData.purchase_rate}
            onChange={(e) => handleChange('purchase_rate', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            label="Selling Rate"
            type="number"
            value={formData.selling_rate}
            onChange={(e) => handleChange('selling_rate', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Barcode"
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Stock Levels */}
        <Grid size={{ xs: 4 }}>
          <TextField
            label="Min Stock"
            type="number"
            value={formData.min_stock}
            onChange={(e) => handleChange('min_stock', parseInt(e.target.value) || 0)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <TextField
            label="Max Stock"
            type="number"
            value={formData.max_stock}
            onChange={(e) => handleChange('max_stock', parseInt(e.target.value) || 0)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <TextField
            label="Reorder Level"
            type="number"
            value={formData.reorder_level}
            onChange={(e) => handleChange('reorder_level', parseInt(e.target.value) || 0)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Rack Location"
            value={formData.rack_location}
            onChange={(e) => handleChange('rack_location', e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 6, sm: 3 }}>
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

        <Grid size={{ xs: 6, sm: 3 }}>
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

      {/* Quick Add Dialog */}
      {quickAddDialog.open && quickAddDialog.type && (
        <SimpleMasterFormDialog
          open={quickAddDialog.open}
          onClose={() => setQuickAddDialog({ type: null, open: false })}
          item={null}
          title={getQuickAddConfig().title}
          onSave={handleQuickAddSave}
          isSaving={getQuickAddConfig().isSaving}
          onGenerateCode={getQuickAddConfig().onGenerateCode}
          fields={getQuickAddConfig().fields}
        />
      )}
    </FormDialog>
  );
}
