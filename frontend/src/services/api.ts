import axios from 'axios';
import { User, FileRecord, FinancialRecord, ExecutiveOverview, OperationalMetric } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jade_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
  updateTheme: async (theme: 'LIGHT' | 'DARK'): Promise<{ themePreference: 'LIGHT' | 'DARK' }> => {
    const res = await api.patch('/auth/theme', { theme });
    return res.data;
  },
};

// Google Drive API
export const driveApi = {
  uploadDocument: async (
    file: File,
    folderCategory: 'Finance' | 'Operations' | 'Sales' | 'Profiles' | 'General',
    category: string,
    relatedId?: string
  ): Promise<{ file: FileRecord }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderCategory', folderCategory);
    formData.append('category', category);
    if (relatedId) formData.append('relatedId', relatedId);

    const res = await api.post('/drive/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadAvatar: async (blob: Blob): Promise<{ user: User; avatarUrl: string; driveFileId: string }> => {
    const formData = new FormData();
    formData.append('avatar', blob, 'profile_cropped.png');

    const res = await api.post('/drive/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  listFiles: async (params?: { folder?: string; category?: string; search?: string }): Promise<{ files: FileRecord[] }> => {
    const res = await api.get('/drive/files', { params });
    return res.data;
  },
  deleteFile: async (fileId: string): Promise<{ message: string }> => {
    const res = await api.delete(`/drive/${fileId}`);
    return res.data;
  },
  getDriveStatus: async () => {
    const res = await api.get('/drive/status');
    return res.data;
  },
};

// Finance API
export const financeApi = {
  getTransactions: async (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: FinancialRecord[]; pagination: { total: number; page: number; pages: number } }> => {
    const res = await api.get('/finance/transactions', { params });
    return res.data;
  },
  createTransaction: async (data: {
    title: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    currency?: string;
    date: string;
    referenceNo?: string;
    notes?: string;
    driveFileId?: string;
  }): Promise<{ transaction: FinancialRecord }> => {
    const res = await api.post('/finance/transactions', data);
    return res.data;
  },
  getSummary: async (): Promise<{
    summary: {
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
      recordCount: number;
      categoryBreakdown: Array<{ category: string; amount: number }>;
      monthlyTrends: Array<{ month: string; income: number; expense: number; net: number }>;
    };
  }> => {
    const res = await api.get('/finance/summary');
    return res.data;
  },
  deleteTransaction: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/finance/transactions/${id}`);
    return res.data;
  },

  // FA1: Shani Minoshika (Sales & Officer Registration)
  registerSalesOfficer: async (data: {
    name: string;
    area: string;
    avatarUrl?: string;
    salesTarget: number;
    collectionTarget: number;
    month?: number;
    year?: number;
  }): Promise<{ message: string; officer: any }> => {
    const res = await api.post('/finance/sales-officers', data);
    return res.data;
  },
  recordSalesPerformance: async (data: {
    id?: string;
    name: string;
    area?: string;
    salesTarget?: number;
    salesActual: number;
    collectionTarget?: number;
    collectionActual: number;
    month?: number;
    year?: number;
  }): Promise<{ message: string; record: any }> => {
    const res = await api.post('/finance/sales-performance', data);
    return res.data;
  },
  getExportSalesUrl: (): string => {
    return '/api/finance/export/sales-performance';
  },

  // FA2: Rashini Fernando (Petty Cash Exclusive)
  recordPettyCash: async (data: {
    voucherNo: string;
    description: string;
    category: string;
    amount: number;
    date?: string;
    spentBy?: string;
    approvedBy?: string;
  }): Promise<{ message: string; record: any }> => {
    const res = await api.post('/finance/petty-cash', data);
    return res.data;
  },
  deletePettyCash: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/finance/petty-cash/${id}`);
    return res.data;
  },

  // FA3: Thiwara Dilmini (Customer Collections & Credit Limits)
  recordCustomerCredit: async (data: {
    id?: string;
    customerName: string;
    businessType?: string;
    assignedOfficer?: string;
    area?: string;
    cashPayments?: number;
    creditsTaken?: number;
    creditLimit?: number;
    month?: number;
    year?: number;
  }): Promise<{ message: string; customer: any }> => {
    const res = await api.post('/finance/customer-credit', data);
    return res.data;
  },

  // FA4: Shalki Subashi (Stock Balance & Invoices)
  adjustStockBalance: async (data: {
    id?: string;
    sku?: string;
    warehouseStock?: number;
    factoryStock?: number;
  }): Promise<{ message: string; product: any }> => {
    const res = await api.post('/finance/stock/adjust', data);
    return res.data;
  },
  issueInvoice: async (data: {
    customerName: string;
    customerArea?: string;
    items: Array<{ sku: string; name: string; quantity: number; unitPriceLKR: number }>;
    stockDeductedFrom?: 'WAREHOUSE' | 'FACTORY';
    notes?: string;
    dueDate?: string;
  }): Promise<{ message: string; invoice: any }> => {
    const res = await api.post('/finance/invoices', data);
    return res.data;
  },
  getInvoices: async (): Promise<{ invoices: any[] }> => {
    const res = await api.get('/finance/invoices');
    return res.data;
  },
};

// Metrics & Analytics API
export const metricsApi = {
  getExecutiveOverview: async (): Promise<{ executive: ExecutiveOverview }> => {
    const res = await api.get('/metrics/executive');
    return res.data;
  },
  getDepartmentMetrics: async (department: string): Promise<{ metrics: OperationalMetric[] }> => {
    const res = await api.get(`/metrics/department/${department}`);
    return res.data;
  },
  updateMetric: async (id: string, data: { currentValue?: number; status?: string }): Promise<{ metric: OperationalMetric }> => {
    const res = await api.patch(`/metrics/${id}`, data);
    return res.data;
  },
};

export default api;
