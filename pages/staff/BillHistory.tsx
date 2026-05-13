import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Search, ArrowDownLeft, ArrowUpRight, FileText, Lock, FileDown, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateBillPDF, generateScrapCertificate } from '../../utils/pdfGenerator';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const BillHistory = () => {
  const { bills, company, viewMode, updateBillStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort bills by date (Newest first)
  const sortedBills = [...bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredBills = sortedBills.filter(bill => 
    bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerPhone.includes(searchTerm)
  );

  const togglePaymentStatus = (id: string, currentStatus: string) => {
    if (viewMode !== 'ADMIN') return;
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    updateBillStatus(id, newStatus);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl md:text-2xl font-bold text-slate-800">Bills History</h1>
           <p className="text-slate-500 mt-1">View and manage past transactions</p>
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
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Bill No</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold text-right">Total Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => {
                const totalWeight = bill.items.reduce((sum, item) => sum + (item.totalWeight || item.weight), 0);
                const isPaid = bill.paymentStatus === 'Paid';
                
                return (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-2 font-bold text-slate-700">
                        <FileText size={16} className="text-slate-400" />
                        <span>{bill.billNo}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                        {new Date(bill.date).toLocaleDateString()} at {new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4">
                      {bill.transactionType === 'PURCHASE' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200">
                          <ArrowDownLeft size={10} />
                          <span>PURCHASE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">
                          <ArrowUpRight size={10} />
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
                    <td className={`p-4 text-right font-bold ${bill.transactionType === 'PURCHASE' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      ₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <div className="text-[10px] text-slate-400 font-normal">{totalWeight.toFixed(2)} kg</div>
                    </td>
                    <td className="p-4 text-center">
                       <button
                         onClick={() => togglePaymentStatus(bill.id, bill.paymentStatus)}
                         disabled={viewMode !== 'ADMIN'}
                         className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                           ${isPaid 
                             ? 'bg-green-100 text-green-700 border-green-200' 
                             : 'bg-red-100 text-red-700 border-red-200'}
                           ${viewMode === 'ADMIN' ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
                         `}
                       >
                         {isPaid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                         <span>{isPaid ? 'PAID' : 'UNPAID'}</span>
                         {viewMode === 'ADMIN' && <div className="ml-1 text-[8px] opacity-50 underline">Change</div>}
                       </button>
                    </td>
                    <td className="p-4 flex flex-col gap-2 items-center">
                      <button 
                        onClick={() => generateBillPDF(bill, company)}
                        className="inline-flex w-full justify-center items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-all text-xs font-semibold border border-slate-200 shadow-sm active:scale-95"
                      >
                        <Download size={14} />
                        <span>PDF Invoice</span>
                      </button>
                      
                      {bill.items.some(i => i.vehicleInfo) && (
                         <div className="flex flex-wrap gap-1 justify-center">
                            {bill.items.filter(i => i.vehicleInfo).map(item => (
                                <button 
                                    key={`cert-${item.id}`}
                                    onClick={() => generateScrapCertificate(bill, item, company)}
                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-md transition-all text-[9px] font-bold shadow-sm active:scale-95"
                                    title={`Scrap Certificate: ${item.vehicleInfo?.registrationNumber}`}
                                >
                                    <Car size={10} />
                                    <span>Cert: {item.vehicleInfo?.registrationNumber.slice(-4)}</span>
                                </button>
                            ))}
                         </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
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