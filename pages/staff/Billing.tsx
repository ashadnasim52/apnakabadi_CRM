import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BillItem, Bill, TransactionType, PaymentStatus, Customer } from '../../types';
import { generateBillPDF } from '../../utils/pdfGenerator';
import { Plus, Trash2, RotateCcw, Save, AlertCircle, Printer, Share2, CheckCircle, FileDown, Search, ArrowRightLeft, User, MapPin, Phone, Lock, Briefcase } from 'lucide-react';

export const Billing = () => {
  const { items, company, addBill, currentUser, customers, addCustomer, leads } = useApp();
  
  // Refs for Focus Management
  const itemSelectRef = useRef<HTMLSelectElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const customNameRef = useRef<HTMLInputElement>(null);
  
  // Transaction Mode
  const [transactionType, setTransactionType] = useState<TransactionType>('PURCHASE');
  
  // Form State
  const [customerSearch, setCustomerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  // Item Entry State
  const [selectedItemId, setSelectedItemId] = useState(items.length > 0 ? items[0].id : '');
  const [weight, setWeight] = useState('');
  const [customName, setCustomName] = useState('');
  const [manualRate, setManualRate] = useState(''); // For Sales
  const [formError, setFormError] = useState<string | null>(null);

  // Modal States
  const [lastBill, setLastBill] = useState<Bill | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(customerSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [customerSearch]);

  // Effect to ensure selectedItemId is valid on load
  useEffect(() => {
    if (!selectedItemId && items.length > 0) {
        setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  // Derived state
  const selectedItemData = items.find(i => i.id === selectedItemId);
  const isOthers = selectedItemData?.name === 'Others' || selectedItemData?.category === 'Others';
  
  // Rate Logic: Purchase = Fixed Admin Rate, Sale = Manual/Negotiated Rate (Default to Admin Rate)
  const activeRate = transactionType === 'SALE' && manualRate !== ''
    ? parseFloat(manualRate) 
    : (selectedItemData?.rate || 0);

  const currentAmount = (parseFloat(weight) || 0) * activeRate;
  const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);
  const totalWeight = billItems.reduce((sum, item) => sum + (item.totalWeight || item.weight), 0);

  // --- UNIFIED CONTACT SEARCH LOGIC ---
  const allContacts = useMemo(() => {
    const combined = new Map<string, { id?: string, name: string, phone: string, address: string, type: 'Customer' | 'Lead' }>();

    customers.forEach(c => {
      combined.set(c.phone, { ...c, type: 'Customer' });
    });

    leads.forEach(l => {
      if (!combined.has(l.phone)) {
        combined.set(l.phone, {
          id: l.id,
          name: l.name,
          phone: l.phone,
          address: l.address,
          type: 'Lead'
        });
      }
    });

    return Array.from(combined.values());
  }, [customers, leads]);

  const filteredContacts = useMemo(() => {
      if (!debouncedSearch) return [];
      
      const lowerSearch = debouncedSearch.toLowerCase();
      return allContacts.filter(c => 
        c.name.toLowerCase().includes(lowerSearch) || 
        c.phone.includes(lowerSearch)
      ).slice(0, 10);
  }, [allContacts, debouncedSearch]);

  const selectContact = (contact: { id?: string, name: string, phone: string, address: string, type: 'Customer' | 'Lead' }) => {
    setCustomerName(contact.name);
    setCustomerPhone(contact.phone);
    setCustomerAddress(contact.address);
    setSelectedCustomerId(contact.type === 'Customer' ? contact.id : undefined);
    setCustomerSearch(''); 
    setShowCustomerSuggestions(false);
  };

  const addItem = () => {
    if (!selectedItemId) return;
    if (!weight || parseFloat(weight) <= 0) {
      setFormError('weight');
      weightInputRef.current?.focus();
      return;
    }
    if (isOthers && !customName) {
      setFormError('customName');
      customNameRef.current?.focus();
      return;
    }

    setFormError(null);

    const resolvedName = isOthers && customName 
      ? `Others (${customName})` 
      : (selectedItemData?.name || 'Unknown');

    const weightVal = parseFloat(weight);

    const newItem: BillItem = {
      id: Date.now().toString(),
      itemId: selectedItemId,
      itemName: resolvedName,
      customName: isOthers ? customName : undefined,
      rate: activeRate,
      weight: weightVal,
      totalWeight: weightVal,
      amount: currentAmount
    };

    setBillItems([...billItems, newItem]);
    
    // Reset inputs
    setWeight('');
    setCustomName('');
    setManualRate('');
    
    // Focus logic
    if (window.innerWidth > 768) {
        itemSelectRef.current?.focus();
    } else {
        (document.activeElement as HTMLElement)?.blur();
    }
  };

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const handleGenerateBill = () => {
    if (!customerName || billItems.length === 0) {
      alert("Please fill customer details and add at least one item.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const finalizeBillGeneration = () => {
    if (customerPhone && !customers.some(c => c.phone === customerPhone)) {
      addCustomer({
        id: Date.now().toString(),
        name: customerName,
        phone: customerPhone,
        address: customerAddress
      });
    }

    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const uniqueBillNo = `INV-${dateStr}-${randomSuffix}`;

    const bill: Bill = {
      id: Date.now().toString(),
      billNo: uniqueBillNo,
      transactionType,
      customerId: selectedCustomerId,
      customerName,
      customerPhone,
      customerAddress,
      items: billItems,
      totalAmount,
      paymentStatus,
      date: new Date().toISOString(),
      staffName: currentUser?.name || 'Staff',
      isFinalized: true,
    };

    addBill(bill);
    setLastBill(bill);
    
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedCustomerId(undefined);
    setBillItems([]);
    setWeight('');
    setCustomName('');
    setManualRate('');
    setPaymentStatus('Paid');

    setShowConfirmationModal(false);
    setShowSuccessModal(true);
  };

  const shareViaWhatsApp = () => {
    if (!lastBill) return;
    const type = lastBill.transactionType === 'PURCHASE' ? 'Purchase Receipt' : 'Sales Invoice';
    const text = `*${company.name}*\n${type} #${lastBill.billNo}\nDate: ${new Date(lastBill.date).toLocaleDateString()}\nStatus: ${lastBill.paymentStatus}\n\nTotal Amount: *₹${lastBill.totalAmount.toFixed(2)}*\n\nThank you!`;
    const url = `https://wa.me/${lastBill.customerPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const isPurchase = transactionType === 'PURCHASE';

  return (
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6 pb-20 lg:pb-0">
      
      {/* Top Bar: Transaction Type Toggle */}
      <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2 text-slate-600">
                <ArrowRightLeft size={20} />
                <span className="font-bold">Mode</span>
            </div>
            <div className="flex w-full sm:w-auto bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setTransactionType('PURCHASE')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-bold text-sm transition-all shadow-sm ${transactionType === 'PURCHASE' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 bg-transparent shadow-none'}`}
                >
                    Purchase (Buy)
                </button>
                <button 
                    onClick={() => setTransactionType('SALE')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-bold text-sm transition-all shadow-sm ${transactionType === 'SALE' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700 bg-transparent shadow-none'}`}
                >
                    Sale (Sell)
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        
        {/* Left Column: Customer & Item Entry */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            
            {/* Customer Details Card */}
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={18} className="text-slate-400"/>
                        Customer Details
                    </h3>
                    {selectedCustomerId && <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Existing</span>}
                </div>

                {/* Customer Search Dropdown */}
                <div className="relative mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setShowCustomerSuggestions(true);
                            }}
                            onFocus={() => setShowCustomerSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                            placeholder="Search Customer or Lead..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-slate-900 text-sm"
                        />
                    </div>
                    {showCustomerSuggestions && customerSearch && (
                        <div className="absolute z-30 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map((c, idx) => (
                                <div 
                                key={idx} 
                                onClick={() => selectContact(c)}
                                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                                        <p className="text-xs text-slate-500">{c.phone}</p>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                        c.type === 'Customer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {c.type === 'Customer' ? 'Existing' : 'Lead'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-slate-500">
                                {debouncedSearch !== customerSearch ? 'Searching...' : 'No matching contacts found.'}
                            </div>
                        )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                            type="text" 
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-sm"
                            placeholder="Name *"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                            type="tel" 
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-sm"
                            placeholder="Phone"
                        />
                    </div>
                    <div className="md:col-span-2 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                            type="text" 
                            value={customerAddress}
                            onChange={e => setCustomerAddress(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-sm"
                            placeholder="Address / Area"
                        />
                    </div>
                </div>
            </div>

            {/* Item Entry Card (Light Theme) */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg transition-colors duration-300 bg-white border-t-4 ${isPurchase ? 'border-blue-600' : 'border-emerald-600'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-bold ${isPurchase ? 'text-blue-700' : 'text-emerald-700'}`}>
                    {isPurchase ? 'Purchase Item' : 'Sell Item'}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${isPurchase ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        Stock: {isPurchase ? 'IN' : 'OUT'}
                    </span>
                </div>
            
                <div className="grid grid-cols-12 gap-3 items-end">
                    
                    {/* Item Select */}
                    <div className={`col-span-12 ${isOthers ? 'md:col-span-3' : 'md:col-span-4'}`}>
                        <label className="block text-xs text-slate-600 mb-1 font-medium">Item Name</label>
                        <select 
                            ref={itemSelectRef}
                            value={selectedItemId}
                            onChange={e => {
                                setSelectedItemId(e.target.value);
                                setCustomName('');
                                setManualRate('');
                            }}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 text-sm"
                        >
                            {items.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Description (Conditional) */}
                    {isOthers && (
                        <div className="col-span-12 md:col-span-3">
                            <label className="block text-xs text-slate-600 mb-1 font-medium">Description</label>
                            <input 
                                ref={customNameRef}
                                type="text" 
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && weightInputRef.current?.focus()}
                                className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder-slate-400 text-sm ${formError === 'customName' ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300'}`}
                                placeholder="Details..."
                            />
                        </div>
                    )}

                    {/* Rate Input */}
                    <div className={`col-span-6 ${isOthers ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <label className="block text-xs text-slate-600 mb-1 font-medium">Rate (₹/kg)</label>
                        {transactionType === 'SALE' ? (
                            <input 
                            type="number" 
                            value={manualRate !== '' ? manualRate : (activeRate > 0 ? activeRate : '')}
                            onChange={e => setManualRate(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && weightInputRef.current?.focus()}
                            placeholder={activeRate.toString()}
                            className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed font-mono text-center font-bold">
                            {activeRate.toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Weight Input */}
                    <div className={`col-span-6 ${isOthers ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <label className="block text-xs text-slate-600 mb-1 font-medium">Weight (Kg)</label>
                        <input 
                            ref={weightInputRef}
                            type="number" 
                            value={weight}
                            onChange={e => {
                                setWeight(e.target.value);
                                if (formError === 'weight') setFormError(null);
                            }}
                            className={`w-full p-3 bg-white text-slate-900 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-center ${formError === 'weight' ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-300'}`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        />
                    </div>

                    {/* Add Button */}
                    <div className="col-span-12 md:col-span-2">
                        <button 
                            onClick={addItem}
                            className={`w-full p-3 font-bold rounded-lg transition-transform active:scale-95 flex justify-center items-center text-white shadow-lg
                            ${isPurchase ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}
                            `}
                        >
                            <Plus size={24} />
                            <span className="md:hidden ml-2">Add</span>
                        </button>
                    </div>
                </div>
            
                {/* Footer of Card */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current Line Item</span>
                        <span className="text-xl font-bold text-slate-800">₹{currentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <span className="flex items-center text-amber-600 text-xs bg-amber-50 border border-amber-100 px-2 py-1 rounded font-medium">
                        <AlertCircle size={12} className="mr-1"/> 
                        {isPurchase ? 'Admin Fixed Rate' : 'Market Rate Check'}
                    </span>
                </div>
            </div>
        </div>

        {/* Right Column: Invoice Summary (Sticky on Desktop) */}
        <div className="lg:col-span-1 lg:sticky lg:top-4 z-10 space-y-4">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Invoice Items</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">{billItems.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px]">
                    {billItems.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {billItems.map((item) => (
                                <div key={item.id} className="p-3 hover:bg-slate-50 flex justify-between items-center group">
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800 text-sm">{item.itemName}</div>
                                        <div className="text-xs text-slate-500">
                                            {item.totalWeight || item.weight} kg × ₹{item.rate}
                                        </div>
                                    </div>
                                    <div className="text-right mx-3">
                                        <div className="font-bold text-slate-800 text-sm">₹{item.amount.toFixed(2)}</div>
                                    </div>
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        className="text-slate-300 hover:text-red-500 transition p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 space-y-2">
                             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <Plus size={24} className="opacity-50"/>
                             </div>
                             <p className="text-sm">Add items to bill</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    {/* Customer Summary in Right Panel */}
                    {customerName && (
                        <div className="mb-4 p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bill To</span>
                                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100 transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>EDIT</span>
                            </div>
                            <div className="font-bold text-slate-800 text-sm truncate">{customerName}</div>
                            {customerPhone && <div className="text-xs text-slate-500">{customerPhone}</div>}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600 font-medium">Total Weight</span>
                        <span className="text-lg font-bold text-slate-700">{totalWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600 font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <button 
                        onClick={handleGenerateBill}
                        disabled={billItems.length === 0}
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2
                            ${billItems.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 
                              isPurchase ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                        `}
                    >
                        <Save size={20} />
                        <span>Generate Invoice</span>
                    </button>
                </div>
             </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-100 p-3 rounded-full mb-4">
                        <Lock className="text-amber-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm & Finalize</h3>
                    
                    {/* Customer Summary in Modal */}
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 text-left">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bill To</span>
                        <div className="font-bold text-slate-800 text-sm truncate">{customerName}</div>
                        {customerPhone && <div className="text-xs text-slate-500">{customerPhone}</div>}
                        {customerAddress && <div className="text-xs text-slate-400 mt-0.5 truncate">{customerAddress}</div>}
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 text-left">
                        <h4 className="text-red-800 font-bold text-xs flex items-center uppercase tracking-wide mb-1">
                            <AlertCircle size={12} className="mr-1"/> Warning
                        </h4>
                        <p className="text-red-700 text-xs leading-relaxed">
                            Once confirmed, this bill becomes <strong>immutable</strong> (cannot be edited). 
                            If you need to make changes later, you must create a completely new bill.
                        </p>
                    </div>

                    <div className="flex w-full space-x-3">
                        <button 
                            onClick={() => setShowConfirmationModal(false)}
                            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={finalizeBillGeneration}
                            className={`flex-1 py-2.5 text-white rounded-lg font-medium transition shadow-md text-sm ${isPurchase ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            Confirm Final Bill
                        </button>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* POS Success Modal */}
      {showSuccessModal && lastBill && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center relative animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-1">Invoice Saved!</h2>
            <p className="text-slate-500 mb-6 text-sm">
              {lastBill.transactionType} #{lastBill.billNo}
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
               <button 
                 onClick={() => generateBillPDF(lastBill, company, 'print')}
                 className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
               >
                 <Printer size={24} className="text-slate-700 mb-2" />
                 <span className="font-medium text-slate-700 text-xs">Print</span>
               </button>
               
               <button 
                 onClick={() => generateBillPDF(lastBill, company, 'download')}
                 className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
               >
                 <FileDown size={24} className="text-slate-700 mb-2" />
                 <span className="font-medium text-slate-700 text-xs">Download</span>
               </button>
            </div>

            <button 
              onClick={shareViaWhatsApp}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition mb-4 shadow-sm"
            >
              <Share2 size={18} />
              <span>WhatsApp</span>
            </button>
            
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="text-slate-500 hover:text-slate-700 font-medium text-sm underline p-2"
            >
              Close & New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
