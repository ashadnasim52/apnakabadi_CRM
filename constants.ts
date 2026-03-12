
import { ScrapItem, StaffMember, LeaveRequest, CompanySettings, Lead, Customer, Bill, AttendanceRecord, Reimbursement, SalaryPayment } from './types';

// Helper to get past dates
const getDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getDateTime = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString(); // ISO String
};

export const INITIAL_ITEMS: ScrapItem[] = [
  { id: '1', name: 'Steel (Heavy)', rate: 45, lastUpdated: getDate(1), category: 'Metal' },
  { id: '2', name: 'Iron (Cast)', rate: 32, lastUpdated: getDate(2), category: 'Metal' },
  { id: '3', name: 'Lite Iron/Sheet', rate: 28, lastUpdated: getDate(2), category: 'Metal' },
  { id: '4', name: 'Tin Containers', rate: 18, lastUpdated: getDate(5), category: 'Metal' },
  { id: '5', name: 'Carton (OCC)', rate: 12, lastUpdated: getDate(0), category: 'Paper' },
  { id: '6', name: 'Newspaper', rate: 14, lastUpdated: getDate(0), category: 'Paper' },
  { id: '7', name: 'Office Files', rate: 10, lastUpdated: getDate(5), category: 'Paper' },
  { id: '8', name: 'Books/Magazines', rate: 12, lastUpdated: getDate(5), category: 'Paper' },
  { id: '9', name: 'Soft Plastic (LDPE)', rate: 15, lastUpdated: getDate(3), category: 'Plastic' },
  { id: '10', name: 'Hard Plastic (HDPE)', rate: 25, lastUpdated: getDate(3), category: 'Plastic' },
  { id: '11', name: 'Mixed E-Waste', rate: 50, lastUpdated: getDate(10), category: 'Electronics' },
  { id: '12', name: 'Aluminium', rate: 110, lastUpdated: getDate(1), category: 'Metal' },
  { id: '13', name: 'Brass', rate: 320, lastUpdated: getDate(1), category: 'Metal' },
  { id: '14', name: 'Copper (Armature)', rate: 650, lastUpdated: getDate(1), category: 'Metal' },
  { id: '15', name: 'Car Battery', rate: 75, lastUpdated: getDate(5), category: 'Others' },
  { id: '17', name: 'Silver Foil', rate: 20, lastUpdated: getDate(1), category: 'Metal' },
  { id: '18', name: 'Cardboard', rate: 8, lastUpdated: getDate(1), category: 'Paper' },
  { id: '19', name: 'PET Bottles', rate: 12, lastUpdated: getDate(1), category: 'Plastic' },
  { id: '20', name: 'CPU Motherboard', rate: 250, lastUpdated: getDate(1), category: 'Electronics' },
  { id: '21', name: 'Beer Bottles (Glass)', rate: 2, lastUpdated: getDate(1), category: 'Others' },
  { id: '16', name: 'Others/Mix', rate: 0, lastUpdated: getDate(30), category: 'Others' },
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'Ramesh Kumar', role: 'Manager', status: 'Active', phone: '9876543210', password: 'admin' },
  { id: '2', name: 'Suresh Singh', role: 'Worker', status: 'Active', phone: '9123456789', password: '123' },
  { id: '3', name: 'Mahesh Yadav', role: 'Driver', status: 'Active', phone: '9988776655', password: '123' },
  { id: '4', name: 'Dinesh Gupta', role: 'Worker', status: 'Active', phone: '8877665544', password: '123' },
  { id: '5', name: 'Rajesh Verma', role: 'Worker', status: 'Inactive', phone: '7766554433', password: '123' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Hotel Radisson Blue', phone: '9998887771', address: 'Main Road, Kadru' },
  { id: '2', name: 'Pantaloons Store', phone: '9998887772', address: 'Nucleus Mall, Circular Road' },
  { id: '3', name: 'Amit Apartments', phone: '9998887773', address: 'Kanke Road' },
  { id: '4', name: 'City Hospital', phone: '9998887774', address: 'Bariatu' },
  { id: '5', name: 'Local Hawkers Union', phone: '9998887775', address: 'Daily Market' },
  { id: '6', name: 'St. Xaviers College', phone: '9998887776', address: 'Purulia Road' },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  { id: '1', staffName: 'Suresh Singh', fromDate: getDate(2), toDate: getDate(0), reason: 'Fever', status: 'Approved' },
  { id: '2', staffName: 'Mahesh Yadav', fromDate: getDate(10), toDate: getDate(8), reason: 'Family Function', status: 'Approved' },
  { id: '3', staffName: 'Dinesh Gupta', fromDate: getDate(-2), toDate: getDate(-1), reason: 'Personal work', status: 'Pending' },
  { id: '4', staffName: 'Suresh Singh', fromDate: getDate(30), toDate: getDate(28), reason: 'Village visit', status: 'Rejected' },
];

