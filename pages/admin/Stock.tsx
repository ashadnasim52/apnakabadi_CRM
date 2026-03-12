import React from 'react';
import { useApp } from '../../context/AppContext';
import { StockItem } from '../../types';
import { Plus, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Stock = () => {
  const { items, bills } = useApp();
  const navigate = useNavigate();

  const stockData: StockItem[] = items.map(item => {
    // Purchases: Weight added to stock
    const purchased = bills
      .filter(b => b.transactionType === 'PURCHASE')
      .reduce((acc, bill) => {
        const billItems = bill.items.filter(bi => bi.itemId === item.id);
        // Use totalWeight if available, fallback to weight for backward compatibility
        return acc + billItems.reduce((sum, bi) => sum + (bi.totalWeight || bi.weight), 0);
      }, 0);

    // Sales: Weight removed from stock
    const sold = bills
      .filter(b => b.transactionType === 'SALE')
      .reduce((acc, bill) => {
        const billItems = bill.items.filter(bi => bi.itemId === item.id);
        return acc + billItems.reduce((sum, bi) => sum + (bi.totalWeight || bi.weight), 0);
      }, 0);

    return {
      itemId: item.id,
      itemName: item.name,
      purchased: purchased,
      sold: sold,
      available: purchased - sold
    };
  }).sort((a, b) => b.available - a.available);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Inventory</h1>
          <p className="text-slate-500 mt-1">Real-time overview of available materials based on bills</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/billing')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          <span>Add New Purchase</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold text-right">Total Purchased</th>
                <th className="p-4 font-semibold text-right">Total Sold</th>
                <th className="p-4 font-semibold text-right">Available Stock</th>
                <th className="p-4 font-semibold text-right">Current Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockData.map((stock) => {
                const currentRate = items.find(i => i.id === stock.itemId)?.rate || 0;
                // Value is based on available stock * current market rate
                const value = Math.max(0, stock.available) * currentRate;
                
                return (
                  <tr key={stock.itemId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{stock.itemName}</td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded w-fit ml-auto">
                            <ArrowDownLeft size={14} className="mr-1" />
                            {stock.purchased.toFixed(2)} kg
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded w-fit ml-auto">
                            <ArrowUpRight size={14} className="mr-1" />
                            {stock.sold.toFixed(2)} kg
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <span className={`font-bold text-lg ${stock.available < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {stock.available.toFixed(2)} kg
                        </span>
                        {stock.available < 0 && (
                            <div className="text-xs text-red-500 flex items-center justify-end mt-1">
                                <AlertCircle size={10} className="mr-1"/> Negative Stock
                            </div>
                        )}
                    </td>
                    <td className="p-4 text-right text-slate-600 font-mono">
                        ₹{value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  </tr>
                );
              })}
              {stockData.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No items found in rate chart to track.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};