import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Grid2 as Grid, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Typography,
  Autocomplete, Divider, Paper, IconButton, MenuItem, Select, FormControl, InputLabel,
  Popper, ClickAwayListener, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { PageHeader, LoadingOverlay } from '@/components/common';
import { useSuppliers, useProducts, useHsnCodes } from '@/modules/masters/hooks/useMasters';
import { useCreatePurchaseInvoice, useGeneratePurchaseInvoiceNo } from '../hooks/usePurchase';
import { batchApi } from '../api/purchaseApi';
import { SupplierFormDialog } from '@/modules/masters/components/SupplierFormDialog';
import { ProductFormDialog } from '@/modules/masters/components/ProductFormDialog';
import type { Supplier, Product, Batch } from '@/types/database.types';

type PurchaseType = 'in_state' | 'out_of_state';
type PaymentMode = 'cash' | 'card';

interface InvoiceItem {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  packaging: string;
  hsn_code: string;
  batch_no: string;
  mfg_date: Date | null;
  expiry_date: Date | null;
  qty: number;
  free_qty: number;
  purchase_rate: number;
  mrp: number;
  margin_percent: number;
  discount_percent: number;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  gross_amount: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_amount: number;
  net_amount: number;
  cost_price: number;
  actual_cost_price: number;
  barcode: string | null;
  // Existing batch info
  existing_supplier_id: string | null;
  existing_supplier_name: string | null;
}

const createEmptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  product_id: '',
  product_code: '',
  product_name: '',
  packaging: '',
  hsn_code: '',
  batch_no: '',
  mfg_date: null,
  expiry_date: null,
  qty: 0,
  free_qty: 0,
  purchase_rate: 0,
  mrp: 0,
  margin_percent: 0,
  discount_percent: 0,
  gst_percent: 12,
  cgst_percent: 6,
  sgst_percent: 6,
  igst_percent: 0,
  gross_amount: 0,
  discount_amount: 0,
  taxable_amount: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  gst_amount: 0,
  net_amount: 0,
  cost_price: 0,
  actual_cost_price: 0,
  barcode: null,
  existing_supplier_id: null,
  existing_supplier_name: null,
});

