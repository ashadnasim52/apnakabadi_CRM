import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, LayoutDashboard, Calculator, Warehouse, Users, Settings, LogOut, Receipt, History, ShoppingCart, FileText, Banknote, Contact, BarChart3, PhoneForwarded, UserCheck, Phone } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { viewMode, company, currentUser, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  if (!currentUser) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold tracking-wider text-blue-400">
              {viewMode === 'ADMIN' ? 'ADMIN PANEL' : 'STAFF PANEL'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{company.name}</p>
          </div>

          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
                 {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
            {viewMode === 'ADMIN' ? (
              <>
                <NavLink to="/admin/dashboard" className={navItemClass}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/rates" className={navItemClass}>
                  <Calculator size={20} />
                  <span>Rate Chart</span>
                </NavLink>
                <NavLink to="/admin/stock" className={navItemClass}>
                  <Warehouse size={20} />
                  <span>Stock Mgmt</span>
                </NavLink>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions</p>
                </div>
                <NavLink to="/admin/billing" className={navItemClass}>
                  <ShoppingCart size={20} />
                  <span>New Purchase/Sale</span>
                </NavLink>
                <NavLink to="/admin/transactions" className={navItemClass}>
                  <FileText size={20} />
                  <span>All Transactions</span>
                </NavLink>
                <NavLink to="/admin/customers" className={navItemClass}>
                  <Contact size={20} />
                  <span>Customers</span>
                </NavLink>
                <NavLink to="/admin/reports" className={navItemClass}>
                  <BarChart3 size={20} />
                  <span>Reports</span>
                </NavLink>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</p>
                </div>
                <NavLink to="/admin/leads" className={navItemClass}>
                  <PhoneForwarded size={20} />
                  <span>Lead Management</span>
                </NavLink>
                <NavLink to="/admin/salary" className={navItemClass}>
                  <Banknote size={20} />
                  <span>Payroll & Salary</span>
                </NavLink>
                <NavLink to="/admin/staff" className={navItemClass}>
                  <Users size={20} />
                  <span>Staff & Leaves</span>
                </NavLink>
                <NavLink to="/admin/settings" className={navItemClass}>
                  <Settings size={20} />
                  <span>Company Settings</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/staff/billing" className={navItemClass}>
                  <Receipt size={20} />
                  <span>POS & Billing</span>
                </NavLink>
                <NavLink to="/staff/history" className={navItemClass}>
                  <History size={20} />
                  <span>Bills History</span>
                </NavLink>
                <NavLink to="/staff/leads" className={navItemClass}>
                  <PhoneForwarded size={20} />
                  <span>My Leads</span>
                </NavLink>
                <NavLink to="/staff/hr" className={navItemClass}>
                  <UserCheck size={20} />
                  <span>My Profile & Leaves</span>
                </NavLink>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 py-3 rounded-lg transition-colors border border-red-900/50"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-700 hidden sm:block">
              {viewMode === 'ADMIN' ? 'System Administration' : 'Point of Sale Terminal'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900">{company.name}</p>
                <div className="flex items-center justify-end text-xs text-slate-500 mt-0.5">
                  <Phone size={10} className="mr-1" />
                  {company.phone}
                  <WhatsAppIcon phone={company.phone} className="ml-1" />
                </div>
             </div>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border ${viewMode === 'ADMIN' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
               {viewMode === 'ADMIN' ? 'A' : 'S'}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
