
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, StaffMember, Lead, ScrapItem } from '../types';

export type EntityType = 'customer' | 'staff' | 'lead' | 'item';

interface UniversalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: EntityType;
  initialValue?: string;
  onSuccess?: (id: string) => void;
}

export const UniversalAddModal = ({ isOpen, onClose, type, initialValue, onSuccess }: UniversalAddModalProps) => {
  const { addCustomer, addStaff, addLead, addItem, staff } = useApp();
  
  const [formData, setFormData] = useState<any>({
    name: initialValue || '',
    phone: '',
    address: '',
    role: 'Worker',
    password: '123',
    status: 'Active',
    category: 'Metal',
    rate: 0
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();

    switch (type) {
      case 'customer':
        addCustomer({ id, name: formData.name, phone: formData.phone, address: formData.address });
        break;
      case 'staff':
        addStaff({ id, name: formData.name, phone: formData.phone, role: formData.role, status: 'Active', password: formData.password });
        break;
      case 'lead':
        addLead({ 
          id, 
          name: formData.name, 
          phone: formData.phone, 
          address: formData.address, 
          status: 'New', 
          assignedTo: staff.find(s => s.status === 'Active')?.id || '',
          createdAt: new Date().toISOString()
        });
        break;
      case 'item':
        addItem({ id, name: formData.name, rate: Number(formData.rate), category: formData.category, lastUpdated: new Date().toISOString().split('T')[0] });
        break;
    }

    if (onSuccess) onSuccess(id);
    onClose();
  };

  const renderFields = () => {
    switch (type) {
      case 'customer':
      case 'lead':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input 
                  type="text" required value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
            </div>
          </>
        );
      case 'staff':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                >
                  <option value="Worker">Worker</option>
                  <option value="Driver">Driver</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" required value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
            </div>
          </>
        );
      case 'item':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                >
                  <option value="Metal">Metal</option>
                  <option value="Paper">Paper</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rate (₹/kg)</label>
                <input 
                  type="number" required value={formData.rate}
                  onChange={e => setFormData({...formData, rate: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>
            </div>
          </>
        );
    }
  };

  const titles = {
    customer: 'Add New Customer',
    staff: 'Add New Staff Member',
    lead: 'Create New Lead',
    item: 'Add New Scrap Item'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">{titles[type]}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {renderFields()}
          <div className="flex space-x-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg transition active:scale-95"
            >
              Save {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
