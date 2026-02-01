import { useState } from 'react';
import { 
  Box, Card, CardContent, Grid2 as Grid, TextField, Button, 
  Autocomplete, Typography, Alert, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { PageHeader, LoadingOverlay, ErrorDisplay } from '@/components/common';
import { useBatches, useCreateStockAdjustment } from '../hooks/useInventory';
import type { BatchWithProduct } from '../api/inventoryApi';

const adjustmentReasons = [
  'Physical Count Correction',
  'Damaged/Broken',
  'Expired - Disposed',
  'Theft/Pilferage',
  'Return to Supplier',
  'Free Sample',
  'Opening Stock',
  'Other',
];

export function StockAdjustmentPage() {
  const { data: batches, isLoading, error, refetch } = useBatches();
  const adjustmentMutation = useCreateStockAdjustment();

  const [selectedBatch, setSelectedBatch] = useState<BatchWithProduct | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('decrease');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!selectedBatch || !quantity || !reason) return;

    const adjustmentQty = adjustmentType === 'increase' ? quantity : -quantity;

    await adjustmentMutation.mutateAsync({
      batchId: selectedBatch.id,
      adjustmentQty,
      reason,
      notes,
    });

    // Reset form
    setSelectedBatch(null);
    setQuantity(0);
    setReason('');
    setNotes('');
  };

  const isValid = selectedBatch && quantity > 0 && reason;
  const maxDecrease = selectedBatch?.available_qty || 0;

  if (isLoading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error.message} onRetry={refetch} />;

  return (
    <Box>
      <PageHeader
        title="Stock Adjustment"
        subtitle="Manually adjust stock quantities"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Autocomplete
                    options={batches || []}
                    getOptionLabel={(option) => 
                      `${option.product.code} - ${option.product.name} | Batch: ${option.batch_no} | Stock: ${option.available_qty}`
                    }
                    value={selectedBatch}
                    onChange={(_, value) => {
                      setSelectedBatch(value);
                      setQuantity(0);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Batch" required />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Batch: {option.batch_no} | Current Stock: {option.available_qty} | MRP: ₹{option.mrp}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </Grid>

                {selectedBatch && (
                  <>
                    <Grid size={12}>
                      <Alert severity="info">
                        <strong>{selectedBatch.product.name}</strong> - Batch: {selectedBatch.batch_no}
                        <br />
                        Current Stock: <strong>{selectedBatch.available_qty}</strong> units
                      </Alert>
                    </Grid>

                    <Grid size={12}>
                      <FormControl>
                        <FormLabel>Adjustment Type</FormLabel>
                        <RadioGroup
                          row
                          value={adjustmentType}
                          onChange={(e) => setAdjustmentType(e.target.value as 'increase' | 'decrease')}
                        >
                          <FormControlLabel 
                            value="increase" 
                            control={<Radio color="success" />} 
                            label="Increase Stock" 
                          />
                          <FormControlLabel 
                            value="decrease" 
                            control={<Radio color="error" />} 
                            label="Decrease Stock" 
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={quantity || ''}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        required
                        fullWidth
                        inputProps={{ 
                          min: 1, 
                          max: adjustmentType === 'decrease' ? maxDecrease : undefined 
                        }}
                        error={adjustmentType === 'decrease' && quantity > maxDecrease}
                        helperText={
                          adjustmentType === 'decrease' && quantity > maxDecrease 
                            ? `Cannot exceed current stock (${maxDecrease})`
                            : ''
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Autocomplete
                        freeSolo
                        options={adjustmentReasons}
                        value={reason}
                        onChange={(_, value) => setReason(value || '')}
                        onInputChange={(_, value) => setReason(value)}
                        renderInput={(params) => (
                          <TextField {...params} label="Reason" required />
                        )}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        label="Additional Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Grid>

                    <Grid size={12}>
                      <Button
                        variant="contained"
                        color={adjustmentType === 'increase' ? 'success' : 'error'}
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        disabled={!isValid || adjustmentMutation.isPending || 
                          (adjustmentType === 'decrease' && quantity > maxDecrease)}
                      >
                        {adjustmentMutation.isPending ? 'Processing...' : 'Submit Adjustment'}
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Adjustment Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use stock adjustments for:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="body2">Physical stock count corrections</Typography></li>
                <li><Typography variant="body2">Damaged or expired products</Typography></li>
                <li><Typography variant="body2">Theft or pilferage</Typography></li>
                <li><Typography variant="body2">Free samples given</Typography></li>
                <li><Typography variant="body2">Opening stock entry</Typography></li>
              </ul>
              <Alert severity="warning" sx={{ mt: 2 }}>
                All adjustments are logged in the Stock Ledger for audit purposes.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
