import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffMember } from '../../types';
import { Check, X, UserPlus, Phone, Shield, Lock, KeyRound, Trash2 } from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const Staff = () => {
  const { staff, addStaff, updateStaffStatus, updateStaffPassword, deleteStaff, leaves, updateLeaveStatus, reimbursements, updateReimbursementStatus, attendance, updateAttendanceStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'staff' | 'attendance' | 'leaves' | 'expenses'>('staff');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({ role: 'Worker', status: 'Active' });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaff.name && newStaff.phone && newStaff.role && newStaff.password) {
      addStaff({
        id: Date.now().toString(),
        name: newStaff.name,
        phone: newStaff.phone,
        role: newStaff.role as any,
        status: 'Active',
        password: newStaff.password
      });
      setShowAddModal(false);
      setNewStaff({ role: 'Worker', status: 'Active' });
    }
  };

  const handleResetPassword = (id: string, name: string) => {
    const newPass = prompt(`Enter new password for ${name}:`);
    if (newPass && newPass.trim() !== "") {
      updateStaffPassword(id, newPass);
      alert("Password updated successfully.");
    }
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete staff member "${name}"? This will remove all their access.`)) {
      deleteStaff(id);
    }
  };

  // Sort attendance: Pending first, then by date desc
  const sortedAttendance = [...attendance].sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage employees, leaves, and expenses</p>
        </div>
        {activeTab === 'staff' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <UserPlus size={18} />
            <span>Add Staff</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('staff')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          All Staff
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Attendance
          {attendance.filter(a => a.status === 'Pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {attendance.filter(a => a.status === 'Pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('leaves')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'leaves' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Leave Requests
          {leaves.filter(l => l.status === 'Pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {leaves.filter(l => l.status === 'Pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Reimbursements
          {reimbursements.filter(r => r.status === 'Pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {reimbursements.filter(r => r.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                     <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {member.status}
                    </span>
                    <button 
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                        className="text-slate-400 hover:text-red-600 transition"
                        title="Delete Staff"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                <div className="flex items-center text-slate-500 text-sm mt-1 space-x-2">
                  <Shield size={14} />
                  <span>{member.role}</span>
                </div>
                <div className="flex items-center text-slate-500 text-sm mt-1 space-x-2">
                  <Phone size={14} />
                  <span>{member.phone}</span>
                  <WhatsAppIcon phone={member.phone} className="ml-1" />
                </div>
                <div className="flex items-center text-slate-400 text-xs mt-1 space-x-2">
                  <Lock size={12} />
                  <span>Pass: ••••</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <button
                   onClick={() => handleResetPassword(member.id, member.name)}
                   className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 text-sm transition"
                   title="Reset Password"
                >
                  <KeyRound size={16} />
                  <span className="text-xs">Reset Pass</span>
                </button>

                <button 
                  onClick={() => updateStaffStatus(member.id, member.status === 'Active' ? 'Inactive' : 'Active')}
                  className={`text-sm font-medium ${member.status === 'Active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                >
                  {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Staff Name</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Check-In Time</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="p-4 font-medium text-slate-800">{record.staffName}</td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">{record.checkInTime}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      record.status === 'Present' ? 'bg-green-100 text-green-700' : 
                      record.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {record.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateAttendanceStatus(record.id, 'Present')}
                          className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                          title="Accept Present"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => updateAttendanceStatus(record.id, 'Rejected')}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Staff Name</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="p-4 font-medium text-slate-800">{leave.staffName}</td>
                  <td className="p-4 text-sm text-slate-600 font-medium">{leave.leaveType || 'Casual'}</td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{leave.reason}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {leave.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateLeaveStatus(leave.id, 'Approved')}
                          className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => updateLeaveStatus(leave.id, 'Rejected')}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Staff Name</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reimbursements.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-medium text-slate-800">{item.staffName}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-slate-600">{item.description}</td>
                  <td className="p-4 text-right font-bold text-slate-700">₹{item.amount.toLocaleString()}</td>
                  <td className="p-4 text-center">
                     <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      item.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {item.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => updateReimbursementStatus(item.id, 'Approved')}
                          className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => updateReimbursementStatus(item.id, 'Rejected')}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {reimbursements.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No reimbursement requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Staff Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newStaff.name || ''}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newStaff.phone || ''}
                  onChange={e => setNewStaff({...newStaff, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newStaff.password || ''}
                  onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                  placeholder="Set login password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newStaff.role}
                  onChange={e => setNewStaff({...newStaff, role: e.target.value as any})}
                >
                  <option value="Worker">Worker</option>
                  <option value="Driver">Driver</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
