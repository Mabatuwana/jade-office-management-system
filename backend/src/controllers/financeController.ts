import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import prisma from '../prisma.js';

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, category, type, amount, currency = 'USD', date, referenceNo, notes, driveFileId } = req.body;

    if (!title || !category || !type || amount === undefined || !date) {
      res.status(400).json({ message: 'Missing required financial transaction fields' });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    const transaction = await prisma.financialRecord.create({
      data: {
        title,
        category,
        type, // INCOME or EXPENSE
        amount: parsedAmount,
        currency,
        date: new Date(date),
        referenceNo: referenceNo || null,
        notes: notes || null,
        creatorId: req.user.id,
        driveFileId: driveFileId || null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Financial transaction recorded successfully',
      transaction,
    });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to record financial entry', error: error.message });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, startDate, endDate, search, limit = 50, page = 1 } = req.query;

    const whereClause: any = {};

    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { referenceNo: { contains: search as string } },
        { notes: { contains: search as string } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, totalCount] = await Promise.all([
      prisma.financialRecord.findMany({
        where: whereClause,
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { date: 'desc' },
        take: Number(limit),
        skip,
      }),
      prisma.financialRecord.count({ where: whereClause }),
    ]);

    res.json({
      transactions,
      pagination: {
        total: totalCount,
        page: Number(page),
        pages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Error retrieving financial records' });
  }
};

export const getFinanceSummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await prisma.financialRecord.findMany({
      orderBy: { date: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap: Record<string, number> = {};
    const monthlyMap: Record<string, { month: string; income: number; expense: number; net: number }> = {};

    for (const r of records) {
      const monthKey = new Date(r.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0, net: 0 };
      }

      if (r.type === 'INCOME') {
        totalIncome += r.amount;
        monthlyMap[monthKey].income += r.amount;
      } else {
        totalExpense += r.amount;
        monthlyMap[monthKey].expense += r.amount;
        categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
      }
      monthlyMap[monthKey].net = monthlyMap[monthKey].income - monthlyMap[monthKey].expense;
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));

    const monthlyTrends = Object.values(monthlyMap);

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        recordCount: records.length,
        categoryBreakdown,
        monthlyTrends,
      },
    });
  } catch (error: any) {
    console.error('Finance summary error:', error);
    res.status(500).json({ message: 'Error calculating financial summary' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Only Finance Assistant or MD can delete transactions
    if (req.user.role !== 'FINANCE_ASSISTANT' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({ message: 'Insufficient privileges' });
      return;
    }

    await prisma.financialRecord.delete({ where: { id } });

    res.json({ message: 'Transaction removed successfully' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// =========================================================================
// FINANCE ASSISTANT 1: SHANI MINOSHIKA (SALES, COLLECTIONS & REGISTRATION)
// =========================================================================

// Exclusive Authority: Register New Sales Officer
export const registerSalesOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // STRICT AUTHORITY CHECK: Only Shani Minoshika (finance1) or MD
    if (req.user.email !== 'finance1@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 1 (Shani Minoshika) is authorized to register sales officers to the system.',
      });
      return;
    }

    const { name, area, avatarUrl, salesTarget, collectionTarget, month, year } = req.body;

    if (!name || !area || salesTarget === undefined || collectionTarget === undefined) {
      res.status(400).json({ message: 'Missing required sales officer fields (name, area, salesTarget, collectionTarget)' });
      return;
    }

    const currentYear = year ? Number(year) : new Date().getFullYear();
    const currentMonth = month ? Number(month) : (new Date().getMonth() + 1);

    const defaultAvatar = avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    // Create officer performance record in SQLite in real time
    const newOfficer = await prisma.salesOfficerPerformance.create({
      data: {
        name,
        area,
        avatarUrl: defaultAvatar,
        salesTarget: Number(salesTarget),
        salesActual: 0,
        collectionTarget: Number(collectionTarget),
        collectionActual: 0,
        month: currentMonth,
        year: currentYear,
      },
    });

    res.status(201).json({
      message: `Sales Officer ${name} successfully registered by Shani Minoshika.`,
      officer: newOfficer,
    });
  } catch (error: any) {
    console.error('Register sales officer error:', error);
    res.status(500).json({ message: 'Failed to register sales officer', error: error.message });
  }
};

// Input / Record Sales & Collection Data
export const recordSalesPerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // STRICT AUTHORITY CHECK: Only Shani Minoshika (finance1) or MD
    if (req.user.email !== 'finance1@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 1 (Shani Minoshika) is authorized to record sales and collection figures.',
      });
      return;
    }

    const { id, name, area, salesTarget, salesActual, collectionTarget, collectionActual, month, year } = req.body;

    if (!name || salesActual === undefined || collectionActual === undefined) {
      res.status(400).json({ message: 'Missing required performance fields' });
      return;
    }

    const currentYear = year ? Number(year) : new Date().getFullYear();
    const currentMonth = month ? Number(month) : (new Date().getMonth() + 1);

    let updatedRecord;

    if (id) {
      updatedRecord = await prisma.salesOfficerPerformance.update({
        where: { id },
        data: {
          salesActual: Number(salesActual),
          collectionActual: Number(collectionActual),
          ...(salesTarget !== undefined ? { salesTarget: Number(salesTarget) } : {}),
          ...(collectionTarget !== undefined ? { collectionTarget: Number(collectionTarget) } : {}),
          ...(area ? { area } : {}),
        },
      });
    } else {
      // Find existing officer by name and month/year or create new record
      const existing = await prisma.salesOfficerPerformance.findFirst({
        where: { name, month: currentMonth, year: currentYear },
      });

      if (existing) {
        updatedRecord = await prisma.salesOfficerPerformance.update({
          where: { id: existing.id },
          data: {
            salesActual: Number(salesActual),
            collectionActual: Number(collectionActual),
            ...(salesTarget !== undefined ? { salesTarget: Number(salesTarget) } : {}),
            ...(collectionTarget !== undefined ? { collectionTarget: Number(collectionTarget) } : {}),
            ...(area ? { area } : {}),
          },
        });
      } else {
        updatedRecord = await prisma.salesOfficerPerformance.create({
          data: {
            name,
            area: area || 'Colombo Central',
            salesTarget: Number(salesTarget || 12000000),
            salesActual: Number(salesActual),
            collectionTarget: Number(collectionTarget || 11000000),
            collectionActual: Number(collectionActual),
            month: currentMonth,
            year: currentYear,
          },
        });
      }
    }

    res.json({
      message: 'Sales & Collection performance updated in real time',
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error('Record sales performance error:', error);
    res.status(500).json({ message: 'Failed to record sales performance', error: error.message });
  }
};

