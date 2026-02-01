import { useState } from 'react';
import { 
  Box, Card, CardContent, Grid2 as Grid, Typography, Button, 
  List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Assessment as ReportIcon,
  TrendingUp as SalesIcon,
  ShoppingCart as PurchaseIcon,
  Inventory as StockIcon,
  Receipt as GSTIcon,
  AccountBalance as ProfitIcon,
  People as PartyIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PageHeader } from '@/components/common';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'sales' | 'purchase' | 'inventory' | 'gst' | 'accounting';
}

const reports: ReportConfig[] = [
  // Sales Reports
  { id: 'daily-sales', name: 'Daily Sales Report', description: 'Day-wise sales summary', icon: <SalesIcon />, category: 'sales' },
  { id: 'sales-register', name: 'Sales Register', description: 'Detailed sales invoice list', icon: <SalesIcon />, category: 'sales' },
  { id: 'product-sales', name: 'Product-wise Sales', description: 'Sales analysis by product', icon: <SalesIcon />, category: 'sales' },
  { id: 'customer-sales', name: 'Customer-wise Sales', description: 'Sales by customer', icon: <PartyIcon />, category: 'sales' },
  
  // Purchase Reports
  { id: 'purchase-register', name: 'Purchase Register', description: 'Detailed purchase invoice list', icon: <PurchaseIcon />, category: 'purchase' },
  { id: 'supplier-purchase', name: 'Supplier-wise Purchase', description: 'Purchase by supplier', icon: <PartyIcon />, category: 'purchase' },
  
  // Inventory Reports
  { id: 'stock-report', name: 'Stock Report', description: 'Current stock position', icon: <StockIcon />, category: 'inventory' },
  { id: 'stock-valuation', name: 'Stock Valuation', description: 'Stock value at cost/MRP', icon: <StockIcon />, category: 'inventory' },
  { id: 'expiry-report', name: 'Expiry Report', description: 'Batches expiring soon', icon: <StockIcon />, category: 'inventory' },
  { id: 'slow-moving', name: 'Slow Moving Items', description: 'Products with low turnover', icon: <StockIcon />, category: 'inventory' },
  
  // GST Reports
  { id: 'gstr1', name: 'GSTR-1 Summary', description: 'Outward supplies summary', icon: <GSTIcon />, category: 'gst' },
  { id: 'gstr3b', name: 'GSTR-3B Summary', description: 'Monthly return summary', icon: <GSTIcon />, category: 'gst' },
  { id: 'hsn-summary', name: 'HSN-wise Summary', description: 'Tax summary by HSN code', icon: <GSTIcon />, category: 'gst' },
  
  // Accounting Reports
  { id: 'profit-loss', name: 'Profit & Loss', description: 'Period profit/loss statement', icon: <ProfitIcon />, category: 'accounting' },
  { id: 'party-ledger', name: 'Party Ledger', description: 'Customer/Supplier account', icon: <PartyIcon />, category: 'accounting' },
];

const categoryLabels = {
  sales: 'Sales Reports',
  purchase: 'Purchase Reports',
  inventory: 'Inventory Reports',
  gst: 'GST Reports',
  accounting: 'Accounting Reports',
};

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));

  const handleReportClick = (report: ReportConfig) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleGenerateReport = () => {
    // TODO: Implement actual report generation
    console.log('Generating report:', selectedReport?.id, { fromDate, toDate });
    alert(`Report "${selectedReport?.name}" would be generated here.\nDate Range: ${format(fromDate, 'dd/MM/yyyy')} to ${format(toDate, 'dd/MM/yyyy')}`);
    setDialogOpen(false);
  };

  const groupedReports = reports.reduce((acc, report) => {
    if (!acc[report.category]) acc[report.category] = [];
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportConfig[]>);

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate and view business reports"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Select a report to generate. Reports can be exported to Excel/PDF.
      </Alert>

      <Grid container spacing={3}>
        {Object.entries(groupedReports).map(([category, categoryReports]) => (
          <Grid size={{ xs: 12, md: 6 }} key={category}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </Typography>
                <List dense>
                  {categoryReports.map((report) => (
                    <ListItem key={report.id} disablePadding>
                      <ListItemButton onClick={() => handleReportClick(report)}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {report.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={report.name}
                          secondary={report.description}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Report Parameters Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportIcon color="primary" />
            {selectedReport?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedReport?.description}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={6}>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(date) => date && setFromDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={6}>
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(date) => date && setToDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>

          {/* Quick Date Filters */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setFromDate(new Date());
                setToDate(new Date());
              }}
            >
              Today
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setFromDate(startOfMonth(new Date()));
                setToDate(endOfMonth(new Date()));
              }}
            >
              This Month
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                const now = new Date();
                const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
                setFromDate(new Date(fy, 3, 1)); // April 1
                setToDate(new Date(fy + 1, 2, 31)); // March 31
              }}
            >
              This FY
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
