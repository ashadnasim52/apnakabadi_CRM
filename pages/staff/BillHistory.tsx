import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Search, ArrowDownLeft, ArrowUpRight, FileText, Lock } from 'lucide-react';
import { generateBillPDF } from '../../utils/pdfGenerator';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const BillHistory = () => {
  const { bills, company } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort bills by date (Newest first)
  const sortedBills = [...bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredBills = sortedBills.filter(bill => 
    bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerPhone.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Bills History</h1>
           <p className="text-slate-500 mt-1">View and download past transactions</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Bill No, Name or Phone..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-72 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Bill No</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold text-right">Items</th>
                <th className="p-4 font-semibold text-right">Total Weight</th>
                <th className="p-4 font-semibold text-right">Total Amount</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => {
                const totalWeight = bill.items.reduce((sum, item) => sum + (item.totalWeight || item.weight), 0);
                
                return (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-bold text-slate-700 flex items-center space-x-2">
                      <FileText size={16} className="text-slate-400" />
                      <span>{bill.billNo}</span>
                      {(bill.isFinalized || bill.isFinalized === undefined) && (
                        <div className="group/tooltip relative">
                          <Lock size={14} className="text-slate-400" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none text-center">
                            Finalized & Locked
                          </span>
                        </div>
                      )}
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
                    <td className="p-4 text-sm text-slate-600">
                      <div className="font-medium">{new Date(bill.date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400">{new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{bill.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        {bill.customerPhone}
                        <WhatsAppIcon phone={bill.customerPhone} className="ml-1" />
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-600 font-mono">
                      {bill.items.length}
                    </td>
                    <td className="p-4 text-right text-slate-600 font-mono font-medium">
                      {totalWeight.toFixed(2)} kg
                    </td>
                    <td className={`p-4 text-right font-bold ${bill.transactionType === 'PURCHASE' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      ₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => generateBillPDF(bill, company)}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium border border-slate-200 shadow-sm active:scale-95"
                      >
                        <Download size={16} />
                        <span className="hidden lg:inline">PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                   <td colSpan={8} className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-4 rounded-full mb-3">
                        <Search className="text-slate-400" size={24} />
                      </div>
                      <p className="font-medium text-slate-600">No bills found</p>
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your search filters</p>
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