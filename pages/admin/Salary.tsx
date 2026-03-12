import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalaryPayment } from '../../types';
import { IndianRupee, Banknote, Calendar, User, FileText, Plus } from 'lucide-react';

export const Salary = () => {
  const { staff, salaryPayments, addSalaryPayment } = useApp();
  
  // Form State
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'Salary' | 'Advance' | 'Bonus'>('Salary');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');

  const activeStaff = staff.filter(s => s.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffMember = staff.find(s => s.id === selectedStaffId);
    if (!staffMember || !amount) return;

    const payment: SalaryPayment = {
      id: Date.now().toString(),
      staffId: staffMember.id,
      staffName: staffMember.name,
      amount: parseFloat(amount),
      paymentDate: date,
      type: type,
      remarks: remarks
    };

    addSalaryPayment(payment);
    
    // Reset Form
    setAmount('');
    setRemarks('');
    alert('Payment recorded successfully');
  };

  // Stats
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthPayments = salaryPayments.filter(p => p.paymentDate.startsWith(currentMonth));
  const totalSalaryPaid = thisMonthPayments.filter(p => p.type === 'Salary').reduce((sum, p) => sum + p.amount, 0);
  const totalAdvanceGiven = thisMonthPayments.filter(p => p.type === 'Advance').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Title & Stats */}
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold text-slate-800">Payroll & Salary</h1>
        <p className="text-slate-500 mt-1">Manage staff salaries, advances, and bonuses</p>
      </div>

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium">Salary Paid (This Month)</p>
             <h3 className="text-2xl font-bold text-slate-800">₹{totalSalaryPaid.toLocaleString()}</h3>
           </div>
           <div className="bg-green-100 p-3 rounded-full text-green-600">
             <IndianRupee size={24} />
           </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium">Advance Given (This Month)</p>
             <h3 className="text-2xl font-bold text-orange-600">₹{totalAdvanceGiven.toLocaleString()}</h3>
           </div>
           <div className="bg-orange-100 p-3 rounded-full text-orange-600">
             <Banknote size={24} />
           </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium">Total Staff</p>
             <h3 className="text-2xl font-bold text-blue-600">{activeStaff.length}</h3>
           </div>
           <div className="bg-blue-100 p-3 rounded-full text-blue-600">
             <User size={24} />
           </div>
         </div>
      </div>

      {/* Payment Form */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Plus className="mr-2 text-blue-600" size={20}/>
            Record New Payment
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Staff</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-slate-900"
                >
                  <option value="">-- Select Employee --</option>
                  {activeStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['Salary', 'Advance', 'Bonus'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t as any)}
                    className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                      type === t 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  placeholder="e.g., October Salary"
                  rows={3}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-700">Payment History</h2>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Staff Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Remarks</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {salaryPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="p-4 whitespace-nowrap text-slate-600">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-slate-800">{payment.staffName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      payment.type === 'Salary' ? 'bg-green-100 text-green-700' : 
                      payment.type === 'Advance' ? 'bg-orange-100 text-orange-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 truncate max-w-[150px]">{payment.remarks || '-'}</td>
                  <td className="p-4 text-right font-bold text-slate-700">₹{payment.amount.toLocaleString()}</td>
                </tr>
              ))}
              {salaryPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};