// Export Sales & Collections Data as CSV
export const exportSalesPerformance = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await prisma.salesOfficerPerformance.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { salesActual: 'desc' }],
    });

    const csvRows = [
      ['Sales Officer', 'Territory', 'Year', 'Month', 'Sales Target (LKR)', 'Actual Sales (LKR)', 'Sales %', 'Collection Target (LKR)', 'Actual Collections (LKR)', 'Collection %'].join(','),
      ...records.map((r) => {
        const salesPct = r.salesTarget > 0 ? Math.round((r.salesActual / r.salesTarget) * 100) : 0;
        const colPct = r.collectionTarget > 0 ? Math.round((r.collectionActual / r.collectionTarget) * 100) : 0;
        return [
          `"${r.name}"`,
          `"${r.area}"`,
          r.year,
          r.month,
          r.salesTarget,
          r.salesActual,
          `${salesPct}%`,
          r.collectionTarget,
          r.collectionActual,
          `${colPct}%`,
        ].join(',');
      }),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="JADE_Paint_Sales_Collections_Report.csv"');
    res.send(csvRows.join('\n'));
  } catch (error: any) {
    console.error('Export sales error:', error);
    res.status(500).json({ message: 'Failed to export sales data' });
  }
};

// =========================================================================
// FINANCE ASSISTANT 2: RASHINI FERNANDO (PETTY CASH EXCLUSIVE AUTHORITY)
// =========================================================================

