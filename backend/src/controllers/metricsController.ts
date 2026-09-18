import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import prisma from '../prisma.js';

export const getExecutiveOverview = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      transactions,
      fileCount,
      userCount,
      metrics,
      salesOfficers,
      customerRankings,
      pettyCashRecords,
      inventoryProducts,
    ] = await Promise.all([
      prisma.financialRecord.findMany({ orderBy: { date: 'asc' } }),
      prisma.fileRecord.count(),
      prisma.user.count(),
      prisma.operationalMetric.findMany({ orderBy: { dateRecorded: 'desc' } }),
      prisma.salesOfficerPerformance.findMany({ orderBy: { salesActual: 'desc' } }),
      prisma.customerRanking.findMany({ orderBy: { cashPayments: 'desc' } }),
      prisma.pettyCashRecord.findMany({ orderBy: { date: 'desc' } }),
      prisma.inventoryProduct.findMany({ orderBy: { sku: 'asc' } }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyMap: Record<string, { month: string; revenue: number; expense: number; profit: number }> = {};

    for (const t of transactions) {
      const monthKey = new Date(t.date).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, revenue: 0, expense: 0, profit: 0 };
      }
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
        monthlyMap[monthKey].revenue += t.amount;
      } else {
        totalExpense += t.amount;
        monthlyMap[monthKey].expense += t.amount;
      }
      monthlyMap[monthKey].profit = monthlyMap[monthKey].revenue - monthlyMap[monthKey].expense;
    }

    const recentFiles = await prisma.fileRecord.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
      },
    });

    const recentTransactions = await prisma.financialRecord.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true } },
      },
    });

    const operationsMetrics = metrics.filter((m) => m.department === 'Operations');
    const salesMetrics = metrics.filter((m) => m.department === 'TechSales');

    // Stock Inventory Aggregates
    const totalWarehouseStock = inventoryProducts.reduce((acc, p) => acc + p.warehouseStock, 0);
    const totalFactoryStock = inventoryProducts.reduce((acc, p) => acc + p.factoryStock, 0);
    const totalStock = totalWarehouseStock + totalFactoryStock;

    const productsWithTotals = inventoryProducts.map((p) => {
      const combined = p.warehouseStock + p.factoryStock;
      return {
        ...p,
        totalStock: combined,
        status: combined <= p.minThreshold ? 'LOW_STOCK' : 'IN_STOCK',
      };
    });

    // Petty Cash Aggregates
    const totalPettyCashSpent = pettyCashRecords.reduce((acc, p) => acc + p.amount, 0);
    const topExpenses = [...pettyCashRecords].sort((a, b) => b.amount - a.amount);
    const minimalExpenses = [...pettyCashRecords].sort((a, b) => a.amount - b.amount);

    // Sales Officers with Precomputed Target Percentages
    const enrichedSalesOfficers = salesOfficers.map((s) => ({
      ...s,
      salesTargetPct: s.salesTarget > 0 ? Math.round((s.salesActual / s.salesTarget) * 100) : 0,
      collectionTargetPct: s.collectionTarget > 0 ? Math.round((s.collectionActual / s.collectionTarget) * 100) : 0,
    }));

    res.json({
      executive: {
        kpis: {
          totalRevenue: totalIncome,
          totalExpense: totalExpense,
          netProfit: totalIncome - totalExpense,
          profitMargin: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
          totalFilesTracked: fileCount,
          activePersonnel: userCount,
        },
        financialTrends: Object.values(monthlyMap),
        operationsMetrics,
        salesMetrics,
        recentFiles,
        recentTransactions,
        salesOfficers: enrichedSalesOfficers,
        customerRankings,
        pettyCashSummary: {
          totalSpent: totalPettyCashSpent,
          recordCount: pettyCashRecords.length,
          allRecords: pettyCashRecords,
          topExpenses,
          minimalExpenses,
        },
        stockInventory: {
          totalWarehouseStock,
          totalFactoryStock,
          totalStock,
          totalProducts: inventoryProducts.length,
          products: productsWithTotals,
        },
      },
    });
  } catch (error: any) {
    console.error('Executive overview error:', error);
    res.status(500).json({ message: 'Failed to aggregate executive overview metrics' });
  }
};

export const getDepartmentMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.params; // 'Operations' or 'TechSales'

    const metrics = await prisma.operationalMetric.findMany({
      where: department ? { department } : {},
      orderBy: { dateRecorded: 'desc' },
    });

    res.json({ metrics });
  } catch (error: any) {
    console.error('Department metrics error:', error);
    res.status(500).json({ message: 'Error retrieving department metrics' });
  }
};

export const updateMetric = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { currentValue, status } = req.body;

    const updated = await prisma.operationalMetric.update({
      where: { id },
      data: {
        ...(currentValue !== undefined && { currentValue: parseFloat(currentValue) }),
        ...(status && { status }),
      },
    });

    res.json({ message: 'Metric updated', metric: updated });
  } catch (error: any) {
    console.error('Update metric error:', error);
    res.status(500).json({ message: 'Failed to update metric' });
  }
};
