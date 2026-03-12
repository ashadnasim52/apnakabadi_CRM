import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ScrapItem, StaffMember, LeaveRequest, CompanySettings, Bill, ViewMode, Customer, SalaryPayment, Lead, Reimbursement, AttendanceRecord } from '../types';
import { 
  INITIAL_ITEMS, 
  INITIAL_STAFF, 
  INITIAL_LEAVES, 
  DEFAULT_COMPANY, 
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_BILLS,
  INITIAL_ATTENDANCE,
  INITIAL_REIMBURSEMENTS,
  INITIAL_SALARIES
} from '../constants';

interface AppContextType {
  items: ScrapItem[];
  addItem: (item: ScrapItem) => void;
  updateItemRate: (id: string, newRate: number) => void;
  deleteItem: (id: string) => void;
  staff: StaffMember[];
  addStaff: (member: StaffMember) => void;
  updateStaffStatus: (id: string, status: 'Active' | 'Inactive') => void;
  updateStaffPassword: (id: string, newPass: string) => void;
  deleteStaff: (id: string) => void;
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  leaves: LeaveRequest[];
  addLeaveRequest: (leave: LeaveRequest) => void;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  attendance: AttendanceRecord[];
  markAttendance: (record: AttendanceRecord) => void;
  updateAttendanceStatus: (id: string, status: 'Present' | 'Rejected') => void;
  reimbursements: Reimbursement[];
  addReimbursement: (reimbursement: Reimbursement) => void;
  updateReimbursementStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  salaryPayments: SalaryPayment[];
  addSalaryPayment: (payment: SalaryPayment) => void;
  company: CompanySettings;
  updateCompany: (settings: CompanySettings) => void;
  bills: Bill[];
  addBill: (bill: Bill) => void;
  deleteBill: (id: string) => void;
  currentUser: StaffMember | null;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  viewMode: ViewMode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [items, setItems] = useState<ScrapItem[]>(INITIAL_ITEMS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(INITIAL_REIMBURSEMENTS);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(INITIAL_SALARIES);
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  // Load from localStorage on mount (Simulating persistence)
  useEffect(() => {
    const savedBills = localStorage.getItem('apna_kabadi_bills');
    if (savedBills) setBills(JSON.parse(savedBills));
    
    const savedRates = localStorage.getItem('apna_kabadi_rates');
    if (savedRates) setItems(JSON.parse(savedRates));
    
    const savedStaff = localStorage.getItem('apna_kabadi_staff');
    if (savedStaff) setStaff(JSON.parse(savedStaff));

    const savedCustomers = localStorage.getItem('apna_kabadi_customers');
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

    const savedLeads = localStorage.getItem('apna_kabadi_leads');
    if (savedLeads) setLeads(JSON.parse(savedLeads));

    const savedLeaves = localStorage.getItem('apna_kabadi_leaves');
    if (savedLeaves) setLeaves(JSON.parse(savedLeaves));

    const savedAttendance = localStorage.getItem('apna_kabadi_attendance');
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

    const savedReimbursements = localStorage.getItem('apna_kabadi_reimbursements');
    if (savedReimbursements) setReimbursements(JSON.parse(savedReimbursements));

    const savedSalaries = localStorage.getItem('apna_kabadi_salaries');
    if (savedSalaries) setSalaryPayments(JSON.parse(savedSalaries));

    // Try to restore session
    const savedUser = localStorage.getItem('apna_kabadi_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem('apna_kabadi_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_rates', JSON.stringify(items));
  }, [items]);
  
  useEffect(() => {
    localStorage.setItem('apna_kabadi_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_reimbursements', JSON.stringify(reimbursements));
  }, [reimbursements]);

  useEffect(() => {
    localStorage.setItem('apna_kabadi_salaries', JSON.stringify(salaryPayments));
  }, [salaryPayments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('apna_kabadi_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('apna_kabadi_user');
    }
  }, [currentUser]);

  const addItem = (item: ScrapItem) => {
    setItems(prev => {
        // Ensure "Others" stays at the bottom if it exists
        const others = prev.find(i => i.name === 'Others');
        const rest = prev.filter(i => i.name !== 'Others');
        return others ? [...rest, item, others] : [...prev, item];
    });
  };

  const updateItemRate = (id: string, newRate: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, rate: newRate, lastUpdated: new Date().toISOString().split('T')[0] } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const addStaff = (member: StaffMember) => {
    setStaff(prev => [...prev, member]);
  };

  const updateStaffStatus = (id: string, status: 'Active' | 'Inactive') => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const updateStaffPassword = (id: string, newPass: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, password: newPass } : s));
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const addCustomer = (customer: Customer) => {
    // Check if exists
    if (!customers.some(c => c.phone === customer.phone)) {
      setCustomers(prev => [...prev, customer]);
    }
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addLead = (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const addLeaveRequest = (leave: LeaveRequest) => {
    setLeaves(prev => [leave, ...prev]);
  };

  const updateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const markAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
  };

  const updateAttendanceStatus = (id: string, status: 'Present' | 'Rejected') => {
    setAttendance(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addReimbursement = (reimbursement: Reimbursement) => {
    setReimbursements(prev => [reimbursement, ...prev]);
  };

  const updateReimbursementStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setReimbursements(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addSalaryPayment = (payment: SalaryPayment) => {
    setSalaryPayments(prev => [payment, ...prev]);
  };

  const updateCompany = (settings: CompanySettings) => {
    setCompany(settings);
  };

  const addBill = (bill: Bill) => {
    setBills(prev => [bill, ...prev]);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const login = (phone: string, pass: string): boolean => {
    const user = staff.find(s => s.phone === phone && s.password === pass && s.status === 'Active');
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const viewMode: ViewMode = currentUser?.role === 'Manager' ? 'ADMIN' : 'STAFF';

  return (
    <AppContext.Provider value={{
      items, addItem, updateItemRate, deleteItem,
      staff, addStaff, updateStaffStatus, updateStaffPassword, deleteStaff,
      customers, addCustomer, updateCustomer, deleteCustomer,
      leads, addLead, updateLead, deleteLead,
      leaves, addLeaveRequest, updateLeaveStatus,
      attendance, markAttendance, updateAttendanceStatus,
      reimbursements, addReimbursement, updateReimbursementStatus,
      salaryPayments, addSalaryPayment,
      company, updateCompany,
      bills, addBill, deleteBill,
      currentUser, login, logout, viewMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