export const recordPettyCash = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // STRICT AUTHORITY CHECK: Only Rashini Fernando (finance2) or MD
    if (req.user.email !== 'finance2@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 2 (Rashini Fernando) is authorized to handle and record petty cash vouchers.',
      });
      return;
    }

    const { voucherNo, description, category, amount, date, spentBy, approvedBy } = req.body;

    if (!voucherNo || !description || !category || amount === undefined) {
      res.status(400).json({ message: 'Missing required petty cash voucher fields' });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    const record = await prisma.pettyCashRecord.create({
      data: {
        voucherNo,
        description,
        category,
        amount: parsedAmount,
        date: date ? new Date(date) : new Date(),
        spentBy: spentBy || 'Factory Personnel',
        approvedBy: approvedBy || 'Rashini Fernando',
      },
    });

    res.status(201).json({
      message: 'Petty cash voucher recorded and saved to database in real time',
      record,
    });
  } catch (error: any) {
    console.error('Record petty cash error:', error);
    res.status(500).json({ message: 'Failed to record petty cash entry', error: error.message });
  }
};

export const deletePettyCashRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Only Rashini Fernando or MD
    if (req.user.email !== 'finance2@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 2 (Rashini Fernando) is authorized to remove petty cash records.',
      });
      return;
    }

    const { id } = req.params;
    await prisma.pettyCashRecord.delete({ where: { id } });
    res.json({ message: 'Petty cash voucher removed successfully' });
  } catch (error: any) {
    console.error('Delete petty cash error:', error);
    res.status(500).json({ message: 'Failed to remove petty cash record' });
  }
};

// =========================================================================
// FINANCE ASSISTANT 3: THIWARA DILMINI (CUSTOMER COLLECTIONS & CREDIT LIMITS)
// =========================================================================

export const recordCustomerCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // STRICT AUTHORITY CHECK: Only Thiwara Dilmini (finance3) or MD
    if (req.user.email !== 'finance3@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 3 (Thiwara Dilmini) is authorized to input collections and set customer credit limits.',
      });
      return;
    }

    const { id, customerName, businessType, assignedOfficer, area, cashPayments, creditsTaken, creditLimit, month, year } = req.body;

    if (!customerName) {
      res.status(400).json({ message: 'Customer name is required' });
      return;
    }

    let result;

    if (id) {
      result = await prisma.customerRanking.update({
        where: { id },
        data: {
          ...(cashPayments !== undefined ? { cashPayments: Number(cashPayments) } : {}),
          ...(creditsTaken !== undefined ? { creditsTaken: Number(creditsTaken) } : {}),
          ...(creditLimit !== undefined ? { creditLimit: Number(creditLimit) } : {}),
          ...(businessType ? { businessType } : {}),
          ...(assignedOfficer ? { assignedOfficer } : {}),
          ...(area ? { area } : {}),
        },
      });
    } else {
      const existing = await prisma.customerRanking.findFirst({
        where: { customerName },
      });

      if (existing) {
        result = await prisma.customerRanking.update({
          where: { id: existing.id },
          data: {
            ...(cashPayments !== undefined ? { cashPayments: Number(cashPayments) } : {}),
            ...(creditsTaken !== undefined ? { creditsTaken: Number(creditsTaken) } : {}),
            ...(creditLimit !== undefined ? { creditLimit: Number(creditLimit) } : {}),
            ...(businessType ? { businessType } : {}),
            ...(assignedOfficer ? { assignedOfficer } : {}),
            ...(area ? { area } : {}),
          },
        });
      } else {
        result = await prisma.customerRanking.create({
          data: {
            customerName,
            businessType: businessType || 'Paint Retail Hardware',
            assignedOfficer: assignedOfficer || 'Nishan Rajapaksha',
            area: area || 'Colombo Central',
            cashPayments: Number(cashPayments || 0),
            creditsTaken: Number(creditsTaken || 0),
            creditLimit: Number(creditLimit || 5000000),
            month: month ? Number(month) : 3,
            year: year ? Number(year) : 2026,
          },
        });
      }
    }

    res.json({
      message: 'Customer collection and credit limit updated in real time by Thiwara Dilmini',
      customer: result,
    });
  } catch (error: any) {
    console.error('Record customer credit error:', error);
    res.status(500).json({ message: 'Failed to update customer credit record', error: error.message });
  }
};

// =========================================================================
// FINANCE ASSISTANT 4: SHALKI SUBASHI (STOCK BALANCE & INVOICING)
// =========================================================================

