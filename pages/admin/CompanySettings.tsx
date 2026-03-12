import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Save } from 'lucide-react';

export const CompanySettingsPage = () => {
  const { company, updateCompany } = useApp();
  const [formData, setFormData] = useState(company);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(formData);
    alert('Company settings updated successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div>
          <h1 className="text-2xl font-bold text-slate-800">Company Settings</h1>
          <p className="text-slate-500 mt-1">Configure bill headers and digital signature</p>
        </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle / Tagline</label>
              <input 
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
              />
            </div>
          </div>
          
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
              <input 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
              />
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Digital Signature</label>
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors bg-white"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.signatureUrl ? (
                  <div className="relative group">
                    <img 
                      src={formData.signatureUrl} 
                      alt="Signature" 
                      className="h-20 mx-auto object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-sm rounded">
                      Change Image
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="mx-auto text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Upload Signature Image</span>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Recommended: PNG with transparent background. Will be printed on PDF bills.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
           <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live Preview (Bill Header)</h4>
              <div className="text-center font-serif text-slate-800">
                <div className="font-bold text-lg">{formData.name}</div>
                <div className="text-xs text-slate-600">{formData.subtitle}</div>
                <div className="text-xs text-slate-600">{formData.address}</div>
              </div>
           </div>

          <button 
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Save size={20} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};