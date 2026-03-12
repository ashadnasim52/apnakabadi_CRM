import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { Search, UserPlus, MapPin, Phone, Edit, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const Customers = () => {
  const { customers, bills, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: ''
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData(customer);
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '' });
    }
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer ${name}?`)) {
        deleteCustomer(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return;

    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      // Check for duplicate phone on new add
      if (customers.some(c => c.phone === formData.phone)) {
        alert('A customer with this phone number already exists.');
        return;
      }
      addCustomer({
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      } as Customer);
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
           <p className="text-slate-500 mt-1">Manage client database and view history</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 bg-white text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <UserPlus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Customer Details</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold text-center">Total Visits</th>
                <th className="p-4 font-semibold text-right">Total Trade Volume</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => {
                // Calculate Stats
                const customerBills = bills.filter(b => b.customerPhone === customer.phone || b.customerId === customer.id);
                const totalPurchase = customerBills.filter(b => b.transactionType === 'PURCHASE').reduce((s, b) => s + b.totalAmount, 0);
                const totalSale = customerBills.filter(b => b.transactionType === 'SALE').reduce((s, b) => s + b.totalAmount, 0);
                
                return (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{customer.name}</div>
                      <div className="flex items-center text-slate-500 text-sm mt-0.5">
                        <Phone size={12} className="mr-1" />
                        {customer.phone}
                        <WhatsAppIcon phone={customer.phone} className="ml-2" />
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-start text-slate-600 text-sm">
                        <MapPin size={14} className="mr-1 mt-0.5 shrink-0 text-slate-400" />
                        {customer.address}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {customerBills.length}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="space-y-1">
                          {totalPurchase > 0 && (
                            <div className="text-xs flex justify-end items-center text-blue-600 font-medium">
                              <ArrowDownLeft size={12} className="mr-1" />
                              Bought: ₹{totalPurchase.toLocaleString()}
                            </div>
                          )}
                          {totalSale > 0 && (
                            <div className="text-xs flex justify-end items-center text-emerald-600 font-medium">
                               <ArrowUpRight size={12} className="mr-1" />
                               Sold: ₹{totalSale.toLocaleString()}
                            </div>
                          )}
                          {totalPurchase === 0 && totalSale === 0 && (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                       </div>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        onClick={() => handleOpenModal(customer)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">
                      No customers found. Add one manually or via billing.
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
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
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
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update Details' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};