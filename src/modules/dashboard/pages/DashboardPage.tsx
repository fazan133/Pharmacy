import { Grid2 as Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  Inventory as ProductIcon,
  ShoppingCart as PurchaseIcon,
  PointOfSale as SalesIcon,
  WarningAmber as AlertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend.isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  color={trend.isPositive ? 'success.main' : 'error.main'}
                >
                  {trend.value}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [products, purchases, sales, lowStock] = await Promise.all([
        supabase.from('product').select('id', { count: 'exact', head: true }),
        supabase
          .from('purchase_invoice')
          .select('grand_total')
          .gte('invoice_date', new Date(new Date().setDate(1)).toISOString().split('T')[0]),
        supabase
          .from('sales_invoice')
          .select('grand_total')
          .gte('invoice_date', new Date(new Date().setDate(1)).toISOString().split('T')[0]),
        supabase
          .from('batch')
          .select('id', { count: 'exact', head: true })
          .lt('available_qty', 10)
          .gt('available_qty', 0),
      ]);

      const totalPurchase = purchases.data?.reduce((sum, p) => sum + (p.grand_total || 0), 0) || 0;
      const totalSales = sales.data?.reduce((sum, s) => sum + (s.grand_total || 0), 0) || 0;

      return {
        productCount: products.count || 0,
        totalPurchase,
        totalSales,
        lowStockCount: lowStock.count || 0,
      };
    },
  });

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to Pharmacy ERP"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Products"
            value={stats?.productCount || 0}
            icon={<ProductIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="This Month Purchase"
            value={`₹${(stats?.totalPurchase || 0).toLocaleString()}`}
            icon={<PurchaseIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="This Month Sales"
            value={`₹${(stats?.totalSales || 0).toLocaleString()}`}
            icon={<SalesIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockCount || 0}
            icon={<AlertIcon />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => window.location.href = '/purchase/invoices/new'}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PurchaseIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography>New Purchase</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => window.location.href = '/sales/pos'}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <SalesIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography>New Sale (POS)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => window.location.href = '/masters/products'}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <ProductIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography>Manage Products</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => window.location.href = '/inventory/low-stock'}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AlertIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography>Low Stock Alert</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
