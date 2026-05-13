import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { RateChart } from './pages/admin/RateChart';
import { Stock } from './pages/admin/Stock';
import { Staff } from './pages/admin/Staff';
import { Salary } from './pages/admin/Salary';
import { Customers } from './pages/admin/Customers';
import { CompanySettingsPage } from './pages/admin/CompanySettings';
import { Reports } from './pages/admin/Reports';
import { Leads } from './pages/admin/Leads';
import { Transactions } from './pages/admin/Transactions';
import { Billing } from './pages/staff/Billing';
import { BillHistory } from './pages/staff/BillHistory';
import { StaffLeads } from './pages/staff/StaffLeads';
import { StaffHR } from './pages/staff/StaffHR';

// Simple Route Guard
const RoleGuard = ({ children, allowedMode }: { children?: React.ReactNode, allowedMode: 'ADMIN' | 'STAFF' }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Derive mode from role
  const currentMode = currentUser.role === 'Manager' ? 'ADMIN' : 'STAFF';

  if (currentMode !== allowedMode) {
    return <Navigate to={allowedMode === 'ADMIN' ? '/staff/billing' : '/admin/dashboard'} replace />;
  }
  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect = () => {
  const { currentUser } = useApp();
  if (currentUser) {
    return <Navigate to={currentUser.role === 'Manager' ? "/admin/dashboard" : "/staff/billing"} replace />;
  }
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <RoleGuard allowedMode="ADMIN">
          <Layout>
             <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="rates" element={<RateChart />} />
              <Route path="stock" element={<Stock />} />
              <Route path="billing" element={<Billing />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="salary" element={<Salary />} />
              <Route path="staff" element={<Staff />} />
              <Route path="customers" element={<Customers />} />
              <Route path="leads" element={<Leads />} />
              <Route path="settings" element={<CompanySettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
        </RoleGuard>
      } />

      {/* Staff Routes */}
      <Route path="/staff/*" element={
        <RoleGuard allowedMode="STAFF">
          <Layout>
            <Routes>
              <Route path="billing" element={<Billing />} />
              <Route path="history" element={<BillHistory />} />
              <Route path="leads" element={<StaffLeads />} />
              <Route path="hr" element={<StaffHR />} />
              <Route path="*" element={<Navigate to="billing" replace />} />
            </Routes>
          </Layout>
        </RoleGuard>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
