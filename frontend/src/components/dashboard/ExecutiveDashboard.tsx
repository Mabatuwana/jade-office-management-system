import React, { useEffect, useState, useMemo } from 'react';
import { metricsApi } from '../../services/api';
import {
  ExecutiveOverview,
  SalesOfficerPerformance,
  CustomerRanking,
  PettyCashRecord,
  InventoryProduct,
} from '../../types';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FolderSync,
  Users,
  FileText,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trophy,
  Award,
  Medal,
  Coins,
  Building2,
  Warehouse,
  Factory,
  Package,
  Receipt,
  Filter,
  Calendar,
  Layers,
  Search,
  Paintbrush,
  Sparkles,
  Shield,
  Droplet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Helper to format Sri Lankan Rupee
const formatLKR = (amount: number): string => {
  return 'Rs. ' + amount.toLocaleString('en-LK');
};

type ExecutiveTab = 'sales-ranking' | 'customer-ranking' | 'petty-cash' | 'stock-balance' | 'overview';

export const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<ExecutiveOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab State (Default to Sales Officers Ranking)
  const [activeTab, setActiveTab] = useState<ExecutiveTab>('sales-ranking');

  // Sales Officers Filters
  const [salesSortMode, setSalesSortMode] = useState<'sales' | 'collections'>('sales');
  const [salesMonthFilter, setSalesMonthFilter] = useState<number>(3); // Default March
  const [salesYearFilter, setSalesYearFilter] = useState<number>(2026); // Default 2026

  // Customer Rankings Filters
  const [customerSortMode, setCustomerSortMode] = useState<'cash' | 'credit'>('cash');
  const [customerAreaFilter, setCustomerAreaFilter] = useState<string>('ALL');

  // Petty Cash Filters
  const [pettyTimeframe, setPettyTimeframe] = useState<'DAILY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [pettyExpenseType, setPettyExpenseType] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');

  // Paint Inventory Filters (Domestic vs Industrial & Subcategories)
  const [mainCategoryFilter, setMainCategoryFilter] = useState<'ALL' | 'Domestic' | 'Industrial'>('ALL');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('ALL');

  const fetchOverview = async () => {
    try {
      const res = await metricsApi.getExecutiveOverview();
      setData(res.executive);
    } catch (err) {
      console.error('Error loading executive metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  // Filtered & Ranked Sales Officers (7 Named Officers)
  const filteredSalesOfficers = useMemo(() => {
    if (!data?.salesOfficers) return [];
    let list = [...data.salesOfficers];

    if (salesYearFilter !== 0) {
      list = list.filter((s) => s.year === salesYearFilter);
    }
    if (salesMonthFilter !== 0) {
      list = list.filter((s) => s.month === salesMonthFilter);
    }

    list.sort((a, b) => {
      if (salesSortMode === 'sales') {
        return b.salesActual - a.salesActual;
      } else {
        return b.collectionActual - a.collectionActual;
      }
    });

    return list;
  }, [data?.salesOfficers, salesSortMode, salesMonthFilter, salesYearFilter]);

  // Filtered & Ranked Customers
  const filteredCustomers = useMemo(() => {
    if (!data?.customerRankings) return [];
    let list = [...data.customerRankings];

    if (customerAreaFilter !== 'ALL') {
      list = list.filter((c) => c.area.toLowerCase().includes(customerAreaFilter.toLowerCase()));
    }

    list.sort((a, b) => {
      if (customerSortMode === 'cash') {
        return b.cashPayments - a.cashPayments;
      } else {
        return b.creditsTaken - a.creditsTaken;
      }
    });

    return list;
  }, [data?.customerRankings, customerSortMode, customerAreaFilter]);

  // Filtered Petty Cash Records
  const filteredPettyCash = useMemo(() => {
    if (!data?.pettyCashSummary?.allRecords) return [];
    let records = [...data.pettyCashSummary.allRecords];
    const now = new Date();

    if (pettyTimeframe === 'DAILY') {
      const threshold = now.getTime() - 86400000 * 2;
      records = records.filter((r) => new Date(r.date).getTime() >= threshold);
    } else if (pettyTimeframe === 'MONTHLY') {
      const threshold = now.getTime() - 86400000 * 35;
      records = records.filter((r) => new Date(r.date).getTime() >= threshold);
    } else if (pettyTimeframe === 'YEARLY') {
      records = records.filter((r) => new Date(r.date).getFullYear() >= 2025);
    }

    if (pettyExpenseType === 'HIGH') {
      records = records.filter((r) => r.amount >= 15000).sort((a, b) => b.amount - a.amount);
    } else if (pettyExpenseType === 'LOW') {
      records = records.filter((r) => r.amount < 10000).sort((a, b) => a.amount - b.amount);
    } else {
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return records;
  }, [data?.pettyCashSummary?.allRecords, pettyTimeframe, pettyExpenseType]);

  // Filtered Water-Base Paint Inventory (Domestic & Industrial)
  const filteredInventory = useMemo(() => {
    if (!data?.stockInventory?.products) return [];
    let list = [...data.stockInventory.products];

    if (mainCategoryFilter !== 'ALL') {
      list = list.filter((p) => p.mainCategory === mainCategoryFilter);
    }

    if (subCategoryFilter !== 'ALL') {
      list = list.filter((p) => p.subCategory === subCategoryFilter);
    }

    return list;
  }, [data?.stockInventory?.products, mainCategoryFilter, subCategoryFilter]);

  // Domestic vs Industrial Stock Aggregates
  const domesticStockCount = useMemo(() => {
    if (!data?.stockInventory?.products) return 0;
    return data.stockInventory.products
      .filter((p) => p.mainCategory === 'Domestic')
      .reduce((acc, p) => acc + p.warehouseStock + p.factoryStock, 0);
  }, [data?.stockInventory?.products]);

  const industrialStockCount = useMemo(() => {
    if (!data?.stockInventory?.products) return 0;
    return data.stockInventory.products
      .filter((p) => p.mainCategory === 'Industrial')
      .reduce((acc, p) => acc + p.warehouseStock + p.factoryStock, 0);
  }, [data?.stockInventory?.products]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-jade-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Compiling Chamikara De Silva's Executive Suite...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Failed to load executive overview data.
      </div>
    );
  }

  const { kpis, financialTrends, operationsMetrics, salesMetrics, recentFiles, recentTransactions, stockInventory } = data;

  const combinedDeptMetrics = [
    ...operationsMetrics.map((m) => ({ name: m.title, current: m.currentValue, target: m.targetValue, dept: 'Ops' })),
    ...salesMetrics.map((m) => ({ name: m.title, current: m.currentValue, target: m.targetValue, dept: 'Sales' })),
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="liquid-glass-pill px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Droplet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Water-Base Paint Manufacturing</span>
            </span>
            <span className="text-xs font-medium text-slate-400">| Managing Director: Chamikara De Silva</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Corporate Directorate & Plant Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time tracking of Domestic (Woodshield, Masoguard, Decoratives, Eco Cleaners) & Industrial (Metashield, Tyreshield) production and sales officers
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="liquid-glass-card flex items-center gap-2 self-start rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-jade-600 dark:text-jade-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* 4 Top KPI Cards in LKR */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="liquid-glass-card relative overflow-hidden rounded-3xl p-5 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Paint Revenue (LKR)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {formatLKR(kpis.totalRevenue)}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="h-4 w-4" />
              <span>+18.4%</span>
              <span className="text-slate-400 font-normal">vs Q4 2025</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
        </div>

        {/* Operating Burn */}
        <div className="liquid-glass-card relative overflow-hidden rounded-3xl p-5 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Plant & Operations (LKR)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {formatLKR(kpis.totalExpense)}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <ArrowDownRight className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">-4.2%</span>
              <span className="font-normal text-slate-400">raw material cost control</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-rose-500/10 blur-2xl group-hover:bg-rose-500/20 transition-all duration-500" />
        </div>

        {/* Net Profit & Margin */}
        <div className="liquid-glass-card relative overflow-hidden rounded-3xl p-5 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Profit Margin
            </span>
            <span className="liquid-glass-pill rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              {kpis.profitMargin}% Margin
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
              {formatLKR(kpis.netProfit)}
            </h3>
            <p className="mt-2 text-xs text-slate-400 font-medium">Sri Lanka domestic & industrial surplus</p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-jade-500/15 blur-2xl group-hover:bg-jade-500/25 transition-all duration-500" />
        </div>

        {/* Dual-Pool Stock Inventory Indicator */}
        <div className="liquid-glass-card relative overflow-hidden rounded-3xl p-5 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Paint Inventory
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 shadow-inner">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stockInventory?.totalStock?.toLocaleString() || 13425} Litres
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Domestic: {domesticStockCount.toLocaleString()}</span>
              <span>Industrial: {industrialStockCount.toLocaleString()}</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE NAVIGATION TABS BAR                                             */}
      {/* ========================================================================= */}
      <div className="liquid-glass rounded-3xl p-2 flex flex-wrap items-center gap-2 shadow-xl border border-white/20 dark:border-white/10">
        <button
          onClick={() => setActiveTab('sales-ranking')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === 'sales-ranking'
              ? 'liquid-glass-btn-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>Sales Officers Ranking</span>
          <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">
            {filteredSalesOfficers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('customer-ranking')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === 'customer-ranking'
              ? 'liquid-glass-btn-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Building2 className="h-4 w-4 text-blue-400" />
          <span>Customer Ranking</span>
          <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">
            {filteredCustomers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('petty-cash')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === 'petty-cash'
              ? 'liquid-glass-btn-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Receipt className="h-4 w-4 text-teal-400" />
          <span>Petty Cash Report</span>
          <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">
            {filteredPettyCash.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('stock-balance')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === 'stock-balance'
              ? 'liquid-glass-btn-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Package className="h-4 w-4 text-indigo-400" />
          <span>Stock Balance (Domestic & Industrial)</span>
          <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">
            {filteredInventory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activeTab === 'overview'
              ? 'liquid-glass-btn-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>Cash Flow & Drive Files</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SALES OFFICERS RANKING TAB (7 NAMED OFFICERS)                      */}
      {/* ========================================================================= */}
      {activeTab === 'sales-ranking' && (
        <div className="liquid-glass rounded-3xl p-6 relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Sales Officers Leaderboard (7 Field Officers)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Podium ranks for Top 3 (🥇 Gold, 🥈 Silver, 🥉 Bronze) featuring Nishan, Yasas, Nimesh, Nilupul, Sanjeewa, Shehan, and Imesh
              </p>
            </div>

            {/* Interactive Filters: Sort By, Month, Year */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sort Mode Toggle */}
              <div className="flex rounded-xl bg-slate-200/60 dark:bg-charcoal-800/60 p-1 backdrop-blur-md">
                <button
                  onClick={() => setSalesSortMode('sales')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    salesSortMode === 'sales'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Sort by Sales
                </button>
                <button
                  onClick={() => setSalesSortMode('collections')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    salesSortMode === 'collections'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Sort by Collections
                </button>
              </div>

              {/* Month Filter */}
              <select
                value={salesMonthFilter}
                onChange={(e) => setSalesMonthFilter(parseInt(e.target.value))}
                className="liquid-glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value={0}>All Months</option>
                <option value={3}>March (Current)</option>
                <option value={2}>February (Past)</option>
                <option value={1}>January (Past)</option>
                <option value={12}>December (Past)</option>
              </select>

              {/* Year Filter */}
              <select
                value={salesYearFilter}
                onChange={(e) => setSalesYearFilter(parseInt(e.target.value))}
                className="liquid-glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value={0}>All Years</option>
                <option value={2026}>2026 Fiscal</option>
                <option value={2025}>2025 Historical</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Sales Officer</th>
                  <th className="pb-3">Commercial Territory</th>
                  <th className="pb-3 text-right">Paint Sales (LKR)</th>
                  <th className="pb-3 text-right">Collections (LKR)</th>
                  <th className="pb-3 text-center">Sales Target %</th>
                  <th className="pb-3 text-center">Collection Target %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/5">
                {filteredSalesOfficers.map((officer, index) => {
                  const rank = index + 1;
                  const salesTargetPct = officer.salesTargetPct ?? Math.round((officer.salesActual / officer.salesTarget) * 100);
                  const collectionTargetPct = officer.collectionTargetPct ?? Math.round((officer.collectionActual / officer.collectionTarget) * 100);

                  return (
                    <tr
                      key={officer.id || index}
                      className={`transition hover:bg-white/40 dark:hover:bg-white/5 ${
                        rank === 1 ? 'bg-amber-500/[0.06] dark:bg-amber-500/[0.08]' : ''
                      }`}
                    >
                      {/* Podium Rank Badges */}
                      <td className="py-3.5 pl-2">
                        {rank === 1 ? (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-black text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.45)] ring-1 ring-amber-300">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>1st GOLD</span>
                          </div>
                        ) : rank === 2 ? (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 px-3 py-1 text-xs font-extrabold text-slate-900 shadow-[0_0_10px_rgba(203,213,225,0.4)] ring-1 ring-slate-300">
                            <Medal className="h-3.5 w-3.5" />
                            <span>2nd SILVER</span>
                          </div>
                        ) : rank === 3 ? (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 px-3 py-1 text-xs font-extrabold text-amber-100 shadow-[0_0_10px_rgba(180,83,9,0.3)] ring-1 ring-amber-500/40">
                            <Award className="h-3.5 w-3.5" />
                            <span>3rd BRONZE</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center h-7 w-7 rounded-xl bg-slate-200/60 dark:bg-charcoal-700/60 font-bold text-slate-600 dark:text-slate-300">
                            #{rank}
                          </div>
                        )}
                      </td>

                      {/* Profile Photo & Name */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={officer.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt={officer.name}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{officer.name}</p>
                            <p className="text-[10px] text-slate-400">Territory Officer: SO-{100 + index}</p>
                          </div>
                        </div>
                      </td>

                      {/* Area */}
                      <td className="py-3.5">
                        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {officer.area}
                        </span>
                      </td>

                      {/* Sales (LKR) */}
                      <td className="py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatLKR(officer.salesActual)}
                      </td>

                      {/* Collections (LKR) */}
                      <td className="py-3.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatLKR(officer.collectionActual)}
                      </td>

                      {/* % of Sales Target */}
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            salesTargetPct >= 100
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {salesTargetPct}%
                        </span>
                      </td>

                      {/* % of Collection Target */}
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            collectionTargetPct >= 100
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {collectionTargetPct}%
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

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER RANKING TAB (PAINT DEALERS & CONTRACTORS)                 */}
      {/* ========================================================================= */}
      {activeTab === 'customer-ranking' && (
        <div className="liquid-glass rounded-3xl p-6 relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Paint Customer Rankings & Credit Exposure
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hardware supercenters, timber coating workshops, and contractors mapped to the 7 field officers
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sort Toggle */}
              <div className="flex rounded-xl bg-slate-200/60 dark:bg-charcoal-800/60 p-1 backdrop-blur-md">
                <button
                  onClick={() => setCustomerSortMode('cash')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    customerSortMode === 'cash'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Sort by Cash Payments
                </button>
                <button
                  onClick={() => setCustomerSortMode('credit')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    customerSortMode === 'credit'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Sort by Credits Taken
                </button>
              </div>

              {/* Area Filter */}
              <select
                value={customerAreaFilter}
                onChange={(e) => setCustomerAreaFilter(e.target.value)}
                className="liquid-glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Territories</option>
                <option value="Colombo">Colombo Central</option>
                <option value="Kandy">Kandy Metro</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Galle">Galle</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Negombo">Negombo</option>
                <option value="Jaffna">Jaffna</option>
              </select>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pl-2">Rank #</th>
                  <th className="pb-3">Paint Dealer / Contractor Client</th>
                  <th className="pb-3">Business Type</th>
                  <th className="pb-3 text-right">Cash Payments (LKR)</th>
                  <th className="pb-3 text-right">Credits Taken (LKR)</th>
                  <th className="pb-3">Assigned Sales Officer</th>
                  <th className="pb-3">Territory Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/5">
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id || index} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 pl-2 font-bold text-slate-600 dark:text-slate-300">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-charcoal-700 text-xs font-bold">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      {customer.customerName}
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-md bg-slate-200/60 dark:bg-charcoal-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {customer.businessType || 'Paint Retail'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatLKR(customer.cashPayments)}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-rose-500 dark:text-rose-400">
                      {formatLKR(customer.creditsTaken)}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {customer.assignedOfficer}
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">
                      {customer.area}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PETTY CASH REPORT TAB                                              */}
      {/* ========================================================================= */}
      {activeTab === 'petty-cash' && (
        <div className="liquid-glass rounded-3xl p-6 relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-500" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Paint Factory Petty Cash Flow & Expense Spectrum
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Filter petty cash by Daily, Monthly, or Yearly windows, and compare Highest Factory Expenses vs Minimal Micro-Costs
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Timeframe Selector */}
              <div className="flex rounded-xl bg-slate-200/60 dark:bg-charcoal-800/60 p-1 backdrop-blur-md">
                <button
                  onClick={() => setPettyTimeframe('DAILY')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    pettyTimeframe === 'DAILY'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setPettyTimeframe('MONTHLY')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    pettyTimeframe === 'MONTHLY'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPettyTimeframe('YEARLY')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    pettyTimeframe === 'YEARLY'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Yearly
                </button>
              </div>

              {/* High vs Minimal Filter */}
              <div className="flex rounded-xl bg-slate-200/60 dark:bg-charcoal-800/60 p-1 backdrop-blur-md">
                <button
                  onClick={() => setPettyExpenseType('ALL')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    pettyExpenseType === 'ALL'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPettyExpenseType('HIGH')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    pettyExpenseType === 'HIGH'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                  title="What are the expenses more"
                >
                  Expenses More (Top)
                </button>
                <button
                  onClick={() => setPettyExpenseType('LOW')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    pettyExpenseType === 'LOW'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                  title="What are the minimals"
                >
                  Minimals (Low)
                </button>
              </div>
            </div>
          </div>

          {/* Petty Cash Quick Stat Pills */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5">
            <div className="rounded-2xl border border-white/60 bg-white/40 p-4 dark:border-white/5 dark:bg-charcoal-800/40 backdrop-blur-md">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered Period Total</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatLKR(filteredPettyCash.reduce((acc, c) => acc + c.amount, 0))}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/40 p-4 dark:border-white/5 dark:bg-charcoal-800/40 backdrop-blur-md">
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Peak Expense Voucher</span>
              <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {filteredPettyCash.length > 0
                  ? formatLKR(Math.max(...filteredPettyCash.map((v) => v.amount)))
                  : 'Rs. 0'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/40 p-4 dark:border-white/5 dark:bg-charcoal-800/40 backdrop-blur-md">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Lowest Micro-Expense</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {filteredPettyCash.length > 0
                  ? formatLKR(Math.min(...filteredPettyCash.map((v) => v.amount)))
                  : 'Rs. 0'}
              </p>
            </div>
          </div>

          {/* Petty Cash Vouchers List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pl-2">Voucher #</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Amount (LKR)</th>
                  <th className="pb-3">Disbursed To</th>
                  <th className="pb-3">Approved By</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/5">
                {filteredPettyCash.map((voucher, idx) => (
                  <tr key={voucher.id || idx} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                    <td className="py-3 pl-2 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {voucher.voucherNo}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-[280px] truncate">
                      {voucher.description}
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                        {voucher.category}
                      </span>
                    </td>
                    <td
                      className={`py-3 text-right font-mono font-bold ${
                        voucher.amount >= 15000
                          ? 'text-rose-600 dark:text-rose-400'
                          : voucher.amount <= 2500
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatLKR(voucher.amount)}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{voucher.spentBy}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{voucher.approvedBy}</td>
                    <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(voucher.date).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STOCK BALANCE TAB (DOMESTIC VS INDUSTRIAL PAINT LINEUP)            */}
      {/* ========================================================================= */}
      {activeTab === 'stock-balance' && (
        <div className="liquid-glass rounded-3xl p-6 relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Paint Product Stock Balance (Domestic & Industrial)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Physical paint finished goods partitioned between Central Warehouse (Colombo) and Factory Plant (Gampaha)
              </p>
            </div>

            {/* Main Category & Subcategory Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Main Category (Domestic vs Industrial) Toggle */}
              <div className="flex rounded-xl bg-slate-200/60 dark:bg-charcoal-800/60 p-1 backdrop-blur-md">
                <button
                  onClick={() => {
                    setMainCategoryFilter('ALL');
                    setSubCategoryFilter('ALL');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    mainCategoryFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  All Paints
                </button>
                <button
                  onClick={() => {
                    setMainCategoryFilter('Domestic');
                    setSubCategoryFilter('ALL');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    mainCategoryFilter === 'Domestic'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Domestic
                </button>
                <button
                  onClick={() => {
                    setMainCategoryFilter('Industrial');
                    setSubCategoryFilter('ALL');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    mainCategoryFilter === 'Industrial'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Industrial
                </button>
              </div>

              {/* Sub-Category Filter */}
              <select
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                className="liquid-glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Sub-Categories</option>
                {mainCategoryFilter !== 'Industrial' && (
                  <>
                    <option value="Woodshield">Woodshield (Wood Coatings)</option>
                    <option value="Masoguard">Masoguard (Masonry Coatings)</option>
                    <option value="Decoratives">Decoratives (Easy Floor / Roof & Wall)</option>
                    <option value="Eco Cleaners">Eco Cleaners (Universal Cleaner)</option>
                  </>
                )}
                {mainCategoryFilter !== 'Domestic' && (
                  <>
                    <option value="Metashield">Metashield (Metal Primer & Top Coat)</option>
                    <option value="Tyreshield">Tyreshield (Rubber Protective)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Dual-Pool Stock Highlight Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
            {/* Warehouse Stock Card */}
            <div className="liquid-glass-card rounded-2xl p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Warehouse className="h-3.5 w-3.5 text-blue-500" />
                  Warehouse Stock
                </span>
                <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">
                  Ready Dispatch
                </span>
              </div>
              <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {stockInventory?.totalWarehouseStock?.toLocaleString() || 4635} L
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Central Depot (Colombo)</p>
            </div>

            {/* Factory Stock Card */}
            <div className="liquid-glass-card rounded-2xl p-4 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Factory className="h-3.5 w-3.5 text-amber-500" />
                  Factory Stock
                </span>
                <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                  Plant Floor
                </span>
              </div>
              <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {stockInventory?.totalFactoryStock?.toLocaleString() || 10320} L
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Manufacturing Floor (Gampaha)</p>
            </div>

            {/* Domestic Lineup Total */}
            <div className="liquid-glass-card rounded-2xl p-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Paintbrush className="h-3.5 w-3.5 text-emerald-500" />
                  Domestic Lineup
                </span>
                <span className="liquid-glass-pill rounded-full px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  4 Brands
                </span>
              </div>
              <h3 className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                {domesticStockCount.toLocaleString()} L
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Woodshield, Masoguard, Dec., Eco</p>
            </div>

            {/* Industrial Lineup Total */}
            <div className="liquid-glass-card rounded-2xl p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-purple-500" />
                  Industrial Lineup
                </span>
                <span className="liquid-glass-pill rounded-full px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300">
                  2 Brands
                </span>
              </div>
              <h3 className="mt-2 text-xl font-black text-purple-600 dark:text-purple-400">
                {industrialStockCount.toLocaleString()} L
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Metashield & Tyreshield</p>
            </div>
          </div>

          {/* Product Catalog Grid / Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pl-2">SKU</th>
                  <th className="pb-3">Paint Product Name</th>
                  <th className="pb-3">Lineup Category</th>
                  <th className="pb-3 text-right">Warehouse Qty</th>
                  <th className="pb-3 text-right">Factory Qty</th>
                  <th className="pb-3 text-right">Total In Stock</th>
                  <th className="pb-3 text-right">Unit Price (LKR)</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/5">
                {filteredInventory.map((product) => {
                  const total = product.totalStock ?? (product.warehouseStock + product.factoryStock);
                  const isLow = total <= product.minThreshold;

                  // Brand-specific color badge
                  const subCat = product.subCategory || 'Other';
                  const brandBadgeClass =
                    subCat === 'Woodshield'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : subCat === 'Masoguard'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : subCat === 'Decoratives'
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                      : subCat === 'Eco Cleaners'
                      ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
                      : subCat === 'Metashield'
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                      : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';

                  return (
                    <tr key={product.id || product.sku} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                      <td className="py-3.5 pl-2 font-mono font-bold text-slate-500 dark:text-slate-400">
                        {product.sku}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${brandBadgeClass}`}>
                            {product.subCategory}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({product.mainCategory})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {product.warehouseStock.toLocaleString()} {product.unit}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {product.factoryStock.toLocaleString()} {product.unit}
                      </td>
                      <td className="py-3.5 text-right font-mono font-black text-slate-900 dark:text-white">
                        {total.toLocaleString()} {product.unit}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatLKR(product.unitPriceLKR)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            isLow
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isLow ? 'REORDER LOW' : 'IN STOCK'}
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

      {/* ========================================================================= */}
      {/* TAB 5: CASH FLOW & AUDIT OVERVIEW                                         */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Financial Flow Area Chart */}
            <div className="liquid-glass rounded-3xl p-6 lg:col-span-2 relative overflow-hidden">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Cash Flow & Net Margin Trend (LKR)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Monthly revenue inflow vs operational expenditure
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-jade-500 shadow-sm" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Revenue</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-400 shadow-sm" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Expenses</span>
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `Rs.${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(val: any) => [formatLKR(Number(val)), '']}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#64748b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                      name="Expense"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Operational & Sales Fulfillment */}
            <div className="liquid-glass rounded-3xl p-6">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Target Fulfillment
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Plant quality & sales performance metrics
                </p>
              </div>

              <div className="space-y-3.5">
                {combinedDeptMetrics.slice(0, 4).map((metric, idx) => {
                  const pct = Math.min(Math.round((metric.current / metric.target) * 100), 100);
                  return (
                    <div key={idx} className="rounded-2xl border border-white/40 bg-white/40 p-3.5 dark:border-white/5 dark:bg-white/[0.03] backdrop-blur-md shadow-sm">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                          {metric.name}
                        </span>
                        <span className="font-extrabold text-jade-600 dark:text-jade-400">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200/60 dark:bg-charcoal-700/60 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Current: {metric.current.toLocaleString()}</span>
                        <span>Target: {metric.target.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Split Section: Google Drive Files & Read-Only Financial Reports */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Executive Google Drive File Explorer */}
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderSync className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Paint Manufacturing Cloud Repository
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Quality SOPs, Metashield TDS & Woodshield brochures stored in Google Drive
                  </p>
                </div>
                <a
                  href="/drive"
                  className="text-xs font-semibold text-jade-600 hover:text-jade-700 dark:text-jade-400 flex items-center gap-1 hover:underline"
                >
                  Browse All
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="liquid-glass-card flex items-center justify-between rounded-2xl p-3.5"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {file.originalName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="rounded-md bg-slate-200/60 dark:bg-white/10 px-1.5 py-0.5 text-slate-600 dark:text-slate-300 font-medium">
                            {file.driveFolder}
                          </span>
                          <span>By {file.uploader?.name || 'Staff'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={file.driveWebView}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl p-2 text-slate-400 hover:bg-white/60 hover:text-jade-600 dark:hover:bg-white/10 transition"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a
                        href={`/api/drive/download/${file.driveFileId}`}
                        className="rounded-xl p-2 text-slate-400 hover:bg-white/60 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white transition"
                        title="Download Direct"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Financial Ledger (Read-Only) in LKR */}
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-600" />
                    Latest Paint Transactions Ledger (LKR)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dispatches, factory leases, and distributor consignments
                  </p>
                </div>
                <a
                  href="/dashboard/finance"
                  className="text-xs font-semibold text-jade-600 hover:text-jade-700 dark:text-jade-400 flex items-center gap-1 hover:underline"
                >
                  View Ledger
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="liquid-glass-card flex items-center justify-between rounded-2xl p-3.5"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{new Date(tx.date).toLocaleDateString('en-GB')}</span>
                        <span>•</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{tx.category}</span>
                        {tx.referenceNo && (
                          <span className="font-mono text-[10px] text-slate-400">({tx.referenceNo})</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold ${
                          tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}{formatLKR(tx.amount)}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
