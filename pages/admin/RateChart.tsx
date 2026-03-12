import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Edit2, Save, X, AlertTriangle, Search, Plus, Trash2 } from 'lucide-react';

export const RateChart = () => {
  const { items, updateItemRate, addItem, deleteItem } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Metal', rate: '' });

  const startEdit = (id: string, currentRate: number) => {
    setEditingId(id);
    setTempRate(currentRate.toString());
  };

  const saveEdit = (id: string) => {
    const rate = parseFloat(tempRate);
    if (!isNaN(rate) && rate >= 0) {
      updateItemRate(id, rate);
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempRate('');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This item will be removed from the selection list.`)) {
      deleteItem(id);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.rate) {
      addItem({
        id: Date.now().toString(),
        name: newItem.name,
        category: newItem.category as any,
        rate: parseFloat(newItem.rate),
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Metal', rate: '' });
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Rate Chart Management</h1>
           <p className="text-slate-500 mt-1">Manage daily scrap buying rates</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-64 bg-white text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start space-x-3">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-amber-800">Critical Warning</h4>
          <p className="text-sm text-amber-700 mt-1">
            Rates updated here reflect instantly in the staff billing panel. Do not change rates while a purchase is being negotiated to avoid discrepancies.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Current Rate (₹/Kg)</th>
                <th className="p-4 font-semibold text-right">Last Updated</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{item.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={tempRate}
                        onChange={(e) => setTempRate(e.target.value)}
                        className="w-24 text-right p-1 border border-blue-400 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                        autoFocus
                      />
                    ) : (
                      <span className="font-bold text-slate-700">₹{item.rate.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="p-4 text-right text-sm text-slate-500">{item.lastUpdated}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    {editingId === item.id ? (
                      <>
                        <button 
                          onClick={() => saveEdit(item.id)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                          title="Save"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                            onClick={() => startEdit(item.id, item.rate)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Edit Rate"
                            disabled={item.name === 'Others' && item.rate === 0} 
                        >
                            <Edit2 size={18} />
                        </button>
                        {item.name !== 'Others' && (
                            <button 
                                onClick={() => handleDelete(item.id, item.name)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                title="Delete Item"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No items found matching your search.
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Copper Wire"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                >
                  <option value="Metal">Metal</option>
                  <option value="Paper">Paper</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Rate (₹/Kg)</label>
                <input 
                  type="number" 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  value={newItem.rate}
                  onChange={e => setNewItem({...newItem, rate: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3 pt-2">
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};