import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { RoleGuard } from '@/modules/auth/components/RoleGuard';

// Auth pages
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { AccessDeniedPage } from '@/modules/auth/pages/AccessDeniedPage';

// Dashboard
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';

// Masters
import { ProductsPage } from '@/modules/masters/pages/ProductsPage';
import { SuppliersPage } from '@/modules/masters/pages/SuppliersPage';
import { CustomersPage } from '@/modules/masters/pages/CustomersPage';
import { CategoriesPage } from '@/modules/masters/pages/CategoriesPage';
import { CompaniesPage } from '@/modules/masters/pages/CompaniesPage';
import { HsnCodesPage } from '@/modules/masters/pages/HsnCodesPage';
import { DrugSchedulesPage } from '@/modules/masters/pages/DrugSchedulesPage';
import { DrugFormulasPage } from '@/modules/masters/pages/DrugFormulasPage';
import { ProductTypesPage } from '@/modules/masters/pages/ProductTypesPage';

// Purchase
import { PurchaseInvoicesPage } from '@/modules/purchase/pages/PurchaseInvoicesPage';
import { PurchaseInvoiceFormPage } from '@/modules/purchase/pages/PurchaseInvoiceFormPage';

// Sales
import { SalesInvoicesPage } from '@/modules/sales/pages/SalesInvoicesPage';
import { POSPage } from '@/modules/sales/pages/POSPage';

// Inventory
import { BatchStockPage } from '@/modules/inventory/pages/BatchStockPage';
import { LowStockPage } from '@/modules/inventory/pages/LowStockPage';
import { ExpiryAlertPage } from '@/modules/inventory/pages/ExpiryAlertPage';
import { StockLedgerPage } from '@/modules/inventory/pages/StockLedgerPage';
import { StockAdjustmentPage } from '@/modules/inventory/pages/StockAdjustmentPage';

// Reports
import { ReportsPage } from '@/modules/reports/pages/ReportsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Protected routes - Admin only */}
      <Route
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Masters */}
        <Route path="/masters/products" element={<ProductsPage />} />
        <Route path="/masters/suppliers" element={<SuppliersPage />} />
        <Route path="/masters/customers" element={<CustomersPage />} />
        <Route path="/masters/categories" element={<CategoriesPage />} />
        <Route path="/masters/companies" element={<CompaniesPage />} />
        <Route path="/masters/hsn-codes" element={<HsnCodesPage />} />
        <Route path="/masters/drug-schedules" element={<DrugSchedulesPage />} />
        <Route path="/masters/drug-formulas" element={<DrugFormulasPage />} />
        <Route path="/masters/product-types" element={<ProductTypesPage />} />

        {/* Purchase */}
        <Route path="/purchase/invoices" element={<PurchaseInvoicesPage />} />
        <Route path="/purchase/invoices/new" element={<PurchaseInvoiceFormPage />} />
        <Route path="/purchase/invoices/:id" element={<PurchaseInvoiceFormPage />} />

        {/* Sales */}
        <Route path="/sales/invoices" element={<SalesInvoicesPage />} />
        <Route path="/sales/pos" element={<POSPage />} />

        {/* Inventory */}
        <Route path="/inventory/batch-stock" element={<BatchStockPage />} />
        <Route path="/inventory/low-stock" element={<LowStockPage />} />
        <Route path="/inventory/expiry-alert" element={<ExpiryAlertPage />} />
        <Route path="/inventory/stock-ledger" element={<StockLedgerPage />} />
        <Route path="/inventory/adjustment" element={<StockAdjustmentPage />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
