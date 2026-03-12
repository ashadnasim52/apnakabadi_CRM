import React from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, MapPin, Clock, Calendar, MessageSquare, ChevronDown } from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

export const StaffLeads = () => {
  const { leads, updateLead, currentUser } = useApp();

  // Filter leads assigned to current user
  const myLeads = leads.filter(l => l.assignedTo === currentUser?.id);

  // Sorting: Newest first, but keep 'New' status at top
  const sortedLeads = [...myLeads].sort((a, b) => {
      if (a.status === 'New' && b.status !== 'New') return -1;
      if (a.status !== 'New' && b.status === 'New') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateLead(id, { status: newStatus as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'border-blue-500 bg-blue-50';
      case 'In Progress': return 'border-yellow-500 bg-yellow-50';
      case 'Converted': return 'border-green-500 bg-green-50';
      case 'Lost': return 'border-red-500 bg-red-50';
      default: return 'border-slate-200 bg-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Leads</h1>
        <p className="text-slate-500 mt-1">Manage your assigned scrap collection tasks</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedLeads.length > 0 ? (
          sortedLeads.map((lead) => (
            <div key={lead.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-5 ${getStatusColor(lead.status)}`}>
               <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h3 className="text-lg font-bold text-slate-800">{lead.name}</h3>
                         <span className="text-xs text-slate-400 flex items-center md:hidden">
                            <Calendar size={12} className="mr-1"/>
                            {new Date(lead.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-slate-600 hover:text-blue-600 transition w-fit">
                            <a href={`tel:${lead.phone}`} className="flex items-center">
                                <div className="p-1.5 bg-slate-100 rounded-full mr-2">
                                    <Phone size={14} />
                                </div>
                                <span className="font-medium">{lead.phone}</span>
                            </a>
                            <WhatsAppIcon phone={lead.phone} className="ml-3" />
                        </div>
                        <div className="flex items-start text-slate-600">
                            <div className="p-1.5 bg-slate-100 rounded-full mr-2 mt-0.5">
                                <MapPin size={14} />
                            </div>
                            <span>{lead.address}</span>
                        </div>
                        {lead.notes && (
                            <div className="flex items-start text-slate-500 text-sm bg-slate-50 p-3 rounded-lg mt-2">
                                <MessageSquare size={14} className="mr-2 mt-0.5 shrink-0" />
                                <p>{lead.notes}</p>
                            </div>
                        )}
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[160px]">
                      <div className="relative">
                          <select 
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`w-full appearance-none pl-4 pr-10 py-2 rounded-lg border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50
                                ${lead.status === 'New' ? 'border-blue-200 text-blue-700 bg-blue-100 focus:ring-blue-500' : 
                                  lead.status === 'In Progress' ? 'border-yellow-200 text-yellow-700 bg-yellow-100 focus:ring-yellow-500' :
                                  lead.status === 'Converted' ? 'border-green-200 text-green-700 bg-green-100 focus:ring-green-500' :
                                  'border-red-200 text-red-700 bg-red-100 focus:ring-red-500'}
                            `}
                          >
                            <option value="New">New Lead</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" size={16} />
                      </div>
                      <div className="hidden md:flex items-center justify-end text-xs text-slate-400">
                         <Calendar size={12} className="mr-1"/>
                         Added: {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
             <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-slate-400" size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-700">No Pending Leads</h3>
             <p className="text-slate-500">You have no leads assigned at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
