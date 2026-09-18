export type UserRole =
  | 'MANAGING_DIRECTOR'
  | 'OPERATIONAL_MANAGER'
  | 'TECH_SALES_MANAGER'
  | 'FINANCE_ASSISTANT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  assistantAuthority?: string;
  avatarUrl?: string;
  driveAvatarId?: string;
  themePreference: 'LIGHT' | 'DARK';
  lastLoginAt?: string;
  createdAt?: string;
}

export interface FileRecord {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  driveFileId: string;
  driveWebView: string;
  driveFolder: 'Finance' | 'Operations' | 'Sales' | 'Profiles' | 'General';
  category: string;
  uploaderId: string;
  uploader?: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  relatedId?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  title: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  currency: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  referenceNo?: string;
  notes?: string;
  creatorId: string;
  creator?: {
    name: string;
    email: string;
  };
  driveFileId?: string;
  createdAt: string;
}

export interface OperationalMetric {
  id: string;
  title: string;
  department: 'Operations' | 'TechSales';
  metricType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'COMPLETED';
  dateRecorded: string;
}

export interface ExecutiveKPIs {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  totalFilesTracked: number;
  activePersonnel: number;
}

export interface SalesOfficerPerformance {
  id: string;
  name: string;
  avatarUrl?: string;
  area: string;
  salesTarget: number;
  salesActual: number;
  collectionTarget: number;
  collectionActual: number;
  month: number;
  year: number;
  salesTargetPct?: number;
  collectionTargetPct?: number;
}

export interface CustomerRanking {
  id: string;
  customerName: string;
  businessType?: string;
  assignedOfficer: string;
  area: string;
  cashPayments: number;
  creditsTaken: number;
  creditLimit: number;
  month: number;
  year: number;
}

export interface PettyCashRecord {
  id: string;
  voucherNo: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  spentBy: string;
  approvedBy: string;
}

export interface PettyCashSummary {
  totalSpent: number;
  recordCount: number;
  allRecords: PettyCashRecord[];
  topExpenses: PettyCashRecord[];
  minimalExpenses: PettyCashRecord[];
}

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  mainCategory?: 'Domestic' | 'Industrial' | string;
  subCategory?: 'Woodshield' | 'Masoguard' | 'Decoratives' | 'Eco Cleaners' | 'Metashield' | 'Tyreshield' | string;
  category: string;
  warehouseStock: number;
  factoryStock: number;
  totalStock?: number;
  unit: string;
  minThreshold: number;
  unitPriceLKR: number;
  status?: 'IN_STOCK' | 'LOW_STOCK';
}

export interface StockSummary {
  totalWarehouseStock: number;
  totalFactoryStock: number;
  totalStock: number;
  totalProducts: number;
  products: InventoryProduct[];
}

export interface ExecutiveOverview {
  kpis: ExecutiveKPIs;
  financialTrends: Array<{
    month: string;
    revenue: number;
    expense: number;
    profit: number;
  }>;
  operationsMetrics: OperationalMetric[];
  salesMetrics: OperationalMetric[];
  recentFiles: FileRecord[];
  recentTransactions: FinancialRecord[];
  salesOfficers?: SalesOfficerPerformance[];
  customerRankings?: CustomerRanking[];
  pettyCashSummary?: PettyCashSummary;
  stockInventory?: StockSummary;
}

export interface InvoiceItem {
  sku: string;
  name: string;
  quantity: number;
  unitPriceLKR: number;
  totalLKR: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerArea?: string;
  issueDate: string;
  dueDate?: string;
  status: 'ISSUED' | 'PAID' | 'PENDING' | 'CANCELLED';
  itemsJson: string;
  subTotalLKR: number;
  taxLKR: number;
  totalAmountLKR: number;
  notes?: string;
  issuedById: string;
  issuedByName: string;
  stockDeductedFrom: 'WAREHOUSE' | 'FACTORY';
  createdAt: string;
  items?: InvoiceItem[];
}


