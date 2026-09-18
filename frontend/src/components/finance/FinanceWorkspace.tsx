import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { financeApi, metricsApi, driveApi } from '../../services/api';
import {
  SalesOfficerPerformance,
  CustomerRanking,
  PettyCashRecord,
  InventoryProduct,
  Invoice,
} from '../../types';
import {
  DollarSign,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Trash2,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  ExternalLink,
  Shield,
  UserPlus,
  Trophy,
  Award,
  Medal,
  CreditCard,
  Building2,
  Package,
  Receipt,
  FileText,
  Printer,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Warehouse,
  Factory,
  Droplet,
  Check,
  Eye,
} from 'lucide-react';

const formatLKR = (amount: number): string => {
  return 'Rs. ' + Math.round(amount).toLocaleString('en-LK');
};

export const FinanceWorkspace: React.FC = () => {
  const { user } = useAuth();

  // Active Desk for Managing Director or Managers (FA accounts default directly to their desk)
  const [activeDesk, setActiveDesk] = useState<'FA1' | 'FA2' | 'FA3' | 'FA4' | 'LEDGER'>('FA1');

  // Determine current assistant persona
  const isFA1 = user?.email === 'finance1@jade.office';
  const isFA2 = user?.email === 'finance2@jade.office';
  const isFA3 = user?.email === 'finance3@jade.office';
  const isFA4 = user?.email === 'finance4@jade.office';
  const isMD = user?.role === 'MANAGING_DIRECTOR';

  // Set default active desk based on logged in user
  useEffect(() => {
    if (isFA1) setActiveDesk('FA1');
    else if (isFA2) setActiveDesk('FA2');
    else if (isFA3) setActiveDesk('FA3');
    else if (isFA4) setActiveDesk('FA4');
  }, [user?.email, isFA1, isFA2, isFA3, isFA4]);

  // Global feedback state
  const [globalLoading, setGlobalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Shared Data States
  const [salesOfficers, setSalesOfficers] = useState<SalesOfficerPerformance[]>([]);
  const [customers, setCustomers] = useState<CustomerRanking[]>([]);
  const [pettyCashList, setPettyCashList] = useState<PettyCashRecord[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryProduct[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);

  // Refresh data from executive metrics & invoices
  const loadAllData = async () => {
    try {
      setGlobalLoading(true);
      const [overviewRes, invRes] = await Promise.all([
        metricsApi.getExecutiveOverview(),
        financeApi.getInvoices().catch(() => ({ invoices: [] })),
      ]);

      if (overviewRes?.executive) {
        setSalesOfficers(overviewRes.executive.salesOfficers || []);
        setCustomers(overviewRes.executive.customerRankings || []);
        setPettyCashList(overviewRes.executive.pettyCashSummary?.allRecords || []);
        setInventoryList(overviewRes.executive.stockInventory?.products || []);
      }
      if (invRes?.invoices) {
        setInvoicesList(invRes.invoices);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // =========================================================================
  // FA1: SHANI MINOSHIKA (SALES, COLLECTIONS & REGISTRATION)
  // =========================================================================
  const [fa1Tab, setFa1Tab] = useState<'register-officer' | 'record-sales' | 'live-ranking'>('register-officer');
  
  // Registration Form State
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerArea, setNewOfficerArea] = useState('Colombo Central');
  const [newOfficerAvatar, setNewOfficerAvatar] = useState('');
  const [newOfficerSalesTarget, setNewOfficerSalesTarget] = useState('12000000');
  const [newOfficerCollectionTarget, setNewOfficerCollectionTarget] = useState('11000000');
  const [registeringOfficer, setRegisteringOfficer] = useState(false);

  // Sales Entry Form State
  const [perfOfficerName, setPerfOfficerName] = useState('');
  const [perfSalesActual, setPerfSalesActual] = useState('');
  const [perfCollectionActual, setPerfCollectionActual] = useState('');
  const [perfMonth, setPerfMonth] = useState(3);
  const [perfYear, setPerfYear] = useState(2026);
  const [recordingPerf, setRecordingPerf] = useState(false);

  // Handle FA1: Register New Sales Officer
  const handleRegisterSalesOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName.trim()) {
      showError('Please enter sales officer name.');
      return;
    }
    try {
      setRegisteringOfficer(true);
      const res = await financeApi.registerSalesOfficer({
        name: newOfficerName.trim(),
        area: newOfficerArea,
        avatarUrl: newOfficerAvatar.trim() || undefined,
        salesTarget: Number(newOfficerSalesTarget),
        collectionTarget: Number(newOfficerCollectionTarget),
        month: 3,
        year: 2026,
      });
      showSuccess(res.message);
      setNewOfficerName('');
      setNewOfficerAvatar('');
      loadAllData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to register sales officer');
    } finally {
      setRegisteringOfficer(false);
    }
  };

  // Handle FA1: Record Monthly Performance
  const handleRecordSalesPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfOfficerName) {
      showError('Please select a sales officer.');
      return;
    }
    try {
      setRecordingPerf(true);
      const res = await financeApi.recordSalesPerformance({
        name: perfOfficerName,
        salesActual: Number(perfSalesActual),
        collectionActual: Number(perfCollectionActual),
        month: perfMonth,
        year: perfYear,
      });
      showSuccess(res.message);
      setPerfSalesActual('');
      setPerfCollectionActual('');
      loadAllData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to record sales performance');
    } finally {
      setRecordingPerf(false);
    }
  };

  // Download CSV export
  const handleDownloadSalesCSV = () => {
    const token = localStorage.getItem('jade_token');
    const url = `/api/finance/export/sales-performance`;
    
    // Trigger download via link with auth token
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `JADE_Paint_Sales_Leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showSuccess('Sales & Collections CSV report downloaded successfully.');
      })
      .catch((err) => {
        showError('Failed to download CSV report: ' + err.message);
      });
  };

  // =========================================================================
  // FA2: RASHINI FERNANDO (PETTY CASH DESK)
  // =========================================================================
  const [fa2Tab, setFa2Tab] = useState<'create-voucher' | 'petty-ledger'>('create-voucher');
  const [pettyVoucherNo, setPettyVoucherNo] = useState(`PCV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [pettyDesc, setPettyDesc] = useState('');
  const [pettyCategory, setPettyCategory] = useState('Maintenance');
  const [pettyAmount, setPettyAmount] = useState('');
  const [pettySpentBy, setPettySpentBy] = useState('Production Floor Team');
  const [pettyApprovedBy, setPettyApprovedBy] = useState('Rashini Fernando');
  const [pettyDate, setPettyDate] = useState(new Date().toISOString().split('T')[0]);
  const [pettySizeFilter, setPettySizeFilter] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [recordingPetty, setRecordingPetty] = useState(false);

  // Handle FA2: Record Petty Cash
  const handleRecordPettyCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pettyVoucherNo || !pettyDesc || !pettyAmount) {
      showError('Please fill in voucher number, description, and amount.');
      return;
    }
    try {
      setRecordingPetty(true);
      const res = await financeApi.recordPettyCash({
        voucherNo: pettyVoucherNo,
        description: pettyDesc,
        category: pettyCategory,
        amount: Number(pettyAmount),
        date: pettyDate,
        spentBy: pettySpentBy,
        approvedBy: pettyApprovedBy,
      });
      showSuccess(res.message);
      setPettyDesc('');
      setPettyAmount('');
      setPettyVoucherNo(`PCV-2026-${Math.floor(100 + Math.random() * 900)}`);
      loadAllData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to record petty cash voucher');
    } finally {
      setRecordingPetty(false);
    }
  };

  const handleDeletePettyCash = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this petty cash voucher?')) return;
    try {
      const res = await financeApi.deletePettyCash(id);
      showSuccess(res.message);
      loadAllData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete petty cash record');
    }
  };

  // Filtered Petty Cash
  const filteredPettyCash = pettyCashList.filter((p) => {
    if (pettySizeFilter === 'HIGH' && p.amount < 15000) return false;
    if (pettySizeFilter === 'LOW' && p.amount >= 10000) return false;
    return true;
  });

  // =========================================================================
  // FA3: THIWARA DILMINI (CUSTOMER COLLECTIONS & CREDIT LIMITS)
  // =========================================================================
  const [fa3Tab, setFa3Tab] = useState<'update-credit' | 'credit-ledger'>('update-credit');
  const [creditCustomerName, setCreditCustomerName] = useState('');
  const [creditBusinessType, setCreditBusinessType] = useState('Paint & Coatings Wholesale');
  const [creditArea, setCreditArea] = useState('Colombo Central');
  const [creditAssignedOfficer, setCreditAssignedOfficer] = useState('Nishan Rajapaksha');
  const [creditCashPayments, setCreditCashPayments] = useState('');
  const [creditCreditsTaken, setCreditCreditsTaken] = useState('');
  const [creditLimitAmount, setCreditLimitAmount] = useState('10000000');
  const [recordingCredit, setRecordingCredit] = useState(false);

  // When customer selected from dropdown, populate fields
  const handleSelectExistingCustomer = (cName: string) => {
    setCreditCustomerName(cName);
    const found = customers.find((c) => c.customerName === cName);
    if (found) {
      setCreditBusinessType(found.businessType || 'Paint Retail Hardware');
      setCreditArea(found.area || 'Colombo Central');
      setCreditAssignedOfficer(found.assignedOfficer || 'Nishan Rajapaksha');
      setCreditCashPayments(String(found.cashPayments || 0));
      setCreditCreditsTaken(String(found.creditsTaken || 0));
      setCreditLimitAmount(String(found.creditLimit || 5000000));
    }
  };

  const handleRecordCustomerCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditCustomerName.trim()) {
      showError('Please enter or select a customer name.');
      return;
    }
    try {
      setRecordingCredit(true);
      const res = await financeApi.recordCustomerCredit({
        customerName: creditCustomerName.trim(),
        businessType: creditBusinessType,
        area: creditArea,
        assignedOfficer: creditAssignedOfficer,
        cashPayments: creditCashPayments ? Number(creditCashPayments) : undefined,
        creditsTaken: creditCreditsTaken ? Number(creditCreditsTaken) : undefined,
        creditLimit: creditLimitAmount ? Number(creditLimitAmount) : undefined,
        month: 3,
        year: 2026,
      });
      showSuccess(res.message);
      loadAllData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update customer credit limit');
    } finally {
      setRecordingCredit(false);
    }
  };

  // =========================================================================
  // FA4: SHALKI SUBASHI (STOCK BALANCE & INVOICING)
  // =========================================================================
  const [fa4Tab, setFa4Tab] = useState<'issue-invoice' | 'stock-adjust' | 'invoice-ledger'>('issue-invoice');
  
  // Invoicing Form State
  const [invCustomerName, setInvCustomerName] = useState('');
  const [invCustomerArea, setInvCustomerArea] = useState('Colombo Central');
  const [invSelectedSku, setInvSelectedSku] = useState('');
  const [invQuantity, setInvQuantity] = useState('100');
  const [invStockPool, setInvStockPool] = useState<'WAREHOUSE' | 'FACTORY'>('WAREHOUSE');
  const [invNotes, setInvNotes] = useState('');
  const [issuingInvoice, setIssuingInvoice] = useState(false);
  const [selectedInvoicePreview, setSelectedInvoicePreview] = useState<Invoice | null>(null);

  // Stock Adjustment State
  const [stockProductSku, setStockProductSku] = useState('');
  const [stockWarehouseVal, setStockWarehouseVal] = useState('');
  const [stockFactoryVal, setStockFactoryVal] = useState('');
  const [adjustingStock, setAdjustingStock] = useState(false);

  // Set default SKU for invoice form
  useEffect(() => {
    if (inventoryList.length > 0 && !invSelectedSku) {
      setInvSelectedSku(inventoryList[0].sku);
      setStockProductSku(inventoryList[0].sku);
      setStockWarehouseVal(String(inventoryList[0].warehouseStock));
      setStockFactoryVal(String(inventoryList[0].factoryStock));
    }
  }, [inventoryList, invSelectedSku]);

  const handleStockSkuChange = (sku: string) => {
    setStockProductSku(sku);
    const prod = inventoryList.find((p) => p.sku === sku);
    if (prod) {
      setStockWarehouseVal(String(prod.warehouseStock));
      setStockFactoryVal(String(prod.factoryStock));
    }
  };

  // Handle FA4: Issue Invoice with Real-Time Stock Deduction
  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCustomerName.trim()) {
      showError('Please enter a customer name for the invoice.');
      return;
    }
    const targetProduct = inventoryList.find((p) => p.sku === invSelectedSku);
    if (!targetProduct) {
      showError('Please select a valid paint product.');
      return;
    }
    const qty = Number(invQuantity);
    if (qty <= 0) {
      showError('Quantity must be greater than zero.');
      return;
    }

    // Check available stock in pool
    const currentStock = invStockPool === 'WAREHOUSE' ? targetProduct.warehouseStock : targetProduct.factoryStock;
    if (qty > currentStock) {
      if (!window.confirm(`Warning: Requested quantity (${qty} L) exceeds current ${invStockPool.toLowerCase()} stock (${currentStock} L). Proceed anyway?`)) {
        return;
      }
    }

    try {
      setIssuingInvoice(true);
      const res = await financeApi.issueInvoice({
        customerName: invCustomerName.trim(),
        customerArea: invCustomerArea,
        stockDeductedFrom: invStockPool,
        notes: invNotes,
        items: [
          {
            sku: targetProduct.sku,
            name: targetProduct.name,
            quantity: qty,
            unitPriceLKR: targetProduct.unitPriceLKR,
          },
        ],
      });
      showSuccess(res.message);
      setInvCustomerName('');
      setInvNotes('');
      loadAllData();
      if (res.invoice) {
        setSelectedInvoicePreview(res.invoice);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to issue invoice');
    } finally {
      setIssuingInvoice(false);
    }
  };

  // Handle FA4: Adjust Stock Balance
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProductSku) {
      showError('Please select a paint product.');
      return;
    }
    try {
      setAdjustingStock(true);
      const res = await financeApi.adjustStockBalance({
        sku: stockProductSku,
        warehouseStock: Number(stockWarehouseVal),
        factoryStock: Number(stockFactoryVal),
      });
      showSuccess(res.message);
      loadAllData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to adjust stock balance');
    } finally {
      setAdjustingStock(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="liquid-glass rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/20 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Department of Finance & Accounts</span>
              </span>
              <span className="text-xs font-medium text-slate-400">| Currency: LKR (Rs.)</span>
            </div>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Corporate Accounts & Authority Operations Desk
            </h1>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
              {isFA1 && 'Welcome Shani Minoshika. You hold exclusive authority for Sales & Collections operations and Sales Officer registration.'}
              {isFA2 && 'Welcome Rashini Fernando. You hold exclusive authority for Corporate & Plant Floor Petty Cash disbursal.'}
              {isFA3 && 'Welcome Thiwara Dilmini. You hold exclusive authority for Customer Collections and Credit Ceilings.'}
              {isFA4 && 'Welcome Shalki Subashi. You hold exclusive authority for Stock Balance management and issuing official Invoices.'}
              {isMD && 'Managing Director Chamikara De Silva: You have full oversight across all 4 Finance Assistant desks.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={globalLoading}
              className="liquid-glass-card flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-sm"
            >
              <Loader2 className={`h-3.5 w-3.5 text-emerald-600 ${globalLoading ? 'animate-spin' : ''}`} />
              <span>Sync Intelligence</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs font-bold text-rose-800 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Executive / Multi-Desk Switcher (Always visible for MD or when switching desks) */}
        {(isMD || (!isFA1 && !isFA2 && !isFA3 && !isFA4)) && (
          <div className="mt-6 pt-4 border-t border-white/20 dark:border-white/10">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
              Directorate Desk Selector (Role Authority Matrix):
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveDesk('FA1')}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeDesk === 'FA1'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'liquid-glass-card text-slate-700 dark:text-slate-300'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Desk 1: Shani Minoshika (Sales & Officers)</span>
              </button>

              <button
                onClick={() => setActiveDesk('FA2')}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeDesk === 'FA2'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'liquid-glass-card text-slate-700 dark:text-slate-300'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Desk 2: Rashini Fernando (Petty Cash)</span>
              </button>

              <button
                onClick={() => setActiveDesk('FA3')}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeDesk === 'FA3'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'liquid-glass-card text-slate-700 dark:text-slate-300'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Desk 3: Thiwara Dilmini (Collections & Credit Limits)</span>
              </button>

              <button
                onClick={() => setActiveDesk('FA4')}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeDesk === 'FA4'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'liquid-glass-card text-slate-700 dark:text-slate-300'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Desk 4: Shalki Subashi (Stock & Invoicing)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESK 1: SHANI MINOSHIKA (SALES, COLLECTIONS & REGISTRATION)               */}
      {/* ========================================================================= */}
      {activeDesk === 'FA1' && (
        <div className="space-y-6">
          {/* Desk Badge */}
          <div className="liquid-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                FA 1
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Shani Minoshika's Sales Directorate Desk
                </h3>
                <p className="text-[11px] text-slate-400">
                  Exclusive Authority: Sales Officer Registration, Monthly Sales & Collections Data Input, Live Ranking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSalesCSV}
                className="liquid-glass-card flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Report (CSV)</span>
              </button>
            </div>
          </div>

          {/* Sub-tabs for Desk 1 */}
          <div className="flex items-center gap-2 border-b border-white/20 dark:border-white/10 pb-2">
            <button
              onClick={() => setFa1Tab('register-officer')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa1Tab === 'register-officer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register New Sales Officer</span>
            </button>

            <button
              onClick={() => setFa1Tab('record-sales')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa1Tab === 'record-sales'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Input Sales & Collections</span>
            </button>

            <button
              onClick={() => setFa1Tab('live-ranking')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa1Tab === 'live-ranking'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Live Officers Ranking ({salesOfficers.length})</span>
            </button>
          </div>

          {/* Tab Content 1: Register Sales Officer */}
          {fa1Tab === 'register-officer' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  <span>Register New Sales Officer to Company Lineup</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Authority restricted to Shani Minoshika. Data persists to database in real time upon submission.
                </p>
              </div>

              <form onSubmit={handleRegisterSalesOfficer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Chamara"
                    value={newOfficerName}
                    onChange={(e) => setNewOfficerName(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Commercial Territory *
                  </label>
                  <select
                    value={newOfficerArea}
                    onChange={(e) => setNewOfficerArea(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="Colombo Central">Colombo Central</option>
                    <option value="Kandy Metro">Kandy Metro</option>
                    <option value="Gampaha District">Gampaha District</option>
                    <option value="Galle Coastal">Galle Coastal</option>
                    <option value="Kurunegala Zone">Kurunegala Zone</option>
                    <option value="Negombo Corridor">Negombo Corridor</option>
                    <option value="Jaffna Peninsula">Jaffna Peninsula</option>
                    <option value="Ratnapura Gem City">Ratnapura Gem City</option>
                    <option value="Anuradhapura North Central">Anuradhapura North Central</option>
                    <option value="Matara Southern Hub">Matara Southern Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Sales Target (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100000"
                    step="100000"
                    placeholder="12000000"
                    value={newOfficerSalesTarget}
                    onChange={(e) => setNewOfficerSalesTarget(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Collection Target (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100000"
                    step="100000"
                    placeholder="11000000"
                    value={newOfficerCollectionTarget}
                    onChange={(e) => setNewOfficerCollectionTarget(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profile Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newOfficerAvatar}
                    onChange={(e) => setNewOfficerAvatar(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={registeringOfficer}
                    className="liquid-glass-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {registeringOfficer ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                    <span>Register Sales Officer in Real Time</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab Content 2: Input Monthly Sales & Collections */}
          {fa1Tab === 'record-sales' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                  <span>Input Sales & Collection Figures</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time database updates for monthly sales performance and target achievement tracking.
                </p>
              </div>

              <form onSubmit={handleRecordSalesPerformance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Sales Officer *
                  </label>
                  <select
                    required
                    value={perfOfficerName}
                    onChange={(e) => setPerfOfficerName(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="">-- Choose Registered Officer --</option>
                    {Array.from(new Set(salesOfficers.map((s) => s.name))).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Month</label>
                    <select
                      value={perfMonth}
                      onChange={(e) => setPerfMonth(Number(e.target.value))}
                      className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    >
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March (Current)</option>
                      <option value={4}>April</option>
                      <option value={12}>December (Past)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fiscal Year</label>
                    <select
                      value={perfYear}
                      onChange={(e) => setPerfYear(Number(e.target.value))}
                      className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Sales Recorded (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="e.g. 18500000"
                    value={perfSalesActual}
                    onChange={(e) => setPerfSalesActual(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Collections Collected (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="e.g. 17200000"
                    value={perfCollectionActual}
                    onChange={(e) => setPerfCollectionActual(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={recordingPerf}
                    className="liquid-glass-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {recordingPerf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save Performance to Database Real Time</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab Content 3: Live Sales Officers Ranking */}
          {fa1Tab === 'live-ranking' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Real-Time Sales Officers Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live podium ranks updated synchronously with every recorded transaction.
                  </p>
                </div>

                <button
                  onClick={handleDownloadSalesCSV}
                  className="liquid-glass-card flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 self-start"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-black uppercase text-slate-400">
                      <th className="pb-3 pl-2">Rank</th>
                      <th className="pb-3">Sales Officer</th>
                      <th className="pb-3">Territory</th>
                      <th className="pb-3 text-right">Actual Sales</th>
                      <th className="pb-3 text-right">Actual Collections</th>
                      <th className="pb-3 text-center">Sales Target %</th>
                      <th className="pb-3 text-center">Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {[...salesOfficers]
                      .sort((a, b) => b.salesActual - a.salesActual)
                      .map((officer, idx) => {
                        const rank = idx + 1;
                        const pct = officer.salesTarget > 0 ? Math.round((officer.salesActual / officer.salesTarget) * 100) : 0;
                        return (
                          <tr key={officer.id || idx} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                            <td className="py-3 pl-2">
                              {rank === 1 ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400 text-amber-950 font-black px-2 py-0.5 text-[11px] shadow-sm">
                                  🥇 1st Gold
                                </span>
                              ) : rank === 2 ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 text-slate-900 font-black px-2 py-0.5 text-[11px] shadow-sm">
                                  🥈 2nd Silver
                                </span>
                              ) : rank === 3 ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-700 text-amber-100 font-black px-2 py-0.5 text-[11px] shadow-sm">
                                  🥉 3rd Bronze
                                </span>
                              ) : (
                                <span className="font-bold text-slate-500 pl-2">#{rank}</span>
                              )}
                            </td>
                            <td className="py-3 font-bold text-slate-900 dark:text-white">
                              {officer.name}
                            </td>
                            <td className="py-3">
                              <span className="rounded-md bg-blue-500/10 text-blue-600 px-2 py-0.5 text-[10px] font-bold">
                                {officer.area}
                              </span>
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {formatLKR(officer.salesActual)}
                            </td>
                            <td className="py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {formatLKR(officer.collectionActual)}
                            </td>
                            <td className="py-3 text-center">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  pct >= 100
                                    ? 'bg-emerald-500/15 text-emerald-600'
                                    : 'bg-amber-500/15 text-amber-600'
                                }`}
                              >
                                {pct}% Target
                              </span>
                            </td>
                            <td className="py-3 text-center text-slate-400 font-mono text-[10px]">
                              {officer.month}/{officer.year}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 2: RASHINI FERNANDO (PETTY CASH DESK)                                */}
      {/* ========================================================================= */}
      {activeDesk === 'FA2' && (
        <div className="space-y-6">
          <div className="liquid-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-teal-500">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-600 flex items-center justify-center font-bold">
                FA 2
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Rashini Fernando's Petty Cash Operations Desk
                </h3>
                <p className="text-[11px] text-slate-400">
                  Exclusive Authority: Daily, Monthly, and Yearly Petty Cash Vouchers & Maintenance Outlays
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/20 dark:border-white/10 pb-2">
            <button
              onClick={() => setFa2Tab('create-voucher')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa2Tab === 'create-voucher'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Record Petty Cash Voucher</span>
            </button>

            <button
              onClick={() => setFa2Tab('petty-ledger')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa2Tab === 'petty-ledger'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Petty Cash Ledger ({filteredPettyCash.length})</span>
            </button>
          </div>

          {fa2Tab === 'create-voucher' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-teal-500" />
                  <span>Issue New Petty Cash Voucher</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Authority restricted to Rashini Fernando. Real-time ledger recording with automatic LKR tally.
                </p>
              </div>

              <form onSubmit={handleRecordPettyCash} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Voucher Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={pettyVoucherNo}
                    onChange={(e) => setPettyVoucherNo(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={pettyCategory}
                    onChange={(e) => setPettyCategory(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="Maintenance">Plant Floor Maintenance</option>
                    <option value="Fuel">Generator & Delivery Fuel</option>
                    <option value="Refreshments">Worker Refreshments & Tea</option>
                    <option value="Courier & Post">Courier, Manifests & Stamps</option>
                    <option value="Office Stationery">Lab Stationery & Quality Records</option>
                    <option value="Cleaning">Solvent & Floor Cleaning Chemicals</option>
                    <option value="Transport">Emergency Factory Transport</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Disbursement Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paint dispersion vessel valve gasket replacement"
                    value={pettyDesc}
                    onChange={(e) => setPettyDesc(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15400"
                    value={pettyAmount}
                    onChange={(e) => setPettyAmount(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={pettyDate}
                    onChange={(e) => setPettyDate(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Spent By / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Line Mechanic"
                    value={pettySpentBy}
                    onChange={(e) => setPettySpentBy(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Approved By (Authorized Signatory)
                  </label>
                  <input
                    type="text"
                    value={pettyApprovedBy}
                    onChange={(e) => setPettyApprovedBy(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={recordingPetty}
                    className="liquid-glass-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {recordingPetty ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />}
                    <span>Save Petty Cash Voucher Real Time</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {fa2Tab === 'petty-ledger' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Factory & Operations Petty Cash Stream
                  </h3>
                  <p className="text-xs text-slate-400">
                    Filter by high outlays vs minimal operational disbursements.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-slate-200/60 dark:bg-charcoal-800/60 p-1">
                    <button
                      onClick={() => setPettySizeFilter('ALL')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        pettySizeFilter === 'ALL' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setPettySizeFilter('HIGH')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        pettySizeFilter === 'HIGH' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Expenses More
                    </button>
                    <button
                      onClick={() => setPettySizeFilter('LOW')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        pettySizeFilter === 'LOW' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Minimals
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-black uppercase text-slate-400">
                      <th className="pb-3 pl-2">Voucher #</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3 text-right">Amount (LKR)</th>
                      <th className="pb-3">Spent By</th>
                      <th className="pb-3">Approved By</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {filteredPettyCash.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                        <td className="py-3 pl-2 font-mono font-bold text-teal-600">{voucher.voucherNo}</td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {voucher.description}
                        </td>
                        <td className="py-3">
                          <span className="rounded-md bg-teal-500/10 text-teal-600 px-2 py-0.5 text-[10px] font-bold">
                            {voucher.category}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatLKR(voucher.amount)}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{voucher.spentBy}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">{voucher.approvedBy}</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDeletePettyCash(voucher.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Delete voucher"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 3: THIWARA DILMINI (CUSTOMER COLLECTIONS & CREDIT LIMITS)            */}
      {/* ========================================================================= */}
      {activeDesk === 'FA3' && (
        <div className="space-y-6">
          <div className="liquid-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                FA 3
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Thiwara Dilmini's Collections & Credit Ceilings Desk
                </h3>
                <p className="text-[11px] text-slate-400">
                  Exclusive Authority: Customer Payment Settlements, Outstanding Credits & Credit Ceilings Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/20 dark:border-white/10 pb-2">
            <button
              onClick={() => setFa3Tab('update-credit')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa3Tab === 'update-credit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Input Collections & Set Credit Limit</span>
            </button>

            <button
              onClick={() => setFa3Tab('credit-ledger')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa3Tab === 'credit-ledger'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Customer Credit Ceilings ({customers.length})</span>
            </button>
          </div>

          {fa3Tab === 'update-credit' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  <span>Update Customer Cash Payments & Set Credit Ceilings</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Authority restricted to Thiwara Dilmini. Directly updates credit risk thresholds in real time.
                </p>
              </div>

              <form onSubmit={handleRecordCustomerCredit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer / Paint Hardware Store *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruhuna Coastal Paint Mart"
                    value={creditCustomerName}
                    onChange={(e) => setCreditCustomerName(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    list="customer-suggestions"
                  />
                  <datalist id="customer-suggestions">
                    {customers.map((c) => (
                      <option key={c.id} value={c.customerName} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Existing Account to Auto-Fill
                  </label>
                  <select
                    onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="">-- Choose Registered Dealer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.customerName}>
                        {c.customerName} ({c.area})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Model / Type
                  </label>
                  <input
                    type="text"
                    placeholder="Wholesale Paint Depot"
                    value={creditBusinessType}
                    onChange={(e) => setCreditBusinessType(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operating Area / Province
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Galle Coastal"
                    value={creditArea}
                    onChange={(e) => setCreditArea(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Field Sales Officer
                  </label>
                  <select
                    value={creditAssignedOfficer}
                    onChange={(e) => setCreditAssignedOfficer(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="Nishan Rajapaksha">Nishan Rajapaksha (Colombo Central)</option>
                    <option value="Yasas Pamudhitha">Yasas Pamudhitha (Kandy Metro)</option>
                    <option value="Nimesh Asanka">Nimesh Asanka (Gampaha District)</option>
                    <option value="Nilupul Chandrasekara">Nilupul Chandrasekara (Galle Coastal)</option>
                    <option value="Sanjeewa Kumara">Sanjeewa Kumara (Kurunegala Zone)</option>
                    <option value="Shehan Mihiranga">Shehan Mihiranga (Negombo Corridor)</option>
                    <option value="Imesh Yasintha">Imesh Yasintha (Jaffna Peninsula)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Approved Credit Limit Ceiling (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100000"
                    step="100000"
                    placeholder="e.g. 10000000"
                    value={creditLimitAmount}
                    onChange={(e) => setCreditLimitAmount(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cash Payments Settled to Date (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 17250000"
                    value={creditCashPayments}
                    onChange={(e) => setCreditCashPayments(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Credits Taken / Outstanding (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 7800000"
                    value={creditCreditsTaken}
                    onChange={(e) => setCreditCreditsTaken(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={recordingCredit}
                    className="liquid-glass-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {recordingCredit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Update Customer Credit Limit Real Time</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {fa3Tab === 'credit-ledger' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <span>Customer Credit Utilization & Risk Ceilings</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Monitors credit exposure vs approved limits managed by Thiwara Dilmini.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-black uppercase text-slate-400">
                      <th className="pb-3 pl-2">Customer</th>
                      <th className="pb-3">Territory</th>
                      <th className="pb-3 text-right">Cash Payments</th>
                      <th className="pb-3 text-right">Credits Taken</th>
                      <th className="pb-3 text-right">Credit Ceiling</th>
                      <th className="pb-3">Credit Exposure Gauge</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {customers.map((c) => {
                      const limit = c.creditLimit || 5000000;
                      const pct = Math.min(100, Math.round((c.creditsTaken / limit) * 100));
                      const isHighRisk = pct >= 90;
                      const isWarning = pct >= 75 && pct < 90;

                      return (
                        <tr key={c.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                          <td className="py-3 pl-2">
                            <p className="font-bold text-slate-900 dark:text-white">{c.customerName}</p>
                            <p className="text-[10px] text-slate-400">{c.businessType || 'Retailer'}</p>
                          </td>
                          <td className="py-3">
                            <span className="rounded-md bg-indigo-500/10 text-indigo-600 px-2 py-0.5 text-[10px] font-bold">
                              {c.area}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatLKR(c.cashPayments)}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatLKR(c.creditsTaken)}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {formatLKR(limit)}
                          </td>
                          <td className="py-3 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-200 dark:bg-charcoal-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isHighRisk
                                      ? 'bg-rose-500'
                                      : isWarning
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isHighRisk
                                  ? 'bg-rose-500/20 text-rose-600'
                                  : isWarning
                                  ? 'bg-amber-500/20 text-amber-600'
                                  : 'bg-emerald-500/20 text-emerald-600'
                              }`}
                            >
                              {isHighRisk ? 'HIGH RISK' : isWarning ? 'WARNING' : 'HEALTHY'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 4: SHALKI SUBASHI (STOCK BALANCE & INVOICING)                        */}
      {/* ========================================================================= */}
      {activeDesk === 'FA4' && (
        <div className="space-y-6">
          <div className="liquid-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-rose-500">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                FA 4
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Shalki Subashi's Stock & Invoicing Terminal
                </h3>
                <p className="text-[11px] text-slate-400">
                  Exclusive Authority: Finished Goods Stock Balance (Central Warehouse & Factory Plant) and Issuing Official Sales Invoices
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/20 dark:border-white/10 pb-2">
            <button
              onClick={() => setFa4Tab('issue-invoice')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa4Tab === 'issue-invoice'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Issue Official Sales Invoice</span>
            </button>

            <button
              onClick={() => setFa4Tab('stock-adjust')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa4Tab === 'stock-adjust'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Stock Balance Adjuster ({inventoryList.length} Paint Formulations)</span>
            </button>

            <button
              onClick={() => setFa4Tab('invoice-ledger')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                fa4Tab === 'invoice-ledger'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Issued Invoices Ledger ({invoicesList.length})</span>
            </button>
          </div>

          {/* Sub-tab 1: Issue Official Invoice */}
          {fa4Tab === 'issue-invoice' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-500" />
                  <span>Generate Official Sales Invoice (Automatic Real-Time Stock Deduction)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Authority restricted to Shalki Subashi. Creates official invoice record and decrements stock in SQLite transaction.
                </p>
              </div>

              <form onSubmit={handleIssueInvoice} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Billed Customer / Dealer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Woodcraft & Hardware Mart"
                    value={invCustomerName}
                    onChange={(e) => setInvCustomerName(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    list="invoice-customer-list"
                  />
                  <datalist id="invoice-customer-list">
                    {customers.map((c) => (
                      <option key={c.id} value={c.customerName} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Territory / Area
                  </label>
                  <input
                    type="text"
                    value={invCustomerArea}
                    onChange={(e) => setInvCustomerArea(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Paint Product (16 Formulations) *
                  </label>
                  <select
                    value={invSelectedSku}
                    onChange={(e) => setInvSelectedSku(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    {inventoryList.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        [{p.mainCategory?.toUpperCase()}] {p.name} - Price: Rs. {p.unitPriceLKR.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity (Litres) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={invQuantity}
                      onChange={(e) => setInvQuantity(e.target.value)}
                      className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deduct Stock From *
                    </label>
                    <select
                      value={invStockPool}
                      onChange={(e) => setInvStockPool(e.target.value as any)}
                      className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    >
                      <option value="WAREHOUSE">Warehouse Stock (Colombo)</option>
                      <option value="FACTORY">Factory Stock (Gampaha)</option>
                    </select>
                  </div>
                </div>

                {/* Real-time price calculation box */}
                <div className="md:col-span-2 liquid-glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  {(() => {
                    const sel = inventoryList.find((p) => p.sku === invSelectedSku);
                    const qty = Number(invQuantity) || 0;
                    const price = sel?.unitPriceLKR || 0;
                    const total = qty * price;
                    const stockAvail = sel ? (invStockPool === 'WAREHOUSE' ? sel.warehouseStock : sel.factoryStock) : 0;
                    return (
                      <>
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase">Product Selected</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{sel?.name || 'None'}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Available in {invStockPool.toLowerCase()}: <span className="font-mono font-bold text-emerald-600">{stockAvail} Litres</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400 font-bold uppercase">Total Invoice Value</p>
                          <p className="text-xl font-mono font-black text-rose-600 dark:text-rose-400">
                            {formatLKR(total)}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Notes / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special packing for marine transport to Galle Coastal depot"
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={issuingInvoice}
                    className="liquid-glass-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {issuingInvoice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    <span>Issue Official Invoice & Deduct Stock</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-tab 2: Stock Balance Adjuster */}
          {fa4Tab === 'stock-adjust' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-rose-500" />
                  <span>Finished Goods Dual-Pool Stock Adjuster</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Update Warehouse Stock (Colombo Central) and Factory Stock (Gampaha Plant) in real time.
                </p>
              </div>

              {/* Adjustment Form */}
              <form onSubmit={handleAdjustStock} className="liquid-glass-card rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Paint Formulation *
                  </label>
                  <select
                    value={stockProductSku}
                    onChange={(e) => handleStockSkuChange(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    {inventoryList.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warehouse Stock (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockWarehouseVal}
                    onChange={(e) => setStockWarehouseVal(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Factory Stock (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockFactoryVal}
                    onChange={(e) => setStockFactoryVal(e.target.value)}
                    className="liquid-glass-input w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={adjustingStock}
                    className="liquid-glass-btn-primary flex items-center gap-2 rounded-2xl px-6 py-2 text-xs font-bold text-white shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {adjustingStock ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Update Stock Levels Real Time</span>
                  </button>
                </div>
              </form>

              {/* Full Product Lineup Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-black uppercase text-slate-400">
                      <th className="pb-3 pl-2">SKU</th>
                      <th className="pb-3">Paint Product Name</th>
                      <th className="pb-3">Tier</th>
                      <th className="pb-3">Brand Category</th>
                      <th className="pb-3 text-right">Warehouse (L)</th>
                      <th className="pb-3 text-right">Factory (L)</th>
                      <th className="pb-3 text-right">Total Stock</th>
                      <th className="pb-3 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {inventoryList.map((prod) => (
                      <tr key={prod.sku} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                        <td className="py-2.5 pl-2 font-mono font-bold text-slate-500">{prod.sku}</td>
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">{prod.name}</td>
                        <td className="py-2.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              prod.mainCategory === 'Industrial'
                                ? 'bg-purple-500/15 text-purple-600'
                                : 'bg-emerald-500/15 text-emerald-600'
                            }`}
                          >
                            {prod.mainCategory}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300 font-semibold">{prod.subCategory}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-blue-600">{prod.warehouseStock}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-amber-600">{prod.factoryStock}</td>
                        <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                          {prod.warehouseStock + prod.factoryStock} L
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatLKR(prod.unitPriceLKR)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Issued Invoices Ledger */}
          {fa4Tab === 'invoice-ledger' && (
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="h-4 w-4 text-rose-500" />
                  <span>Issued Official Invoices Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive history of all customer sales invoices issued by Shalki Subashi.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-black uppercase text-slate-400">
                      <th className="pb-3 pl-2">Invoice #</th>
                      <th className="pb-3">Customer Name</th>
                      <th className="pb-3">Territory</th>
                      <th className="pb-3 text-right">Total Amount</th>
                      <th className="pb-3">Stock Pool</th>
                      <th className="pb-3">Issued By</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Date</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {invoicesList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                        <td className="py-3 pl-2 font-mono font-bold text-rose-600">{inv.invoiceNumber}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{inv.customerName}</td>
                        <td className="py-3 text-slate-500">{inv.customerArea}</td>
                        <td className="py-3 text-right font-mono font-black text-slate-900 dark:text-white">
                          {formatLKR(inv.totalAmountLKR)}
                        </td>
                        <td className="py-3">
                          <span className="rounded-md bg-blue-500/10 text-blue-600 px-2 py-0.5 text-[10px] font-bold">
                            {inv.stockDeductedFrom}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{inv.issuedByName}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-600'
                                : inv.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-600'
                                : 'bg-blue-500/20 text-blue-600'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-400 font-mono text-[10px]">
                          {new Date(inv.issueDate || inv.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => setSelectedInvoicePreview(inv)}
                            className="liquid-glass-card rounded-lg px-2 py-1 text-[10px] font-bold text-rose-600 hover:text-rose-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoicePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-glass w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Official Paint Invoice: {selectedInvoicePreview.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoicePreview(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Billed Customer</p>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedInvoicePreview.customerName}
                  </p>
                  <p className="text-slate-500">{selectedInvoicePreview.customerArea}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Date Issued</p>
                  <p className="font-mono font-bold">
                    {new Date(selectedInvoicePreview.issueDate || selectedInvoicePreview.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-slate-500">Authorized Issuer: {selectedInvoicePreview.issuedByName}</p>
                </div>
              </div>

              <div className="liquid-glass-card rounded-2xl p-4">
                <div className="flex justify-between font-bold text-slate-400 text-[11px] border-b pb-2">
                  <span>Product / Items</span>
                  <span>Total (LKR)</span>
                </div>
                <div className="mt-2 space-y-2">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedInvoicePreview.itemsJson || '[]');
                      return items.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{it.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {it.quantity} L @ Rs. {it.unitPriceLKR?.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-mono font-bold">{formatLKR(it.totalLKR || 0)}</span>
                        </div>
                      ));
                    } catch {
                      return <p className="text-slate-400">Items recorded in invoice voucher.</p>;
                    }
                  })()}
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white">Total Amount</span>
                  <span className="text-base font-mono font-black text-rose-600 dark:text-rose-400">
                    {formatLKR(selectedInvoicePreview.totalAmountLKR)}
                  </span>
                </div>
              </div>

              {selectedInvoicePreview.notes && (
                <p className="text-[11px] text-slate-500 italic">Notes: {selectedInvoicePreview.notes}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="liquid-glass-btn-primary flex items-center gap-1.5 rounded-2xl px-5 py-2 text-xs font-bold text-white shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoicePreview(null)}
                className="liquid-glass-card rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
