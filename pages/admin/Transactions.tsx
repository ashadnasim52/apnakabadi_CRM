import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Search, ArrowDownLeft, ArrowUpRight, FileText, Filter, X, Trash2 } from 'lucide-react';
import { generateBillPDF } from '../../utils/pdfGenerator';
import { TransactionType } from '../../types';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const Transactions = () => {
  const { bills, company, deleteBill } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtering logic
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Text Search
      const matchesSearch = 
        bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerPhone.includes(searchTerm);

      // Type Filter
      const matchesType = filterType === 'ALL' || bill.transactionType === filterType;

      // Date Filter
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(bill.date).setHours(0,0,0,0) >= new Date(startDate).setHours(0,0,0,0);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(bill.date).setHours(0,0,0,0) <= new Date(endDate).setHours(0,0,0,0);
      }

      return matchesSearch && matchesType && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bills, searchTerm, filterType, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const handleDelete = (id: string, billNo: string) => {
      if (confirm(`Are you sure you want to delete Bill #${billNo}? This action cannot be undone.`)) {
          deleteBill(id);
      }
  };

  const totalVolume = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">All Transactions</h1>
           <p className="text-slate-500 mt-1">Manage and view all purchase and sales records</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center">
            <span className="text-sm text-slate-500 mr-2">Total Value (Visible):</span>
            <span className="font-bold text-slate-800">₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search Bill No, Customer..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="w-full lg:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 appearance-none"
            >
                <option value="ALL">All Types</option>
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
            </select>
        </div>

        {/* Date Range */}
        <div className="flex space-x-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-3 pr-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-sm"
                />
            </div>
            <span className="text-slate-400 self-center">-</span>
            <div className="relative flex-1 lg:flex-none">
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-3 pr-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-sm"
                />
            </div>
        </div>

        {/* Clear Button */}
        {(searchTerm || filterType !== 'ALL' || startDate || endDate) && (
            <button 
                onClick={clearFilters}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Clear Filters"
            >
                <X size={20} />
            </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Bill No</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold text-right">Items</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-slate-400" />
                        <span>{bill.billNo}</span>
                      </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div>{new Date(bill.date).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-400">{new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="p-4">
                      {bill.transactionType === 'PURCHASE' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold border border-blue-200">
                          <ArrowDownLeft size={12} />
                          <span>PURCHASE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200">
                          <ArrowUpRight size={12} />
                          <span>SALE</span>
                        </span>
                      )}
                  </td>
                  <td className="p-4">
                      <div className="font-medium text-slate-800">{bill.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        {bill.customerPhone}
                        <WhatsAppIcon phone={bill.customerPhone} className="ml-1" />
                      </div>
                  </td>
                  <td className="p-4 text-right text-slate-600 font-mono text-sm">
                      {bill.items.length} items
                  </td>
                  <td className={`p-4 text-right font-bold ${bill.transactionType === 'PURCHASE' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      ₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => generateBillPDF(bill, company)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition text-sm font-medium shadow-sm"
                        title="Download PDF"
                      >
                        <Download size={14} />
                        <span>PDF</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(bill.id, bill.billNo)}
                        className="inline-flex items-center justify-center p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-200"
                        title="Delete Bill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-12 text-center text-slate-500">
                      No transactions found matching your filters.
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