export function PurchaseInvoiceFormPage() {
  const navigate = useNavigate();
  
  const { data: suppliers, isLoading: loadingSuppliers, refetch: refetchSuppliers } = useSuppliers();
  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } = useProducts();
  const { data: hsnCodes } = useHsnCodes();
  const { data: invoiceNo, isLoading: loadingInvoiceNo } = useGeneratePurchaseInvoiceNo();
  const createMutation = useCreatePurchaseInvoice();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [supplierInvoiceDate, setSupplierInvoiceDate] = useState<Date | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([createEmptyItem()]);
  const [notes, setNotes] = useState('');
  const [productBatches, setProductBatches] = useState<Record<string, (Batch & { supplier?: { id: string; name: string } })[]>>({});
  
  // New fields
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('in_state');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [cardNo, setCardNo] = useState('');
  
  // Dialog states
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  
  // Batch popup state
  const [batchPopupAnchor, setBatchPopupAnchor] = useState<HTMLElement | null>(null);
  const [batchPopupItemId, setBatchPopupItemId] = useState<string | null>(null);

  // Fetch batches when product is selected (all batches for suggestions)
  const fetchBatchesForProduct = useCallback(async (productId: string) => {
    if (!productId || productBatches[productId]) return;
    try {
      const batches = await batchApi.getAllByProduct(productId);
      setProductBatches(prev => ({ ...prev, [productId]: batches }));
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      // Set empty array to prevent repeated failed calls
      setProductBatches(prev => ({ ...prev, [productId]: [] }));
    }
  }, [productBatches]);

  const calculateItem = useCallback((item: InvoiceItem, isOutOfState: boolean = false): InvoiceItem => {
    const grossAmount = item.qty * item.purchase_rate;
    const discountAmount = grossAmount * (item.discount_percent / 100);
    const taxableAmount = grossAmount - discountAmount;
    
    // Calculate GST based on purchase type
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
    if (isOutOfState) {
      igstAmount = taxableAmount * (item.gst_percent / 100);
    } else {
      const halfGst = item.gst_percent / 2;
      cgstAmount = taxableAmount * (halfGst / 100);
      sgstAmount = taxableAmount * (halfGst / 100);
    }
    const gstAmount = cgstAmount + sgstAmount + igstAmount;
    const netAmount = taxableAmount + gstAmount;
    
    // Calculate cost price (per unit including GST)
    const totalQty = item.qty + item.free_qty;
    const costPrice = totalQty > 0 ? netAmount / totalQty : 0;
    
    // Actual cost price (cost price after margin consideration)
    const marginAmount = item.mrp * (item.margin_percent / 100);
    const actualCostPrice = item.mrp - marginAmount;

    return {
      ...item,
      cgst_percent: isOutOfState ? 0 : item.gst_percent / 2,
      sgst_percent: isOutOfState ? 0 : item.gst_percent / 2,
      igst_percent: isOutOfState ? item.gst_percent : 0,
      gross_amount: grossAmount,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      gst_amount: gstAmount,
      net_amount: netAmount,
      cost_price: costPrice,
      actual_cost_price: actualCostPrice,
    };
  }, []);

  const updateItem = (id: string, field: keyof InvoiceItem, value: unknown) => {
    const isOutOfState = purchaseType === 'out_of_state';
    setItems(prev => 
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        return calculateItem(updated, isOutOfState);
      })
    );
  };

  const recalculateAllItems = useCallback((isOutOfState: boolean) => {
    setItems(prev => prev.map(item => calculateItem(item, isOutOfState)));
  }, [calculateItem]);

  const handlePurchaseTypeChange = (newType: PurchaseType) => {
    setPurchaseType(newType);
    recalculateAllItems(newType === 'out_of_state');
  };

  const addItem = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleProductSelect = (itemId: string, product: Product | null) => {
    if (!product) return;
    
    // Fetch existing batches for this product
    fetchBatchesForProduct(product.id);
    
    // Get HSN code details
    const hsn = hsnCodes?.find(h => h.id === (product as any).hsn_id);
    const isOutOfState = purchaseType === 'out_of_state';
    
    setItems(prev => 
      prev.map(item => {
        if (item.id !== itemId) return item;
        return calculateItem({
          ...item,
          product_id: product.id,
          product_code: product.code,
          product_name: product.name,
          packaging: `${product.pack_size} ${product.unit}`,
          hsn_code: hsn?.code || '',
          mrp: product.mrp || 0,
          purchase_rate: product.purchase_rate || 0,
          gst_percent: product.gst_percent || hsn?.gst_percent || 12,
          barcode: product.barcode,
        }, isOutOfState);
      })
    );
  };

  const handleBatchSelect = (itemId: string, batch: (Batch & { supplier?: { id: string; name: string } }) | string | null) => {
    if (!batch) return;
    
    const isOutOfState = purchaseType === 'out_of_state';
    
    if (typeof batch === 'string') {
      // New batch number entered
      updateItem(itemId, 'batch_no', batch);
    } else {
      // Existing batch selected - auto-fill ALL fields from batch
      setItems(prev => 
        prev.map(item => {
          if (item.id !== itemId) return item;
          return calculateItem({
            ...item,
            batch_no: batch.batch_no,
            expiry_date: batch.expiry_date ? parseISO(batch.expiry_date) : null,
            mfg_date: batch.mfg_date ? parseISO(batch.mfg_date) : null,
            mrp: batch.mrp || item.mrp,
            purchase_rate: batch.purchase_rate || item.purchase_rate,
            // Keep qty as 0 for user to enter
            existing_supplier_id: (batch as any).supplier?.id || null,
            existing_supplier_name: (batch as any).supplier?.name || null,
          }, isOutOfState);
        })
      );
    }
  };

  // Calculate totals
  const totals = items.reduce((acc, item) => ({
    gross: acc.gross + item.gross_amount,
    discount: acc.discount + item.discount_amount,
    taxable: acc.taxable + item.taxable_amount,
    cgst: acc.cgst + item.cgst_amount,
    sgst: acc.sgst + item.sgst_amount,
    igst: acc.igst + item.igst_amount,
    gst: acc.gst + item.gst_amount,
    net: acc.net + item.net_amount,
    qty: acc.qty + item.qty,
  }), { gross: 0, discount: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, gst: 0, net: 0, qty: 0 });

  const handleSave = async () => {
    if (!supplier || !invoiceNo) return;

    const validItems = items.filter(item => item.product_id && item.qty > 0 && item.batch_no);
    if (validItems.length === 0) return;

    await createMutation.mutateAsync({
      invoice: {
        invoice_no: invoiceNo,
        invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
        supplier_id: supplier.id,
        supplier_invoice_no: supplierInvoiceNo || null,
        supplier_invoice_date: supplierInvoiceDate ? format(supplierInvoiceDate, 'yyyy-MM-dd') : null,
        subtotal: totals.gross,
        discount_amount: totals.discount,
        taxable_amount: totals.taxable,
        cgst_amount: totals.cgst,
        sgst_amount: totals.sgst,
        igst_amount: totals.igst,
        total_gst: totals.gst,
        grand_total: totals.net,
        paid_amount: totals.net,
        payment_status: 'paid',
        notes: notes || null,
      },
      items: validItems.map(item => ({
        product_id: item.product_id,
        batch_no: item.batch_no,
        mfg_date: item.mfg_date ? format(item.mfg_date, 'yyyy-MM-dd') : null,
        expiry_date: format(item.expiry_date!, 'yyyy-MM-dd'),
        qty: item.qty,
        free_qty: item.free_qty,
        purchase_rate: item.purchase_rate,
        mrp: item.mrp,
        discount_percent: item.discount_percent,
        gst_percent: item.gst_percent,
      })),
    });

    navigate('/purchase/invoices');
  };

  const isLoading = loadingSuppliers || loadingProducts || loadingInvoiceNo;

  if (isLoading) return <LoadingOverlay />;

  const isValid = supplier && items.some(item => 
    item.product_id && item.qty > 0 && item.batch_no && item.expiry_date
  );

  return (
    <Box>
      <PageHeader
        title="New Purchase Invoice"
        subtitle="Create a new purchase entry"
      />

      {/* Invoice Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Left side - Supplier */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Autocomplete
                  options={suppliers || []}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={supplier}
                  onChange={(_, value) => setSupplier(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Supplier" required size="small" />
                  )}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setSupplierDialogOpen(true)}
                >
                  Supplier
                </Button>
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setProductDialogOpen(true)}
                >
                  Product
                </Button>
              </Box>
              
              {/* Supplier Details */}
              {supplier && (
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">Contact</Typography>
                      <Typography variant="body2">{supplier.contact_person || '-'}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2">{supplier.phone || '-'}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">GST No</Typography>
                      <Typography variant="body2">{supplier.gst_no || '-'}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{supplier.email || '-'}</Typography>
                    </Grid>
                    {supplier.address && (
                      <Grid size={12}>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography variant="body2">{supplier.address}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}
            </Grid>

            {/* Right side - Invoice Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    label="Invoice No"
                    value={invoiceNo || ''}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid size={6}>
                  <DatePicker
                    label="Invoice Date"
                    value={invoiceDate}
                    onChange={(date) => date && setInvoiceDate(date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Supplier Invoice No"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <DatePicker
                    label="Supplier Invoice Date"
                    value={supplierInvoiceDate}
                    onChange={(date) => setSupplierInvoiceDate(date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Purchase Type</InputLabel>
                    <Select
                      value={purchaseType}
                      label="Purchase Type"
                      onChange={(e) => handlePurchaseTypeChange(e.target.value as PurchaseType)}
                    >
                      <MenuItem value="in_state">In State (CGST + SGST)</MenuItem>
                      <MenuItem value="out_of_state">Out of State (IGST)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      value={paymentMode}
                      label="Payment Mode"
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {paymentMode === 'card' && (
                  <Grid size={12}>
                    <TextField
                      label="Card Number (Last 4 digits)"
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ maxLength: 4 }}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Invoice Items</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setProductDialogOpen(true)}
          >
            New Product
          </Button>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 1400, '& td, & th': { verticalAlign: 'middle', py: 0.5, px: 0.5 } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100', '& th': { fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' } }}>
                  <TableCell width={25}>#</TableCell>
                  <TableCell width={60}>Code</TableCell>
                  <TableCell width={140}>Product</TableCell>
                  <TableCell width={60}>Pack</TableCell>
                  <TableCell width={70}>Batch</TableCell>
                  <TableCell width={70}>Expiry</TableCell>
                  <TableCell width={45} >Rate</TableCell>
                  <TableCell width={35} >Qty</TableCell>
                  <TableCell width={30} >Fr</TableCell>
                  <TableCell width={50} >Value</TableCell>
                  {purchaseType === 'in_state' ? (
                    <>
                      <TableCell width={45} >SGST</TableCell>
                      <TableCell width={45} >CGST</TableCell>
                    </>
                  ) : (
                    <TableCell width={45} >IGST</TableCell>
                  )}
                  <TableCell width={45} >MRP</TableCell>
                  <TableCell width={35} >Mr%</TableCell>
                  <TableCell width={35} >Ds%</TableCell>
                  <TableCell width={50} >GST</TableCell>
                  <TableCell width={50} >Cost</TableCell>
                  <TableCell width={60} >Net</TableCell>
                  <TableCell width={30}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{item.product_code || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={products || []}
                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                        value={products?.find(p => p.id === item.product_id) || null}
                        onChange={(_, value) => handleProductSelect(item.id, value)}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Product" variant="standard" sx={{ '& input': { fontSize: '0.75rem' } }} />
                        )}
                        sx={{ minWidth: 120 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{item.packaging || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        placeholder="Batch"
                        value={item.batch_no || ''}
                        onChange={(e) => {
                          updateItem(item.id, 'batch_no', e.target.value);
                          // Close popup when user types
                          if (batchPopupAnchor) setBatchPopupAnchor(null);
                        }}
                        onFocus={(e) => {
                          if (item.product_id && (productBatches[item.product_id]?.length || 0) > 0) {
                            setBatchPopupItemId(item.id);
                            setBatchPopupAnchor(e.currentTarget);
                          }
                        }}
                        sx={{ minWidth: 60, '& input': { fontSize: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        value={item.expiry_date}
                        onChange={(date) => updateItem(item.id, 'expiry_date', date)}
                        slotProps={{ 
                          textField: { 
                            size: 'small', 
                            variant: 'standard',
                            sx: { width: 65, '& input': { fontSize: '0.75rem' } }
                          } 
                        }}
                        format="MM/yy"
                        views={['month', 'year']}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        type="number"
                        value={item.purchase_rate || ''}
                        onChange={(e) => updateItem(item.id, 'purchase_rate', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', fontSize: '0.75rem' } }}
                        sx={{ width: 45 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        type="number"
                        value={item.qty || ''}
                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0, style: { fontSize: '0.75rem' } }}
                        sx={{ width: 35 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        type="number"
                        value={item.free_qty || ''}
                        onChange={(e) => updateItem(item.id, 'free_qty', parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0, style: { fontSize: '0.75rem' } }}
                        sx={{ width: 30 }}
                      />
                    </TableCell>
                    <TableCell >
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {item.gross_amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    {purchaseType === 'in_state' ? (
                      <>
                        <TableCell >
                          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {item.sgst_amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell >
                          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {item.cgst_amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </>
                    ) : (
                      <TableCell >
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {item.igst_amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        type="number"
                        value={item.mrp || ''}
                        onChange={(e) => updateItem(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', fontSize: '0.75rem' } }}
                        sx={{ width: 45 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        type="number"
                        value={item.margin_percent || ''}
                        onChange={(e) => updateItem(item.id, 'margin_percent', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, max: 100, style: {  fontSize: '0.75rem' } }}
                        sx={{ width: 35 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="standard"
                        type="number"
                        value={item.discount_percent || ''}
                        onChange={(e) => updateItem(item.id, 'discount_percent', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, max: 100, style: {  fontSize: '0.75rem' } }}
                        sx={{ width: 35 }}
                      />
                    </TableCell>
                    <TableCell >
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {item.gst_amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell >
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {item.cost_price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell >
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                        ₹{item.net_amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small" 
                        color="error"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ p: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addItem}
              size="small"
            >
              Add Item
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Totals and Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={1}>
              <Grid size={6}><Typography color="text.secondary">Total Qty:</Typography></Grid>
              <Grid size={6}><Typography align="right">{totals.qty}</Typography></Grid>
              
              <Grid size={6}><Typography color="text.secondary">Gross Amount:</Typography></Grid>
              <Grid size={6}><Typography align="right">₹{totals.gross.toFixed(2)}</Typography></Grid>
              
              <Grid size={6}><Typography color="text.secondary">Discount:</Typography></Grid>
              <Grid size={6}><Typography align="right" color="error.main">-₹{totals.discount.toFixed(2)}</Typography></Grid>
              
              <Grid size={6}><Typography color="text.secondary">Taxable Amount:</Typography></Grid>
              <Grid size={6}><Typography align="right">₹{totals.taxable.toFixed(2)}</Typography></Grid>
              
              {purchaseType === 'in_state' ? (
                <>
                  <Grid size={6}><Typography color="text.secondary">CGST:</Typography></Grid>
                  <Grid size={6}><Typography align="right">₹{totals.cgst.toFixed(2)}</Typography></Grid>
                  
                  <Grid size={6}><Typography color="text.secondary">SGST:</Typography></Grid>
                  <Grid size={6}><Typography align="right">₹{totals.sgst.toFixed(2)}</Typography></Grid>
                </>
              ) : (
                <>
                  <Grid size={6}><Typography color="text.secondary">IGST:</Typography></Grid>
                  <Grid size={6}><Typography align="right">₹{totals.igst.toFixed(2)}</Typography></Grid>
                </>
              )}
              
              <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>
              
              <Grid size={6}><Typography fontWeight="bold">Net Amount:</Typography></Grid>
              <Grid size={6}><Typography align="right" fontWeight="bold" color="primary">₹{totals.net.toFixed(2)}</Typography></Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/purchase/invoices')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!isValid || createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Save Invoice'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Supplier Dialog */}
      <SupplierFormDialog
        open={supplierDialogOpen}
        onClose={() => {
          setSupplierDialogOpen(false);
          refetchSuppliers();
        }}
        supplier={null}
      />

      {/* Product Dialog */}
      <ProductFormDialog
        open={productDialogOpen}
        onClose={() => {
          setProductDialogOpen(false);
          refetchProducts();
        }}
        product={null}
      />

      {/* Batch Selection Popper */}
      <Popper
        open={Boolean(batchPopupAnchor)}
        anchorEl={batchPopupAnchor}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener 
          onClickAway={(event) => {
            // Don't close if clicking on the anchor element (batch input field)
            if (batchPopupAnchor && batchPopupAnchor.contains(event.target as Node)) {
              return;
            }
            setBatchPopupAnchor(null);
          }}
        >
          <Paper 
            elevation={8}
            sx={{ 
              maxHeight: 300, 
              overflow: 'auto',
              minWidth: 400,
              mt: 0.5,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {batchPopupItemId && (() => {
              const currentItem = items.find(i => i.id === batchPopupItemId);
              const batches = currentItem?.product_id ? (productBatches[currentItem.product_id] || []) : [];
              
              if (batches.length === 0) {
                return (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No existing batches. Type batch number manually.
                    </Typography>
                  </Box>
                );
              }
              
              return (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>Batch</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>Expiry</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }} align="right">Stock</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }} align="right">Rate</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }} align="right">MRP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow 
                        key={batch.id} 
                        hover 
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.light', '& td': { color: 'white' } } }}
                        onClick={() => {
                          handleBatchSelect(batchPopupItemId, batch);
                          setBatchPopupAnchor(null);
                        }}
                      >
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>
                          <Typography variant="body2" fontWeight={500} fontSize="0.75rem">{batch.batch_no}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>
                          {batch.expiry_date ? format(parseISO(batch.expiry_date), 'MM/yy') : '-'}
                        </TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }} align="right">{batch.available_qty}</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }} align="right">₹{batch.purchase_rate}</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }} align="right">₹{batch.mrp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              );
            })()}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
