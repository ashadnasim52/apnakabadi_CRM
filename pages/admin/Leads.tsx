import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lead } from '../../types';
import { Search, Plus, MapPin, Phone, User, Filter, Edit, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const Leads = () => {
  const { leads, addLead, updateLead, deleteLead, staff, customers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter staff to get only active ones for assignment
  const activeStaff = staff.filter(s => s.status === 'Active');

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    phone: '',
    address: '',
    status: 'New',
    assignedTo: '',
    notes: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Converted': return 'bg-green-100 text-green-700';
      case 'Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <AlertCircle size={14} className="mr-1" />;
      case 'In Progress': return <Clock size={14} className="mr-1" />;
      case 'Converted': return <CheckCircle2 size={14} className="mr-1" />;
      case 'Lost': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.phone.includes(searchTerm) || 
                          lead.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingId(lead.id);
      setFormData(lead);
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        phone: '', 
        address: '', 
        status: 'New', 
        assignedTo: activeStaff[0]?.id || '', 
        notes: '' 
      });
    }
    setShowModal(true);
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      if (!selectedId) return;
      
      const customer = customers.find(c => c.id === selectedId);
      if (customer) {
          setFormData(prev => ({
              ...prev,
              name: customer.name,
              phone: customer.phone,
              address: customer.address
          }));
      }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete lead "${name}"?`)) {
      deleteLead(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.assignedTo) return;

    if (editingId) {
      updateLead(editingId, formData);
    } else {
      addLead({
        id: Date.now().toString(),
        name: formData.name || '',
        phone: formData.phone || '',
        address: formData.address || '',
        status: (formData.status || 'New') as any,
        assignedTo: formData.assignedTo || '',
        createdAt: new Date().toISOString(),
        notes: formData.notes || ''
      });
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Lead Management</h1>
           <p className="text-slate-500 mt-1">Track potential scrap sources and assign to staff</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-56 bg-white text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-slate-900 text-sm"
             >
               <option value="All">All Status</option>
               <option value="New">New</option>
               <option value="In Progress">In Progress</option>
               <option value="Converted">Converted</option>
               <option value="Lost">Lost</option>
             </select>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Lead Details</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Assigned Staff</th>
                <th className="p-4 font-semibold">Notes</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const assignedStaff = staff.find(s => s.id === lead.assignedTo);
                return (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{lead.name}</div>
                      <div className="flex items-center text-slate-500 text-xs mt-1 space-x-2">
                        <span className="flex items-center"><Phone size={10} className="mr-1"/> {lead.phone} <WhatsAppIcon phone={lead.phone} className="ml-1" /></span>
                        <span className="flex items-center"><MapPin size={10} className="mr-1"/> {lead.address}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                         {getStatusIcon(lead.status)}
                         {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center text-slate-700 text-sm font-medium">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs mr-2 text-slate-600">
                            {assignedStaff?.name.charAt(0) || '?'}
                         </div>
                         {assignedStaff?.name || 'Unassigned'}
                       </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                       {lead.notes || '-'}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        onClick={() => handleOpenModal(lead)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(lead.id, lead.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">
                      No leads found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingId ? 'Edit Lead Details' : 'Create New Lead'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Select Customer */}
              {!editingId && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Select Existing Customer (Optional)</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                        onChange={handleCustomerSelect}
                        defaultValue=""
                      >
                          <option value="">-- Create Fresh Lead --</option>
                          {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                          ))}
                      </select>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Source Name</label>
                    <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Hotel Plaza"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                    <input 
                    type="tel" 
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="98XXXXXXXX"
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address / Location</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign To (Staff)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <select 
                        required
                        className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 appearance-none"
                        value={formData.assignedTo}
                        onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                        >
                            <option value="">-- Select Staff --</option>
                            {activeStaff.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Instructions</label>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Details about pickup or material..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingId ? 'Update Lead' : 'Transfer/Assign Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
