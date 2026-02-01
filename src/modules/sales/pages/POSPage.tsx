import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Card, Grid2 as Grid, TextField, Button, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, Typography,
  Autocomplete, InputAdornment, Divider, Paper, Chip, List, ListItem,
  ListItemText, Popper, ClickAwayListener
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { LoadingOverlay } from '@/components/common';
import { useCustomers } from '@/modules/masters/hooks/useMasters';
import { useSearchBatches, useAllAvailableBatches, useCreateSalesInvoice, useGenerateSalesInvoiceNo } from '../hooks/useSales';
import type { Customer } from '@/types/database.types';
import type { BatchWithProduct } from '../api/salesApi';

interface CartItem {
  id: string;
  batch: BatchWithProduct;
  qty: number;
  sale_rate: number;
  discount_percent: number;
  gross_amount: number;
  discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  net_amount: number;
}

export function POSPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { data: customers } = useCustomers();
  const { data: invoiceNo, isLoading: loadingInvoiceNo } = useGenerateSalesInvoiceNo();
  const createMutation = useCreateSalesInvoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoiceDate] = useState<Date>(new Date());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  
  const { data: searchResults } = useSearchBatches(searchQuery);
  const { data: allBatches, isLoading: loadingBatches } = useAllAvailableBatches();
  const anchorEl = searchInputRef.current;

  // Display results based on search query
  const displayResults = searchQuery.length >= 2 ? searchResults : allBatches?.slice(0, 20);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 - Focus search
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // F8 - Save invoice
      if (e.key === 'F8' && cart.length > 0) {
        e.preventDefault();
        handleSave();
      }
      // Escape - Clear search
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const calculateItem = useCallback((item: Partial<CartItem> & { batch: BatchWithProduct; qty: number }): CartItem => {
    const saleRate = item.sale_rate || item.batch.mrp;
    const discountPercent = item.discount_percent || 0;
    const gstPercent = item.batch.product?.gst_percent || 12;

    const grossAmount = item.qty * saleRate;
    const discountAmount = grossAmount * (discountPercent / 100);
    const taxableAmount = grossAmount - discountAmount;
    const gstAmount = taxableAmount * (gstPercent / 100);
    const netAmount = taxableAmount + gstAmount;

    return {
      id: item.id || crypto.randomUUID(),
      batch: item.batch,
      qty: item.qty,
      sale_rate: saleRate,
      discount_percent: discountPercent,
      gross_amount: grossAmount,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      gst_amount: gstAmount,
      net_amount: netAmount,
    };
  }, []);

  const addToCart = (batch: BatchWithProduct) => {
    // Check if batch already in cart
    const existing = cart.find(item => item.batch.id === batch.id);
    
    if (existing) {
      // Increase quantity if stock available
      if (existing.qty < batch.available_qty) {
        setCart(prev => prev.map(item => 
          item.batch.id === batch.id 
            ? calculateItem({ ...item, qty: item.qty + 1 })
            : item
        ));
      }
    } else {
      // Add new item
      const newItem = calculateItem({ batch, qty: 1 });
      setCart(prev => [...prev, newItem]);
    }

    setSearchQuery('');
    setSearchOpen(false);
    searchInputRef.current?.focus();
  };

  const updateItemQty = (id: string, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      // Ensure qty doesn't exceed available stock
      const validQty = Math.min(Math.max(1, qty), item.batch.available_qty);
      return calculateItem({ ...item, qty: validQty });
    }));
  };

  const updateItemDiscount = (id: string, discountPercent: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? calculateItem({ ...item, discount_percent: discountPercent }) : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const totals = cart.reduce((acc, item) => ({
    qty: acc.qty + item.qty,
    gross: acc.gross + item.gross_amount,
    discount: acc.discount + item.discount_amount,
    taxable: acc.taxable + item.taxable_amount,
    gst: acc.gst + item.gst_amount,
    net: acc.net + item.net_amount,
  }), { qty: 0, gross: 0, discount: 0, taxable: 0, gst: 0, net: 0 });

  const handleSave = async () => {
    if (!invoiceNo || cart.length === 0) return;

    await createMutation.mutateAsync({
      invoice: {
        invoice_no: invoiceNo,
        invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
        customer_id: customer?.id || null,
        subtotal: totals.gross,
        discount_amount: totals.discount,
        taxable_amount: totals.taxable,
        total_gst: totals.gst,
        grand_total: totals.net,
        paid_amount: totals.net,
        payment_status: 'paid',
        payment_mode: 'cash',
        notes: notes || null,
      },
      items: cart.map(item => ({
        batch_id: item.batch.id,
        batch_no: item.batch.batch_no,
        expiry_date: item.batch.expiry_date,
        product_id: item.batch.product_id,
        qty: item.qty,
        selling_rate: item.sale_rate,
        mrp: item.batch.mrp,
        discount_percent: item.discount_percent,
        gst_percent: item.batch.product?.gst_percent || 12,
      })),
    });

    // Reset and prepare for next sale
    setCart([]);
    setCustomer(null);
    setNotes('');
    searchInputRef.current?.focus();
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { label: 'Expired', color: 'error' as const };
    if (days <= 30) return { label: `${days}d`, color: 'error' as const };
    if (days <= 90) return { label: `${days}d`, color: 'warning' as const };
    return { label: format(new Date(expiryDate), 'MM/yy'), color: 'default' as const };
  };

  if (loadingInvoiceNo || loadingBatches) return <LoadingOverlay />;

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  ref={searchInputRef}
                  size="small"
                  placeholder="Search product, barcode, batch... (F2)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="off"
                />
                <Popper
                  open={searchOpen && !!displayResults?.length}
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  sx={{ zIndex: 1300, width: anchorEl?.clientWidth }}
                >
                  <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {displayResults?.map((batch) => {
                        const expiry = getExpiryStatus(batch.expiry_date);
                        return (
                          <ListItem
                            key={batch.id}
                            onClick={() => addToCart(batch)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {batch.product.name}
                                  </Typography>
                                  <Chip label={batch.batch_no} size="small" variant="outlined" />
                                  <Chip label={expiry.label} size="small" color={expiry.color} />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Typography variant="caption">
                                    Stock: {batch.available_qty}
                                  </Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    MRP: ₹{batch.mrp}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                </Popper>
              </Box>
            </ClickAwayListener>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              size="small"
              options={customers || []}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={customer}
              onChange={(_, value) => setCustomer(value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Walk-in Customer"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                {invoiceNo}
              </Typography>
              <Typography variant="body2">
                {format(invoiceDate, 'dd/MM/yyyy')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Cart */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}>#</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell width={100}>Batch</TableCell>
                    <TableCell width={80}>Expiry</TableCell>
                    <TableCell width={80} align="right">MRP</TableCell>
                    <TableCell width={80} align="center">Qty</TableCell>
                    <TableCell width={70} align="right">Disc%</TableCell>
                    <TableCell width={100} align="right">Amount</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Start typing to search products...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item, index) => {
                      const expiry = getExpiryStatus(item.batch.expiry_date);
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.batch.product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.batch.product.code}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.batch.batch_no}</TableCell>
                          <TableCell>
                            <Chip label={expiry.label} size="small" color={expiry.color} />
                          </TableCell>
                          <TableCell align="right">₹{item.batch.mrp}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 1)}
                              inputProps={{ 
                                min: 1, 
                                max: item.batch.available_qty,
                                style: { textAlign: 'center', width: 50 } 
                              }}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.discount_percent || ''}
                              onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                              inputProps={{ 
                                min: 0, 
                                max: 100,
                                style: { textAlign: 'right', width: 50 } 
                              }}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="medium">
                              ₹{item.net_amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Box>

        {/* Summary Panel */}
        <Box sx={{ width: 320, borderLeft: 1, borderColor: 'divider', p: 2, bgcolor: 'grey.50' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Bill Summary</Typography>
            <Grid container spacing={1}>
              <Grid size={6}><Typography variant="body2" color="text.secondary">Items:</Typography></Grid>
              <Grid size={6}><Typography variant="body2" align="right">{cart.length}</Typography></Grid>
              
              <Grid size={6}><Typography variant="body2" color="text.secondary">Total Qty:</Typography></Grid>
              <Grid size={6}><Typography variant="body2" align="right">{totals.qty}</Typography></Grid>
              
              <Grid size={6}><Typography variant="body2" color="text.secondary">Gross:</Typography></Grid>
              <Grid size={6}><Typography variant="body2" align="right">₹{totals.gross.toFixed(2)}</Typography></Grid>
              
              {totals.discount > 0 && (
                <>
                  <Grid size={6}><Typography variant="body2" color="text.secondary">Discount:</Typography></Grid>
                  <Grid size={6}><Typography variant="body2" align="right" color="error.main">-₹{totals.discount.toFixed(2)}</Typography></Grid>
                </>
              )}
              
              <Grid size={6}><Typography variant="body2" color="text.secondary">GST:</Typography></Grid>
              <Grid size={6}><Typography variant="body2" align="right">₹{totals.gst.toFixed(2)}</Typography></Grid>
              
              <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>
              
              <Grid size={6}><Typography variant="h6">Total:</Typography></Grid>
              <Grid size={6}><Typography variant="h6" align="right" color="primary">₹{totals.net.toFixed(2)}</Typography></Grid>
            </Grid>
          </Paper>

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={cart.length === 0 || createMutation.isPending}
            sx={{ py: 1.5 }}
          >
            {createMutation.isPending ? 'Saving...' : 'Complete Sale (F8)'}
          </Button>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Shortcuts: F2 - Search, F8 - Save, Esc - Clear
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
