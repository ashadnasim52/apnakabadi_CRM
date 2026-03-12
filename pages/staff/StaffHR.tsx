import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, DollarSign, Plus, CheckCircle, XCircle, AlertCircle, User, Fingerprint } from 'lucide-react';

export const StaffHR = () => {
  const { leaves, addLeaveRequest, reimbursements, addReimbursement, currentUser, attendance, markAttendance } = useApp();
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'expenses'>('attendance');

  // Leave Form State
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'Sick' | 'Casual' | 'Paid' | 'Other'>('Casual');

  // Expense Form State
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Derived Data
  const myLeaves = leaves.filter(l => l.staffId === currentUser?.id || l.staffName === currentUser?.name);
  const myReimbursements = reimbursements.filter(r => r.staffId === currentUser?.id);
  const myAttendance = attendance.filter(a => a.staffId === currentUser?.id);
  
  // Who is on leave TODAY
  const today = new Date().toISOString().split('T')[0];
  const absentToday = leaves.filter(l => 
    l.status === 'Approved' && 
    l.fromDate <= today && 
    l.toDate >= today
  );

  // Check if I marked attendance today
  const todayAttendance = myAttendance.find(a => a.date === today);

  const handleMarkAttendance = () => {
    if (!currentUser) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    markAttendance({
      id: Date.now().toString(),
      staffId: currentUser.id,
      staffName: currentUser.name,
      date: today,
      checkInTime: timeString,
      status: 'Pending'
    });
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(leaveStart) > new Date(leaveEnd)) {
      alert('End date cannot be before start date.');
      return;
    }
    if (currentUser) {
      addLeaveRequest({
        id: Date.now().toString(),
        staffId: currentUser.id,
        staffName: currentUser.name,
        leaveType,
        fromDate: leaveStart,
        toDate: leaveEnd,
        reason: leaveReason,
        status: 'Pending'
      });
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
      setLeaveType('Casual');
      alert('Leave request submitted!');
    }
  };

  const handleApplyExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && expenseAmount) {
      addReimbursement({
        id: Date.now().toString(),
        staffId: currentUser.id,
        staffName: currentUser.name,
        date: expenseDate,
        amount: parseFloat(expenseAmount),
        description: expenseDesc,
        status: 'Pending'
      });
      setExpenseAmount('');
      setExpenseDesc('');
      alert('Reimbursement request submitted!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">My Profile & HR</h1>
           <p className="text-slate-500 mt-1">Manage leaves and expense claims</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Fingerprint size={18} />
          Attendance
        </button>
        <button 
          onClick={() => setActiveTab('leaves')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'leaves' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Calendar size={18} />
          Leaves
        </button>
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <DollarSign size={18} />
          Reimbursements
        </button>
      </div>

      {activeTab === 'attendance' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-2">
                    <Fingerprint size={48} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Today's Attendance</h3>
                <p className="text-slate-500">{new Date().toDateString()}</p>
                
                {todayAttendance ? (
                    <div className={`px-6 py-3 rounded-lg border flex items-center gap-3 ${
                        todayAttendance.status === 'Present' ? 'bg-green-50 border-green-200 text-green-700' : 
                        todayAttendance.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}>
                        {todayAttendance.status === 'Present' && <CheckCircle size={24} />}
                        {todayAttendance.status === 'Rejected' && <XCircle size={24} />}
                        {todayAttendance.status === 'Pending' && <Clock size={24} />}
                        <div className="text-left">
                            <p className="font-bold text-sm uppercase">{todayAttendance.status}</p>
                            <p className="text-xs">Marked at {todayAttendance.checkInTime}</p>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={handleMarkAttendance}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 transition active:scale-95"
                    >
                        Mark Present Now
                    </button>
                )}
                {!todayAttendance && <p className="text-xs text-slate-400">Admin approval is required for attendance to be finalized.</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">Recent Logs</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                    {myAttendance.length > 0 ? (
                        <table className="w-full text-left min-w-[400px]">
                            <thead className="text-xs uppercase text-slate-500 bg-white border-b sticky top-0">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {myAttendance.map(record => (
                                    <tr key={record.id}>
                                        <td className="p-4">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-mono text-slate-600">{record.checkInTime}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                record.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-500">No attendance history found.</div>
                    )}
                </div>
            </div>
         </div>
      )}

      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Who is absent today */}
            <div className="lg:col-span-3">
                 <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0">
                        <User size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wide">On Leave Today ({new Date().toLocaleDateString()})</h3>
                        {absentToday.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {absentToday.map(l => (
                                    <span key={l.id} className="bg-white px-2 py-1 rounded text-sm text-slate-700 shadow-sm border border-orange-100">
                                        {l.staffName}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-orange-700 mt-1">Everyone is present today.</p>
                        )}
                    </div>
                 </div>
            </div>

            {/* Apply Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" /> Apply for Leave
                </h3>
                <form onSubmit={handleApplyLeave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                        <select required value={leaveType} onChange={e => setLeaveType(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="Casual">Casual Leave</option>
                            <option value="Sick">Sick Leave</option>
                            <option value="Paid">Paid Leave</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                            <input type="date" required value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                            <input type="date" required value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                        <textarea required rows={3} value={leaveReason} onChange={e => setLeaveReason(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">Submit Request</button>
                </form>
            </div>

            {/* My Leave History */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">My Leave History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="text-xs uppercase text-slate-500 bg-white border-b">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {myLeaves.length > 0 ? myLeaves.map(l => (
                                <tr key={l.id}>
                                    <td className="p-4 font-medium text-slate-800">
                                        {l.leaveType || 'Casual'}
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-slate-700">
                                        {new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-slate-600">{l.reason}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            l.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            l.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {l.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-6 text-center text-slate-400">No leave records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'expenses' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Apply Expense Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" /> Claim Reimbursement
                </h3>
                <form onSubmit={handleApplyExpense} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input type="date" required value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                        <input type="number" required value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0.00" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea required rows={3} value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} placeholder="Fuel, Repairs, etc." className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">Submit Claim</button>
                </form>
            </div>

            {/* History */}
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">My Claims</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="text-xs uppercase text-slate-500 bg-white border-b">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {myReimbursements.length > 0 ? myReimbursements.map(r => (
                                <tr key={r.id}>
                                    <td className="p-4 whitespace-nowrap text-slate-700">
                                        {new Date(r.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-slate-600">{r.description}</td>
                                    <td className="p-4 text-right font-bold text-slate-800">₹{r.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-6 text-center text-slate-400">No reimbursement records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};
