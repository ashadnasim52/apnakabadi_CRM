import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { generateSummaryReportPDF } from '../../utils/pdfGenerator';
import { Calendar, Filter, Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { TransactionType } from '../../types';

export const Reports = () => {
  const { bills, company } = useApp();
  
  // Date State: Default to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(currentDay);
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');

  // Quick Filters
  const setRange = (type: 'today' | 'week' | 'month' | 'year') => {
    const end = new Date();
    let start = new Date();

    if (type === 'today') {
        // start is today
    } else if (type === 'week') {
        start.setDate(end.getDate() - 7);
    } else if (type === 'month') {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (type === 'year') {
        start = new Date(end.getFullYear(), 0, 1);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Filter Data
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const billDate = bill.date.split('T')[0];
      const matchesDate = billDate >= startDate && billDate <= endDate;
      const matchesType = filterType === 'ALL' || bill.transactionType === filterType;
      return matchesDate && matchesType;
    });
  }, [bills, startDate, endDate, filterType]);

  // Aggregations
  const stats = useMemo(() => {
    const purchase = filteredBills.filter(b => b.transactionType === 'PURCHASE').reduce((s, b) => s + b.totalAmount, 0);
    const sale = filteredBills.filter(b => b.transactionType === 'SALE').reduce((s, b) => s + b.totalAmount, 0);
    const count = filteredBills.length;
    return { purchase, sale, count, net: sale - purchase };
  }, [filteredBills]);

  const handleDownload = () => {
    if (filteredBills.length === 0) {
        alert("No data available to report for this period.");
        return;
    }
    generateSummaryReportPDF(filteredBills, company, startDate, endDate);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Business Reports</h1>
          <p className="text-slate-500 mt-1">Generate sales and purchase summaries</p>
        </div>
        
        <button 
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-bold shadow-sm"
        >
          <Download size={20} />
          <span>Download Report (PDF)</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
            
            {/* Presets */}
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                <button onClick={() => setRange('today')} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium whitespace-nowrap">Today</button>
                <button onClick={() => setRange('week')} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium whitespace-nowrap">Last 7 Days</button>
                <button onClick={() => setRange('month')} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-medium whitespace-nowrap">This Month</button>
                <button onClick={() => setRange('year')} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium whitespace-nowrap">This Year</button>
            </div>

            {/* Custom Range */}
            <div className="flex gap-4 w-full lg:w-auto flex-wrap">
                <div className="flex-1 lg:flex-none">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full lg:w-40 pl-9 pr-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 lg:flex-none">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full lg:w-40 pl-9 pr-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 lg:flex-none">
                     <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                     <div className="relative">
                        <Filter size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="w-full lg:w-40 pl-9 pr-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="ALL">All Transactions</option>
                            <option value="PURCHASE">Purchases Only</option>
                            <option value="SALE">Sales Only</option>
                        </select>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-2">Total Purchases</p>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <TrendingDown size={24} />
                </div>
                <span className="text-2xl font-bold text-slate-800">₹{stats.purchase.toLocaleString()}</span>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-2">Total Sales</p>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <span className="text-2xl font-bold text-slate-800">₹{stats.sale.toLocaleString()}</span>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-2">Net Cash Flow</p>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <DollarSign size={24} />
                </div>
                <span className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{stats.net.toLocaleString()}
                </span>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-2">Transaction Count</p>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <FileText size={24} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{stats.count}</span>
            </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Preview: {filteredBills.length} Records found</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-white sticky top-0 shadow-sm">
              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Date</th>
                <th className="p-4">Bill No</th>
                <th className="p-4">Type</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBills.length > 0 ? filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{new Date(bill.date).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-slate-800">{bill.billNo}</td>
                  <td className="p-4">
                    {bill.transactionType === 'PURCHASE' ? (
                       <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">PURCHASE</span>
                    ) : (
                       <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">SALE</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-700">{bill.customerName}</td>
                  <td className="p-4 text-right font-bold text-slate-800">₹{bill.totalAmount.toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">
                        No transactions found for the selected range.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};