export const adjustStockBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // STRICT AUTHORITY CHECK: Only Shalki Subashi (finance4) or MD
    if (req.user.email !== 'finance4@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 4 (Shalki Subashi) is authorized to handle stock balances and issue invoices.',
      });
      return;
    }

    const { id, sku, warehouseStock, factoryStock } = req.body;

    if (!id && !sku) {
      res.status(400).json({ message: 'Product id or SKU is required' });
      return;
    }

    const targetProduct = id
      ? await prisma.inventoryProduct.findUnique({ where: { id } })
      : await prisma.inventoryProduct.findUnique({ where: { sku } });

    if (!targetProduct) {
      res.status(404).json({ message: 'Paint product not found in inventory' });
      return;
    }

    const updated = await prisma.inventoryProduct.update({
      where: { id: targetProduct.id },
      data: {
        ...(warehouseStock !== undefined ? { warehouseStock: Number(warehouseStock) } : {}),
        ...(factoryStock !== undefined ? { factoryStock: Number(factoryStock) } : {}),
      },
    });

    res.json({
      message: `Stock balance for ${updated.name} updated in real time by Shalki Subashi`,
      product: updated,
    });
  } catch (error: any) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ message: 'Failed to adjust stock balance', error: error.message });
  }
};

export const issueInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // STRICT AUTHORITY CHECK: Only Shalki Subashi (finance4) or MD
    if (req.user.email !== 'finance4@jade.office' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({
        message: 'Authority Restricted: Only Finance Assistant 4 (Shalki Subashi) is authorized to issue invoices.',
      });
      return;
    }

    const {
      customerName,
      customerArea,
      items, // Array of { sku, name, quantity, unitPriceLKR }
      stockDeductedFrom = 'WAREHOUSE', // 'WAREHOUSE' or 'FACTORY'
      notes,
      dueDate,
    } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Customer name and at least one item are required to issue an invoice' });
      return;
    }

    // Process items and calculate totals
    let subTotalLKR = 0;
    const processedItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPriceLKR) || 0;
      const lineTotal = qty * price;
      subTotalLKR += lineTotal;
      return {
        sku: item.sku,
        name: item.name,
        quantity: qty,
        unitPriceLKR: price,
        totalLKR: lineTotal,
      };
    });

    const totalAmountLKR = subTotalLKR;

    // Generate unique invoice number: INV-YYYY-XXXX
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 101).padStart(4, '0')}`;

    // Execute in transaction: create invoice and deduct stock
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerName,
          customerArea: customerArea || 'Colombo Central',
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000 * 30),
          status: 'ISSUED',
          itemsJson: JSON.stringify(processedItems),
          subTotalLKR,
          taxLKR: 0,
          totalAmountLKR,
          notes: notes || `Dispatched from ${stockDeductedFrom.toLowerCase()} inventory. Issued by Shalki Subashi.`,
          issuedById: req.user!.id,
          issuedByName: req.user!.name,
          stockDeductedFrom,
        },
      });

      // Deduct inventory in real time
      for (const item of processedItems) {
        if (item.sku) {
          const prod = await tx.inventoryProduct.findUnique({ where: { sku: item.sku } });
          if (prod) {
            if (stockDeductedFrom === 'WAREHOUSE') {
              const newWarehouseStock = Math.max(0, prod.warehouseStock - item.quantity);
              await tx.inventoryProduct.update({
                where: { id: prod.id },
                data: { warehouseStock: newWarehouseStock },
              });
            } else if (stockDeductedFrom === 'FACTORY') {
              const newFactoryStock = Math.max(0, prod.factoryStock - item.quantity);
              await tx.inventoryProduct.update({
                where: { id: prod.id },
                data: { factoryStock: newFactoryStock },
              });
            }
          }
        }
      }

      return invoice;
    });

    res.status(201).json({
      message: `Invoice ${invoiceNumber} issued and stock deducted in real time by Shalki Subashi`,
      invoice: result,
    });
  } catch (error: any) {
    console.error('Issue invoice error:', error);
    res.status(500).json({ message: 'Failed to issue invoice', error: error.message });
  }
};

export const getInvoices = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ invoices });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

