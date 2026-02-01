import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { styled, type Theme, type CSSObject } from '@mui/material/styles';
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  type AppBarProps as MuiAppBarProps,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  LocalShipping as SupplierIcon,
  Assessment as ReportsIcon,
  Category as CategoryIcon,
  Business as CompanyIcon,
  LocalPharmacy as PharmacyIcon,
  Science as FormulaIcon,
  EventNote as ScheduleIcon,
  QrCode as HsnIcon,
  Widgets as ProductTypeIcon,
  PointOfSale as POSIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  WarningAmber as WarningIcon,
  Inventory2 as StockIcon,
  Build as AdjustmentIcon,
  History as LedgerIcon,
} from '@mui/icons-material';
import { useAuth } from '@/modules/auth/providers/AuthProvider';
import { sidebarConfig } from '@/app/theme';

const drawerWidth = sidebarConfig.width.open;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      },
    },
  ],
}));

interface NavItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Masters',
    icon: <CategoryIcon />,
    children: [
      { title: 'Products', path: '/masters/products', icon: <PharmacyIcon /> },
      { title: 'Categories', path: '/masters/categories', icon: <CategoryIcon /> },
      { title: 'Companies', path: '/masters/companies', icon: <CompanyIcon /> },
      { title: 'Suppliers', path: '/masters/suppliers', icon: <SupplierIcon /> },
      { title: 'Customers', path: '/masters/customers', icon: <PeopleIcon /> },
      { title: 'HSN Codes', path: '/masters/hsn-codes', icon: <HsnIcon /> },
      { title: 'Drug Schedules', path: '/masters/drug-schedules', icon: <ScheduleIcon /> },
      { title: 'Drug Formulas', path: '/masters/drug-formulas', icon: <FormulaIcon /> },
      { title: 'Product Types', path: '/masters/product-types', icon: <ProductTypeIcon /> },
    ],
  },
  {
    title: 'Purchase',
    icon: <ShoppingCartIcon />,
    children: [
      { title: 'Invoices', path: '/purchase/invoices', icon: <ReceiptIcon /> },
      { title: 'New Invoice', path: '/purchase/invoices/new', icon: <ReceiptIcon /> },
    ],
  },
  {
    title: 'Sales',
    icon: <POSIcon />,
    children: [
      { title: 'POS', path: '/sales/pos', icon: <POSIcon /> },
      { title: 'Invoices', path: '/sales/invoices', icon: <ReceiptIcon /> },
    ],
  },
  {
    title: 'Inventory',
    icon: <InventoryIcon />,
    children: [
      { title: 'Batch Stock', path: '/inventory/batch-stock', icon: <StockIcon /> },
      { title: 'Low Stock Alert', path: '/inventory/low-stock', icon: <WarningIcon /> },
      { title: 'Expiry Alert', path: '/inventory/expiry-alert', icon: <WarningIcon /> },
      { title: 'Stock Ledger', path: '/inventory/stock-ledger', icon: <LedgerIcon /> },
      { title: 'Adjustment', path: '/inventory/adjustment', icon: <AdjustmentIcon /> },
    ],
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: <ReportsIcon />,
  },
];

export function DashboardLayout() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Masters']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggleDrawer = () => setOpen(!open);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: NavItem[]) =>
    children?.some((child) => child.path && location.pathname.startsWith(child.path));

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = item.path ? isActive(item.path) : isParentActive(item.children);

    return (
      <Box key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          {item.path ? (
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                minHeight: 44,
                px: 2.5,
                pl: depth > 0 ? 4 : 2.5,
                bgcolor: active ? 'primary.lighter' : 'transparent',
                borderRight: active ? 3 : 0,
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: active ? 600 : 400,
                    color: active ? 'primary.main' : 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItemButton>
          ) : (
            <ListItemButton
              onClick={() => toggleExpand(item.title)}
              sx={{
                minHeight: 44,
                px: 2.5,
                bgcolor: active ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.875rem',
                  },
                }}
              />
              {open && hasChildren && (
                isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
              )}
            </ListItemButton>
          )}
        </ListItem>

        {/* Children */}
        {hasChildren && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Pharmacy ERP
          </Typography>

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {profile?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PharmacyIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            {open && (
              <Typography variant="h6" fontWeight={700} color="primary">
                Pharmacy
              </Typography>
            )}
          </Box>
        </Toolbar>
        <Divider />
        <List sx={{ pt: 1 }}>{navItems.map((item) => renderNavItem(item))}</List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
