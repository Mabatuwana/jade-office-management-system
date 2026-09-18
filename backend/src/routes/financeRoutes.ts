import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getFinanceSummary,
  deleteTransaction,
  registerSalesOfficer,
  recordSalesPerformance,
  exportSalesPerformance,
  recordPettyCash,
  deletePettyCashRecord,
  recordCustomerCredit,
  adjustStockBalance,
  issueInvoice,
  getInvoices,
} from '../controllers/financeController.js';
import { authenticateJWT, requireRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

// Standard Finance Transactions
router.post(
  '/transactions',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  createTransaction
);
router.get('/transactions', getTransactions);
router.get('/summary', getFinanceSummary);
router.delete(
  '/transactions/:id',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  deleteTransaction
);

// FA1: Shani Minoshika - Sales Officers & Sales Performance
router.post(
  '/sales-officers',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  registerSalesOfficer
);
router.post(
  '/sales-performance',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  recordSalesPerformance
);
router.get('/export/sales-performance', exportSalesPerformance);

// FA2: Rashini Fernando - Petty Cash
router.post(
  '/petty-cash',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  recordPettyCash
);
router.delete(
  '/petty-cash/:id',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  deletePettyCashRecord
);

// FA3: Thiwara Dilmini - Customer Collections & Credit Limits
router.post(
  '/customer-credit',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  recordCustomerCredit
);
router.put(
  '/customer-credit/:id',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  recordCustomerCredit
);

// FA4: Shalki Subashi - Stock Balance & Invoicing
router.post(
  '/stock/adjust',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  adjustStockBalance
);
router.post(
  '/invoices',
  requireRoles(['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR'], false),
  issueInvoice
);
router.get('/invoices', getInvoices);

export default router;

