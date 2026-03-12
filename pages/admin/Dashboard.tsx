import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, AlertCircle, ShoppingCart, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { bills } = useApp();

  // Financial Stats
  const totalPurchasedValue = bills
    .filter(b => b.transactionType === 'PURCHASE')
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  const totalSalesValue = bills
    .filter(b => b.transactionType === 'SALE')
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Today's Stats
  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date.startsWith(today));
  const todayPurchased = todayBills
    .filter(b => b.transactionType === 'PURCHASE')
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
  
  const todaySales = todayBills
    .filter(b => b.transactionType === 'SALE')
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Mock chart data (In real app, aggregate bills by date)
  const chartData = [
    { name: 'Mon', purchase: 4000, sale: 2400 },
    { name: 'Tue', purchase: 3000, sale: 1398 },
    { name: 'Wed', purchase: 2000, sale: 9800 },
    { name: 'Thu', purchase: 2780, sale: 3908 },
    { name: 'Fri', purchase: 1890, sale: 4800 },
    { name: 'Sat', purchase: 2390, sale: 3800 },
    { name: 'Sun', purchase: 3490, sale: 4300 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Expenses (Purchase) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses (Buy)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">₹{totalPurchasedValue.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">+₹{todayPurchased.toLocaleString()} today</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        {/* Total Revenue (Sales) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue (Sell)</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2">₹{totalSalesValue.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">+₹{todaySales.toLocaleString()} today</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Profit Estimate (Simple calc) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Cash Flow</p>
              <h3 className={`text-2xl font-bold mt-2 ${totalSalesValue - totalPurchasedValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(totalSalesValue - totalPurchasedValue).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Transactions</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">{bills.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Mixed (Sale/Purchase)</p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Package size={24} /> 
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Cash Flow Overview</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sale" fill="#10b981" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchase" fill="#3b82f6" name="Purchase" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links & Warnings */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                 <Link to="/admin/rates" className="block w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition text-center border border-slate-200">
                    Update Buying Rates
                 </Link>
                 <Link to="/admin/stock" className="block w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition text-center border border-slate-200">
                    Check Inventory
                 </Link>
              </div>
           </div>

           <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
             <div className="flex items-center space-x-3 mb-2">
               <AlertCircle className="text-amber-600" size={24} />
               <h3 className="text-lg font-bold text-amber-800">Note</h3>
             </div>
             <p className="text-sm text-amber-700">
               Stock levels will go negative if you sell items without recording a purchase first.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};