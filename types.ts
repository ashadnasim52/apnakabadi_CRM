
export interface ScrapItem {
  id: string;
  name: string;
  rate: number;
  lastUpdated: string;
  category: 'Metal' | 'Paper' | 'Plastic' | 'Electronics' | 'Others';
}

export interface StockItem {
  itemId: string;
  itemName: string;
  purchased: number;
  sold: number;
  available: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Manager' | 'Worker' | 'Driver';
  status: 'Active' | 'Inactive';
  phone: string;
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: 'New' | 'In Progress' | 'Converted' | 'Lost';
  assignedTo: string; // Staff ID
  createdAt: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  staffId?: string;
  staffName: string;
  leaveType?: 'Sick' | 'Casual' | 'Paid' | 'Other';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM
  status: 'Pending' | 'Present' | 'Rejected';
}

export interface Reimbursement {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  paymentDate: string;
  type: 'Salary' | 'Advance' | 'Bonus';
  remarks?: string;
}

export interface CompanySettings {
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  signatureUrl: string | null; // Base64 string for demo
}

export interface BillItem {
  id: string; // unique row id
  itemId: string; // ref to ScrapItem
  itemName: string; // Snapshot of item name
  customName?: string; // for 'Others'
  rate: number;
  weight: number;
  totalWeight: number;
  amount: number;
}

export type TransactionType = 'PURCHASE' | 'SALE';
export type PaymentStatus = 'Paid' | 'Pending';

export interface Bill {
  id: string;
  billNo: string;
  transactionType: TransactionType;
  customerId?: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: BillItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  date: string;
  staffName: string;
  isFinalized?: boolean;
}

export type ViewMode = 'ADMIN' | 'STAFF';