export const INITIAL_LEADS: Lead[] = [
  { id: '1', name: 'Factory Clearance', phone: '9876512300', address: 'Industrial Area, Kokar', status: 'New', assignedTo: '2', createdAt: getDateTime(1), notes: 'Heavy machinery and iron scrap.' },
  { id: '2', name: 'Office Relocation', phone: '8877665500', address: 'Lalpur Chowk', status: 'In Progress', assignedTo: '3', createdAt: getDateTime(2), notes: 'Lots of paper, files, and old computers.' },
  { id: '3', name: 'Old Library', phone: '7766554400', address: 'Upper Bazar', status: 'Converted', assignedTo: '1', createdAt: getDateTime(10), notes: 'Books and shelves.' },
  { id: '4', name: 'Construction Site', phone: '6655443300', address: 'Ratu Road', status: 'Lost', assignedTo: '2', createdAt: getDateTime(15), notes: 'Price mismatch.' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', staffId: '2', staffName: 'Suresh Singh', date: getDate(0), checkInTime: '08:30 AM', status: 'Present' },
  { id: '2', staffId: '3', staffName: 'Mahesh Yadav', date: getDate(0), checkInTime: '09:00 AM', status: 'Present' },
  { id: '3', staffId: '4', staffName: 'Dinesh Gupta', date: getDate(0), checkInTime: '08:45 AM', status: 'Pending' },
  { id: '4', staffId: '2', staffName: 'Suresh Singh', date: getDate(1), checkInTime: '08:25 AM', status: 'Present' },
  { id: '5', staffId: '3', staffName: 'Mahesh Yadav', date: getDate(1), checkInTime: '09:15 AM', status: 'Present' },
];

export const INITIAL_REIMBURSEMENTS: Reimbursement[] = [
  { id: '1', staffId: '3', staffName: 'Mahesh Yadav', date: getDate(2), amount: 1500, description: 'Diesel for Pickup Truck (JH01-AB-1234)', status: 'Approved' },
  { id: '2', staffId: '2', staffName: 'Suresh Singh', date: getDate(5), amount: 200, description: 'Labour charges for loading', status: 'Approved' },
  { id: '3', staffId: '4', staffName: 'Dinesh Gupta', date: getDate(1), amount: 50, description: 'Tea/Snacks for client', status: 'Pending' },
];

export const INITIAL_SALARIES: SalaryPayment[] = [
  { id: '1', staffId: '2', staffName: 'Suresh Singh', amount: 5000, paymentDate: getDate(5), type: 'Advance', remarks: 'Medical emergency' },
  { id: '2', staffId: '3', staffName: 'Mahesh Yadav', amount: 12000, paymentDate: getDate(30), type: 'Salary', remarks: 'Full month salary' },
  { id: '3', staffId: '4', staffName: 'Dinesh Gupta', amount: 2000, paymentDate: getDate(15), type: 'Bonus', remarks: 'Diwali Bonus' },
];

export const DEFAULT_COMPANY: CompanySettings = {
  name: 'Apna Kabadi',
  subtitle: 'Premier Scrap Solutions',
  address: 'Plot 45, Industrial Area, Kokar, Ranchi, Jharkhand - 834001',
  phone: '0651-2544123',
  signatureUrl: null,
};

// Creating Dummy Bills to populate Stock and Dashboard
export const INITIAL_BILLS: Bill[] = [
  // Purchases (Stock IN)
  {
    id: '101', billNo: 'PUR-001', transactionType: 'PURCHASE', customerName: 'Local Hawkers Union', customerPhone: '9998887775', customerAddress: 'Daily Market',
    date: getDateTime(10), paymentStatus: 'Paid', staffName: 'Ramesh Kumar', totalAmount: 45000, isFinalized: true,
    items: [
      { id: 'b1', itemId: '2', itemName: 'Iron (Cast)', rate: 30, weight: 1000, totalWeight: 1000, amount: 30000 },
      { id: 'b2', itemId: '12', itemName: 'Aluminium', rate: 100, weight: 150, totalWeight: 150, amount: 15000 },
    ]
  },
  {
    id: '102', billNo: 'PUR-002', transactionType: 'PURCHASE', customerName: 'City Hospital', customerPhone: '9998887774', customerAddress: 'Bariatu',
    date: getDateTime(5), paymentStatus: 'Paid', staffName: 'Suresh Singh', totalAmount: 18500, isFinalized: true,
    items: [
      { id: 'b3', itemId: '1', itemName: 'Steel (Heavy)', rate: 40, weight: 200, totalWeight: 200, amount: 8000 },
      { id: 'b4', itemId: '14', itemName: 'Copper (Armature)', rate: 600, weight: 10, totalWeight: 10, amount: 6000 },
      { id: 'b5', itemId: '11', itemName: 'Mixed E-Waste', rate: 45, weight: 100, totalWeight: 100, amount: 4500 },
    ]
  },
  {
    id: '103', billNo: 'PUR-003', transactionType: 'PURCHASE', customerName: 'Hotel Radisson Blue', customerPhone: '9998887771', customerAddress: 'Main Road',
    date: getDateTime(2), paymentStatus: 'Pending', staffName: 'Mahesh Yadav', totalAmount: 5600, isFinalized: true,
    items: [
      { id: 'b6', itemId: '21', itemName: 'Beer Bottles (Glass)', rate: 2, weight: 500, totalWeight: 500, amount: 1000 },
      { id: 'b7', itemId: '5', itemName: 'Carton (OCC)', rate: 10, weight: 460, totalWeight: 460, amount: 4600 },
    ]
  },

  // Sales (Stock OUT)
  {
    id: '201', billNo: 'SAL-001', transactionType: 'SALE', customerName: 'Jharkhand Steel Works', customerPhone: '8877665511', customerAddress: 'Tatisilwai',
    date: getDateTime(1), paymentStatus: 'Paid', staffName: 'Ramesh Kumar', totalAmount: 52500, isFinalized: true,
    items: [
      { id: 's1', itemId: '2', itemName: 'Iron (Cast)', rate: 35, weight: 1500, totalWeight: 1500, amount: 52500 }, // Selling more than purchased in batch 1 to test logic
    ]
  },
  {
    id: '202', billNo: 'SAL-002', transactionType: 'SALE', customerName: 'Recycle Hub India', customerPhone: '7766554422', customerAddress: 'Delhi',
    date: getDateTime(0), paymentStatus: 'Paid', staffName: 'Ramesh Kumar', totalAmount: 70000, isFinalized: true,
    items: [
      { id: 's2', itemId: '14', itemName: 'Copper (Armature)', rate: 700, weight: 100, totalWeight: 100, amount: 70000 },
    ]
  }
];
