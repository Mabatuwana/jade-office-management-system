import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('[Seed] Beginning JADE Water-Base Paint Manufacturing initialization...');

  // Clear existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.fileRecord.deleteMany({});
  await prisma.financialRecord.deleteMany({});
  await prisma.operationalMetric.deleteMany({});
  await prisma.salesOfficerPerformance.deleteMany({});
  await prisma.customerRanking.deleteMany({});
  await prisma.pettyCashRecord.deleteMany({});
  await prisma.inventoryProduct.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = 'Jade2026!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Seed 7 Designated Corporate Staff Accounts (MD: Chamikara De Silva)
  const usersData = [
    {
      email: 'md@jade.office',
      name: 'Chamikara De Silva',
      role: 'MANAGING_DIRECTOR',
      department: 'Executive Board',
      assistantAuthority: null,
      themePreference: 'LIGHT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    {
      email: 'operations@jade.office',
      name: 'Ridmi Kashani',
      role: 'OPERATIONAL_MANAGER',
      department: 'Factory & Operations',
      assistantAuthority: null,
      themePreference: 'DARK',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'techsales@jade.office',
      name: 'Nishan Rajapaksha',
      role: 'TECH_SALES_MANAGER',
      department: 'Technical & Sales',
      assistantAuthority: null,
      themePreference: 'LIGHT',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'finance1@jade.office',
      name: 'Shani Minoshika',
      role: 'FINANCE_ASSISTANT',
      department: 'Finance & Accounts',
      assistantAuthority: 'FA1_SALES_OFFICERS',
      themePreference: 'LIGHT',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'finance2@jade.office',
      name: 'Rashini Fernando',
      role: 'FINANCE_ASSISTANT',
      department: 'Finance & Accounts',
      assistantAuthority: 'FA2_PETTY_CASH',
      themePreference: 'DARK',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'finance3@jade.office',
      name: 'Thiwara Dilmini',
      role: 'FINANCE_ASSISTANT',
      department: 'Finance & Accounts',
      assistantAuthority: 'FA3_CUSTOMER_CREDIT',
      themePreference: 'LIGHT',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'finance4@jade.office',
      name: 'Shalki Subashi',
      role: 'FINANCE_ASSISTANT',
      department: 'Finance & Accounts',
      assistantAuthority: 'FA4_STOCK_INVOICING',
      themePreference: 'LIGHT',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const created = await prisma.user.create({
      data: {
        ...u,
        passwordHash,
      },
    });
    createdUsers[u.email] = created;
  }
  console.log(`[Seed] Seeded ${usersData.length} corporate accounts for paint company.`);

  // 2. Seed Realistic Financial Transactions in LKR
  const financeUser = createdUsers['finance1@jade.office'];
  const transactionsData = [
    {
      title: 'Bulk Industrial Paint Supply - Colombo Harbor Logistics',
      category: 'Client Retainer',
      type: 'INCOME',
      amount: 4850000,
      currency: 'LKR',
      date: new Date('2026-01-15T10:00:00Z'),
      status: 'APPROVED',
      referenceNo: 'INV-2026-001',
      notes: 'Supply of Metashield Industrial Primer and Tyreshield',
      creatorId: financeUser.id,
      driveFileId: '1gDriveMock_INV_2026_001',
    },
    {
      title: 'Raw Material Polymer Emulsion & Pigments Batch Q1',
      category: 'Hardware',
      type: 'EXPENSE',
      amount: 2250000,
      currency: 'LKR',
      date: new Date('2026-01-20T14:30:00Z'),
      status: 'APPROVED',
      referenceNo: 'EXP-2026-088',
      notes: 'Water-base acrylic binders and non-toxic pigment slurry',
      creatorId: financeUser.id,
      driveFileId: '1gDriveMock_EXP_2026_088',
    },
    {
      title: 'Woodshield & Masoguard Wholesale Dispatch - Kandy Metro Dealers',
      category: 'Client Retainer',
      type: 'INCOME',
      amount: 3600000,
      currency: 'LKR',
      date: new Date('2026-02-05T09:15:00Z'),
      status: 'APPROVED',
      referenceNo: 'INV-2026-002',
      notes: 'Quarterly consignment of domestic wood & wall coatings',
      creatorId: financeUser.id,
      driveFileId: null,
    },
    {
      title: 'Gampaha Factory Production Plant Lease (Q1 2026)',
      category: 'Office Rent',
      type: 'EXPENSE',
      amount: 1800000,
      currency: 'LKR',
      date: new Date('2026-02-10T11:00:00Z'),
      status: 'APPROVED',
      referenceNo: 'EXP-2026-092',
      notes: 'Industrial Zone manufacturing plant & automated filling line',
      creatorId: createdUsers['finance2@jade.office'].id,
      driveFileId: '1gDriveMock_EXP_2026_092',
    },
    {
      title: 'Architectural Project Coatings - Galle Star Beach Resort',
      category: 'Client Retainer',
      type: 'INCOME',
      amount: 5800000,
      currency: 'LKR',
      date: new Date('2026-03-01T16:45:00Z'),
      status: 'APPROVED',
      referenceNo: 'INV-2026-003',
      notes: 'Exterior Roof & Wall Shield and Masoguard Paving Sealer',
      creatorId: financeUser.id,
      driveFileId: null,
    },
    {
      title: 'Factory Chemical Technicians & Staff Payroll (Feb 2026)',
      category: 'Payroll',
      type: 'EXPENSE',
      amount: 1450000,
      currency: 'LKR',
      date: new Date('2026-02-28T17:00:00Z'),
      status: 'APPROVED',
      referenceNo: 'PAY-2026-002',
      notes: 'Direct salary transfer for paint technicians and field officers',
      creatorId: createdUsers['finance3@jade.office'].id,
      driveFileId: null,
    },
    {
      title: 'Distributor Field Audits & Technical Demonstration Travel',
      category: 'Travel',
      type: 'EXPENSE',
      amount: 417000,
      currency: 'LKR',
      date: new Date('2026-03-12T08:30:00Z'),
      status: 'APPROVED',
      referenceNo: 'EXP-2026-104',
      notes: 'On-site technical support for application of Woodshield Top Coat',
      creatorId: createdUsers['finance4@jade.office'].id,
      driveFileId: null,
    },
  ];

  for (const t of transactionsData) {
    await prisma.financialRecord.create({ data: t });
  }
  console.log(`[Seed] Seeded ${transactionsData.length} paint industry LKR financial records.`);

  // 3. Seed Operational Metrics
  const metricsData = [
    {
      title: 'Water-Base Paint Quality & Viscosity Standard SLA',
      department: 'Operations',
      metricType: 'SLA',
      targetValue: 99.5,
      currentValue: 99.8,
      unit: '%',
      status: 'COMPLETED',
    },
    {
      title: 'Daily Factory Production Output (Litres)',
      department: 'Operations',
      metricType: 'Productivity',
      targetValue: 12000,
      currentValue: 11650,
      unit: 'Litres',
      status: 'ON_TRACK',
    },
    {
      title: 'Green Certification & Low-VOC Environmental Audit',
      department: 'Operations',
      metricType: 'Milestone',
      targetValue: 8,
      currentValue: 7,
      unit: 'Milestones',
      status: 'ON_TRACK',
    },
    {
      title: 'Domestic & Industrial Revenue Target (Q1)',
      department: 'TechSales',
      metricType: 'Pipeline',
      targetValue: 25000000,
      currentValue: 18500000,
      unit: 'LKR',
      status: 'ON_TRACK',
    },
    {
      title: 'Hardware & Paint Dealer Onboardings',
      department: 'TechSales',
      metricType: 'Pipeline',
      targetValue: 35,
      currentValue: 29,
      unit: 'Dealers',
      status: 'ON_TRACK',
    },
    {
      title: 'Contractor Repeat Purchase Loyalty Rate',
      department: 'TechSales',
      metricType: 'Milestone',
      targetValue: 92,
      currentValue: 95.2,
      unit: '%',
      status: 'COMPLETED',
    },
  ];

  for (const m of metricsData) {
    await prisma.operationalMetric.create({ data: m });
  }
  console.log(`[Seed] Seeded ${metricsData.length} operational metrics.`);

  // 4. Seed the 7 Specified Sales Officers across Multiple Months/Years
  // Names: Nishan Rajapaksha, Yasas Pamudhitha, Nimesh Asanka, Nilupul Chandrasekara, Sanjeewa Kumara, Shehan Mihiranga, Imesh Yasintha
  const salesOfficersData = [
    // March 2026 (Current Month)
    {
      name: 'Nishan Rajapaksha',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      area: 'Colombo Central & Western Coastal',
      salesTarget: 16000000,
      salesActual: 18500000,
      collectionTarget: 15500000,
      collectionActual: 17800000,
      month: 3,
      year: 2026,
    },
    {
      name: 'Yasas Pamudhitha',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      area: 'Kandy Metro & Central Highlands',
      salesTarget: 14000000,
      salesActual: 15200000,
      collectionTarget: 13800000,
      collectionActual: 14900000,
      month: 3,
      year: 2026,
    },
    {
      name: 'Nimesh Asanka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      area: 'Gampaha Industrial Corridor',
      salesTarget: 13000000,
      salesActual: 13800000,
      collectionTarget: 12500000,
      collectionActual: 12950000,
      month: 3,
      year: 2026,
    },
    {
      name: 'Nilupul Chandrasekara',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      area: 'Galle Coastal & Southern Tourism',
      salesTarget: 12000000,
      salesActual: 11400000,
      collectionTarget: 11500000,
      collectionActual: 10800000,
      month: 3,
      year: 2026,
    },
    {
      name: 'Sanjeewa Kumara',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      area: 'Kurunegala Zone & Wayamba Marts',
      salesTarget: 10500000,
      salesActual: 9750000,
      collectionTarget: 10000000,
      collectionActual: 9100000,
      month: 3,
      year: 2026,
    },
    {
      name: 'Shehan Mihiranga',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      area: 'Negombo Fishing & Timber Zone',
      salesTarget: 9500000,
      salesActual: 8600000,
      collectionTarget: 9000000,
      collectionActual: 8200000,
      month: 3,
      year: 2026,
    },
    {
      name: 'Imesh Yasintha',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      area: 'Jaffna Peninsula & Northern Builders',
      salesTarget: 8500000,
      salesActual: 7400000,
      collectionTarget: 8000000,
      collectionActual: 6950000,
      month: 3,
      year: 2026,
    },

    // February 2026 (Past Month)
    {
      name: 'Yasas Pamudhitha',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      area: 'Kandy Metro & Central Highlands',
      salesTarget: 13500000,
      salesActual: 16100000,
      collectionTarget: 13000000,
      collectionActual: 15800000,
      month: 2,
      year: 2026,
    },
    {
      name: 'Nishan Rajapaksha',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      area: 'Colombo Central & Western Coastal',
      salesTarget: 15500000,
      salesActual: 15900000,
      collectionTarget: 15000000,
      collectionActual: 15400000,
      month: 2,
      year: 2026,
    },
    {
      name: 'Nimesh Asanka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      area: 'Gampaha Industrial Corridor',
      salesTarget: 12500000,
      salesActual: 13100000,
      collectionTarget: 12000000,
      collectionActual: 12700000,
      month: 2,
      year: 2026,
    },
    {
      name: 'Sanjeewa Kumara',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      area: 'Kurunegala Zone & Wayamba Marts',
      salesTarget: 10000000,
      salesActual: 10400000,
      collectionTarget: 9500000,
      collectionActual: 9800000,
      month: 2,
      year: 2026,
    },
    {
      name: 'Nilupul Chandrasekara',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      area: 'Galle Coastal & Southern Tourism',
      salesTarget: 11500000,
      salesActual: 10200000,
      collectionTarget: 11000000,
      collectionActual: 9900000,
      month: 2,
      year: 2026,
    },

    // 2025 Historical Data
    {
      name: 'Nishan Rajapaksha',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      area: 'Colombo Central',
      salesTarget: 150000000,
      salesActual: 172000000,
      collectionTarget: 145000000,
      collectionActual: 168000000,
      month: 12,
      year: 2025,
    },
    {
      name: 'Yasas Pamudhitha',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      area: 'Kandy Metro',
      salesTarget: 130000000,
      salesActual: 145000000,
      collectionTarget: 125000000,
      collectionActual: 141000000,
      month: 12,
      year: 2025,
    },
    {
      name: 'Nimesh Asanka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      area: 'Gampaha District',
      salesTarget: 120000000,
      salesActual: 128000000,
      collectionTarget: 115000000,
      collectionActual: 122000000,
      month: 12,
      year: 2025,
    },
  ];

  for (const s of salesOfficersData) {
    await prisma.salesOfficerPerformance.create({ data: s });
  }
  console.log(`[Seed] Seeded ${salesOfficersData.length} records for the 7 designated Sales Officers.`);

  // 5. Seed Customer Rankings (Assigned to the 7 named Sales Officers)
  const customersData = [
    {
      customerName: 'Cargills Hardware & Home Hub',
      businessType: 'Retail & Hardware Chain',
      assignedOfficer: 'Nishan Rajapaksha',
      area: 'Colombo Central',
      cashPayments: 24500000,
      creditsTaken: 6200000,
      creditLimit: 15000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Lanka Paint Distributors Ltd',
      businessType: 'Paint & Coatings Wholesale',
      assignedOfficer: 'Nishan Rajapaksha',
      area: 'Colombo Central',
      cashPayments: 21800000,
      creditsTaken: 5400000,
      creditLimit: 12000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Central Woodcraft & Hardware Mart',
      businessType: 'Timber & Wood Coatings',
      assignedOfficer: 'Yasas Pamudhitha',
      area: 'Kandy Metro',
      cashPayments: 17250000,
      creditsTaken: 7800000,
      creditLimit: 10000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Gampaha Builders & Industrial Supplies',
      businessType: 'Industrial Construction Dealer',
      assignedOfficer: 'Nimesh Asanka',
      area: 'Gampaha District',
      cashPayments: 15900000,
      creditsTaken: 4100000,
      creditLimit: 8000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Wayamba Hardware Supercenter',
      businessType: 'Hardware Wholesale Depot',
      assignedOfficer: 'Sanjeewa Kumara',
      area: 'Kurunegala Zone',
      cashPayments: 13400000,
      creditsTaken: 2900000,
      creditLimit: 6000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Ruhuna Coastal Paint Mart',
      businessType: 'Marine & Decorative Supplies',
      assignedOfficer: 'Nilupul Chandrasekara',
      area: 'Galle Coastal',
      cashPayments: 11750000,
      creditsTaken: 8500000,
      creditLimit: 10000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Negombo Color Mart & Wood Coatings',
      businessType: 'Woodworking & Paint Mart',
      assignedOfficer: 'Shehan Mihiranga',
      area: 'Negombo Corridor',
      cashPayments: 9800000,
      creditsTaken: 3600000,
      creditLimit: 6000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Northern Star Construction Supplies',
      businessType: 'Regional Paint Wholesaler',
      assignedOfficer: 'Imesh Yasintha',
      area: 'Jaffna Peninsula',
      cashPayments: 8400000,
      creditsTaken: 4900000,
      creditLimit: 7000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Hill Country Furniture Craftsmen',
      businessType: 'Furniture Manufacturing',
      assignedOfficer: 'Yasas Pamudhitha',
      area: 'Kandy Metro',
      cashPayments: 7200000,
      creditsTaken: 3100000,
      creditLimit: 5000000,
      month: 3,
      year: 2026,
    },
    {
      customerName: 'Kelani Valley Hardware Consortium',
      businessType: 'Retail Paint Association',
      assignedOfficer: 'Nimesh Asanka',
      area: 'Gampaha District',
      cashPayments: 6100000,
      creditsTaken: 1800000,
      creditLimit: 4000000,
      month: 3,
      year: 2026,
    },
  ];

  for (const c of customersData) {
    await prisma.customerRanking.create({ data: c });
  }
  console.log(`[Seed] Seeded ${customersData.length} paint customer ranking profiles.`);

  // 6. Seed Petty Cash Records (Daily, Monthly, Yearly + High vs Minimals)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeek = new Date(today.getTime() - 86400000 * 3);
  const lastMonth = new Date(today.getTime() - 86400000 * 25);
  const lastYear = new Date('2025-11-15T10:00:00Z');

  const pettyCashData = [
    // Top Expenses ("Expenses More")
    {
      voucherNo: 'PCV-2026-041',
      description: 'Factory Mixing Vessel Automated Pump Impeller Repair',
      category: 'Maintenance',
      amount: 48500,
      date: today,
      spentBy: 'Ridmi Kashani',
      approvedBy: 'Chamikara De Silva',
    },
    {
      voucherNo: 'PCV-2026-038',
      description: 'Production Floor Air Compressor Motor Bearing Overhaul',
      category: 'Maintenance',
      amount: 35000,
      date: yesterday,
      spentBy: 'Maintenance Lead',
      approvedBy: 'Chamikara De Silva',
    },
    {
      voucherNo: 'PCV-2026-035',
      description: 'Factory Diesel Generator Emergency Fuel Tank Refill',
      category: 'Fuel',
      amount: 28500,
      date: thisWeek,
      spentBy: 'Plant Supervisor',
      approvedBy: 'Ridmi Kashani',
    },
    {
      voucherNo: 'PCV-2026-031',
      description: 'Annual Sri Lanka Paint & Coatings Association Membership',
      category: 'Office Stationery',
      amount: 22000,
      date: thisWeek,
      spentBy: 'Executive Secretary',
      approvedBy: 'Chamikara De Silva',
    },
    {
      voucherNo: 'PCV-2026-028',
      description: 'DHL Express Raw Pigment Sample Clearance from Germany',
      category: 'Courier & Post',
      amount: 18500,
      date: lastMonth,
      spentBy: 'Nishan Rajapaksha',
      approvedBy: 'Chamikara De Silva',
    },
    {
      voucherNo: 'PCV-2026-022',
      description: 'Bulk Delivery Lorry Hydraulic Tail-Lift Emergency Service',
      category: 'Transport',
      amount: 15400,
      date: lastMonth,
      spentBy: 'Logistics Lead',
      approvedBy: 'Ridmi Kashani',
    },
    {
      voucherNo: 'PCV-2025-098',
      description: 'Main Plant Electrical Sub-Panel Breaker Upgrade',
      category: 'Maintenance',
      amount: 42000,
      date: lastYear,
      spentBy: 'Chief Electrician',
      approvedBy: 'Chamikara De Silva',
    },

    // Minimal Expenses ("Minimals")
    {
      voucherNo: 'PCV-2026-042',
      description: 'Factory Floor Workers Morning Tea & Biscuits Supply',
      category: 'Refreshments',
      amount: 2450,
      date: today,
      spentBy: 'Office Assistant',
      approvedBy: 'Rashini Fernando',
    },
    {
      voucherNo: 'PCV-2026-040',
      description: 'Government Environmental License Renewal Courier Stamps',
      category: 'Courier & Post',
      amount: 850,
      date: yesterday,
      spentBy: 'Finance Messenger',
      approvedBy: 'Rashini Fernando',
    },
    {
      voucherNo: 'PCV-2026-037',
      description: 'Quality Control Lab Sample Vials & Label Markers',
      category: 'Office Stationery',
      amount: 1200,
      date: yesterday,
      spentBy: 'QC Technician',
      approvedBy: 'Ridmi Kashani',
    },
    {
      voucherNo: 'PCV-2026-034',
      description: 'Chemical Spill Neutralizer & Solvent Hand Wash Gel',
      category: 'Cleaning',
      amount: 1650,
      date: thisWeek,
      spentBy: 'Safety Officer',
      approvedBy: 'Rashini Fernando',
    },
    {
      voucherNo: 'PCV-2026-032',
      description: 'Filling Line Pneumatic Valve Teflon Gaskets & O-Rings',
      category: 'Maintenance',
      amount: 980,
      date: thisWeek,
      spentBy: 'Line Mechanic',
      approvedBy: 'Ridmi Kashani',
    },
    {
      voucherNo: 'PCV-2026-029',
      description: 'Viscosity Testing Filter Papers & Funnel Mesh',
      category: 'Office Stationery',
      amount: 2100,
      date: lastMonth,
      spentBy: 'Lab Chemist',
      approvedBy: 'Rashini Fernando',
    },
    {
      voucherNo: 'PCV-2026-025',
      description: 'Factory Gate Security Mobile Emergency Reload',
      category: 'Office Stationery',
      amount: 500,
      date: lastMonth,
      spentBy: 'Security Lead',
      approvedBy: 'Rashini Fernando',
    },
    {
      voucherNo: 'PCV-2026-021',
      description: 'Digital Weight Scale AA Batteries & Calibration Weights',
      category: 'Cleaning',
      amount: 750,
      date: lastMonth,
      spentBy: 'QC Lead',
      approvedBy: 'Rashini Fernando',
    },
  ];

  for (const p of pettyCashData) {
    await prisma.pettyCashRecord.create({ data: p });
  }
  console.log(`[Seed] Seeded ${pettyCashData.length} paint factory petty cash records.`);

  // 7. Seed COMPLETE WATER-BASE PAINT PRODUCT LINEUP
  // Domestic: Woodshield (Stain, Top Coat, Sanding Sealer, Wood Putty, All in One, Floor Top Coat),
  //           Masoguard (Primer Grey, All in One, Top Coat, Wet Look Paving Sealer),
  //           Decoratives (Easy Floor, Roof and Wall Shield),
  //           Eco Cleaners (Universal Cleaner)
  // Industrial: Metashield (Primer, Top Coat),
  //             Tyreshield (Protective Coating)
  const productsData = [
    // --- DOMESTIC: WOODSHIELD ---
    {
      sku: 'DOM-WSD-001',
      name: 'Woodshield Stain (Rich Natural Wood Tint)',
      mainCategory: 'Domestic',
      subCategory: 'Woodshield',
      category: 'Wood Coatings',
      warehouseStock: 340,
      factoryStock: 780,
      unit: 'Litres',
      minThreshold: 150,
      unitPriceLKR: 3850,
    },
    {
      sku: 'DOM-WSD-002',
      name: 'Woodshield Top Coat (UV & Scratch Resistant Clear)',
      mainCategory: 'Domestic',
      subCategory: 'Woodshield',
      category: 'Wood Coatings',
      warehouseStock: 280,
      factoryStock: 620,
      unit: 'Litres',
      minThreshold: 120,
      unitPriceLKR: 4200,
    },
    {
      sku: 'DOM-WSD-003',
      name: 'Woodshield Sanding Sealer (Quick-Dry Grain Filler)',
      mainCategory: 'Domestic',
      subCategory: 'Woodshield',
      category: 'Wood Coatings',
      warehouseStock: 190,
      factoryStock: 450,
      unit: 'Litres',
      minThreshold: 100,
      unitPriceLKR: 3100,
    },
    {
      sku: 'DOM-WSD-004',
      name: 'Woodshield Wood Putty (Flexible Crack & Hole Filler)',
      mainCategory: 'Domestic',
      subCategory: 'Woodshield',
      category: 'Wood Coatings',
      warehouseStock: 410,
      factoryStock: 890,
      unit: 'Kg',
      minThreshold: 150,
      unitPriceLKR: 1450,
    },
    {
      sku: 'DOM-WSD-005',
      name: 'Woodshield All in One (Self-Priming Wood Protector)',
      mainCategory: 'Domestic',
      subCategory: 'Woodshield',
      category: 'Wood Coatings',
      warehouseStock: 310,
      factoryStock: 740,
      unit: 'Litres',
      minThreshold: 120,
      unitPriceLKR: 4950,
    },
    {
      sku: 'DOM-WSD-006',
      name: 'Woodshield Floor Top Coat (Heavy Foot-Traffic Polyurethane)',
      mainCategory: 'Domestic',
      subCategory: 'Woodshield',
      category: 'Wood Coatings',
      warehouseStock: 140,
      factoryStock: 380,
      unit: 'Litres',
      minThreshold: 80,
      unitPriceLKR: 5600,
    },

    // --- DOMESTIC: MASOGUARD ---
    {
      sku: 'DOM-MSG-001',
      name: 'Masoguard Primer Grey (Alkali & Moisture Resistant Masonry Base)',
      mainCategory: 'Domestic',
      subCategory: 'Masoguard',
      category: 'Masonry Coatings',
      warehouseStock: 520,
      factoryStock: 1100,
      unit: 'Litres',
      minThreshold: 200,
      unitPriceLKR: 2900,
    },
    {
      sku: 'DOM-MSG-002',
      name: 'Masoguard All in One (Weatherproof Wall Coating & Base)',
      mainCategory: 'Domestic',
      subCategory: 'Masoguard',
      category: 'Masonry Coatings',
      warehouseStock: 380,
      factoryStock: 850,
      unit: 'Litres',
      minThreshold: 150,
      unitPriceLKR: 4500,
    },
    {
      sku: 'DOM-MSG-003',
      name: 'Masoguard Top Coat (Fungus & Algae Proof Exterior Paint)',
      mainCategory: 'Domestic',
      subCategory: 'Masoguard',
      category: 'Masonry Coatings',
      warehouseStock: 450,
      factoryStock: 980,
      unit: 'Litres',
      minThreshold: 180,
      unitPriceLKR: 4100,
    },
    {
      sku: 'DOM-MSG-004',
      name: 'Masoguard Wet Look Paving Sealer (Gloss Finish Interlock & Brick)',
      mainCategory: 'Domestic',
      subCategory: 'Masoguard',
      category: 'Masonry Coatings',
      warehouseStock: 175,
      factoryStock: 420,
      unit: 'Litres',
      minThreshold: 90,
      unitPriceLKR: 5200,
    },

    // --- DOMESTIC: DECORATIVES ---
    {
      sku: 'DOM-DEC-001',
      name: 'Decoratives Easy Floor (Washable Durable Floor Paint)',
      mainCategory: 'Domestic',
      subCategory: 'Decoratives',
      category: 'Decorative Coatings',
      warehouseStock: 260,
      factoryStock: 590,
      unit: 'Litres',
      minThreshold: 100,
      unitPriceLKR: 4800,
    },
    {
      sku: 'DOM-DEC-002',
      name: 'Decoratives Roof and Wall Shield (Thermal Reflective Waterproof)',
      mainCategory: 'Domestic',
      subCategory: 'Decoratives',
      category: 'Decorative Coatings',
      warehouseStock: 420,
      factoryStock: 910,
      unit: 'Litres',
      minThreshold: 150,
      unitPriceLKR: 5400,
    },

    // --- DOMESTIC: ECO CLEANERS ---
    {
      sku: 'DOM-ECO-001',
      name: 'Eco Cleaners Universal Cleaner (Bio-Degradable Surface Prep)',
      mainCategory: 'Domestic',
      subCategory: 'Eco Cleaners',
      category: 'Eco Cleaners',
      warehouseStock: 680,
      factoryStock: 1450,
      unit: 'Litres',
      minThreshold: 200,
      unitPriceLKR: 1650,
    },

    // --- INDUSTRIAL: METASHIELD ---
    {
      sku: 'IND-MSH-001',
      name: 'Metashield Industrial Primer (Anti-Corrosive Zinc Phosphate)',
      mainCategory: 'Industrial',
      subCategory: 'Metashield',
      category: 'Metal Coatings',
      warehouseStock: 210,
      factoryStock: 520,
      unit: 'Litres',
      minThreshold: 100,
      unitPriceLKR: 6800,
    },
    {
      sku: 'IND-MSH-002',
      name: 'Metashield Heavy-Duty Top Coat (Chemical & Weather Resistant)',
      mainCategory: 'Industrial',
      subCategory: 'Metashield',
      category: 'Metal Coatings',
      warehouseStock: 165,
      factoryStock: 410,
      unit: 'Litres',
      minThreshold: 80,
      unitPriceLKR: 7950,
    },

    // --- INDUSTRIAL: TYRESHIELD ---
    {
      sku: 'IND-TSH-001',
      name: 'Tyreshield Industrial Protective Coating (Elastomeric Tyre Seal)',
      mainCategory: 'Industrial',
      subCategory: 'Tyreshield',
      category: 'Tyre & Rubber Coatings',
      warehouseStock: 290,
      factoryStock: 640,
      unit: 'Litres',
      minThreshold: 100,
      unitPriceLKR: 4600,
    },
  ];

  for (const pr of productsData) {
    await prisma.inventoryProduct.create({ data: pr });
  }
  console.log(`[Seed] Seeded ${productsData.length} complete paint products (Domestic & Industrial).`);

  // 7b. Seed Sample Invoices Issued by Shalki Subashi (Finance Assistant 4)
  const shalkiUser = createdUsers['finance4@jade.office'];
  const sampleInvoices = [
    {
      invoiceNumber: 'INV-2026-0101',
      customerName: 'Cargills Hardware & Home Hub',
      customerArea: 'Colombo Central',
      issueDate: new Date(today.getTime() - 86400000 * 2),
      dueDate: new Date(today.getTime() + 86400000 * 28),
      status: 'PAID',
      itemsJson: JSON.stringify([
        { sku: 'DOM-WSD-001', name: 'Woodshield Stain (Rich Natural Wood Tint)', quantity: 150, unitPriceLKR: 3850, totalLKR: 577500 },
        { sku: 'DOM-MSG-002', name: 'Masoguard All in One (Weatherproof Wall Coating & Base)', quantity: 200, unitPriceLKR: 4500, totalLKR: 900000 },
      ]),
      subTotalLKR: 1477500,
      taxLKR: 0,
      totalAmountLKR: 1477500,
      notes: 'Dispatched from Colombo Central Warehouse. Payment settled via Bank Transfer.',
      issuedById: shalkiUser.id,
      issuedByName: shalkiUser.name,
      stockDeductedFrom: 'WAREHOUSE',
    },
    {
      invoiceNumber: 'INV-2026-0102',
      customerName: 'Central Woodcraft & Hardware Mart',
      customerArea: 'Kandy Metro',
      issueDate: new Date(today.getTime() - 86400000),
      dueDate: new Date(today.getTime() + 86400000 * 29),
      status: 'ISSUED',
      itemsJson: JSON.stringify([
        { sku: 'DOM-WSD-006', name: 'Woodshield Floor Top Coat (Heavy Foot-Traffic Polyurethane)', quantity: 60, unitPriceLKR: 5600, totalLKR: 336000 },
        { sku: 'IND-MSH-001', name: 'Metashield Industrial Primer (Anti-Corrosive Zinc Phosphate)', quantity: 80, unitPriceLKR: 5200, totalLKR: 416000 },
      ]),
      subTotalLKR: 752000,
      taxLKR: 0,
      totalAmountLKR: 752000,
      notes: 'Direct factory pickup dispatch from Gampaha Plant floor.',
      issuedById: shalkiUser.id,
      issuedByName: shalkiUser.name,
      stockDeductedFrom: 'FACTORY',
    },
    {
      invoiceNumber: 'INV-2026-0103',
      customerName: 'Gampaha Builders & Industrial Supplies',
      customerArea: 'Gampaha District',
      issueDate: today,
      dueDate: new Date(today.getTime() + 86400000 * 30),
      status: 'PENDING',
      itemsJson: JSON.stringify([
        { sku: 'DOM-DEC-001', name: 'Decoratives Easy Floor (Washable Durable Floor Paint)', quantity: 100, unitPriceLKR: 4800, totalLKR: 480000 },
        { sku: 'DOM-ECO-001', name: 'Eco Cleaners Universal Cleaner (Bio-Degradable Surface Prep)', quantity: 50, unitPriceLKR: 1850, totalLKR: 92500 },
      ]),
      subTotalLKR: 572500,
      taxLKR: 0,
      totalAmountLKR: 572500,
      notes: 'Credit approved under dealer credit ceiling. Delivery scheduled tomorrow.',
      issuedById: shalkiUser.id,
      issuedByName: shalkiUser.name,
      stockDeductedFrom: 'WAREHOUSE',
    },
  ];

  for (const inv of sampleInvoices) {
    await prisma.invoice.create({ data: inv });
  }
  console.log(`[Seed] Seeded ${sampleInvoices.length} official paint invoices issued by Shalki Subashi.`);

  // 8. Seed Google Drive Registered File Records
  const filesData = [
    {
      fileName: 'WaterBase_Paint_Quality_Assurance_SOP_2026.pdf',
      originalName: 'WaterBase_Paint_Quality_Assurance_SOP_2026.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2450000,
      driveFileId: '1gDriveMock_Paint_QA_2026',
      driveWebView: 'https://drive.google.com/file/d/1gDriveMock_Paint_QA_2026/view',
      driveFolder: 'Operations',
      category: 'Report',
      uploaderId: createdUsers['operations@jade.office'].id,
    },
    {
      fileName: 'Metashield_Industrial_Technical_Data_Sheet.pdf',
      originalName: 'Metashield_Industrial_Technical_Data_Sheet.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1540000,
      driveFileId: '1gDriveMock_Metashield_TDS',
      driveWebView: 'https://drive.google.com/file/d/1gDriveMock_Metashield_TDS/view',
      driveFolder: 'Sales',
      category: 'Proposal',
      uploaderId: createdUsers['techsales@jade.office'].id,
    },
    {
      fileName: 'Woodshield_Architectural_Specs_Brochure.pdf',
      originalName: 'Woodshield_Architectural_Specs_Brochure.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1820000,
      driveFileId: '1gDriveMock_Woodshield_Brochure',
      driveWebView: 'https://drive.google.com/file/d/1gDriveMock_Woodshield_Brochure/view',
      driveFolder: 'Sales',
      category: 'Proposal',
      uploaderId: createdUsers['techsales@jade.office'].id,
    },
    {
      fileName: 'Annual_Chemical_Emissions_Audit_Report.xlsx',
      originalName: 'Annual_Chemical_Emissions_Audit_Report.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeBytes: 420000,
      driveFileId: '1gDriveMock_Emissions_Audit_2026',
      driveWebView: 'https://drive.google.com/file/d/1gDriveMock_Emissions_Audit_2026/view',
      driveFolder: 'Finance',
      category: 'Report',
      uploaderId: createdUsers['md@jade.office'].id,
    },
  ];

  for (const f of filesData) {
    await prisma.fileRecord.create({ data: f });
  }
  console.log(`[Seed] Seeded ${filesData.length} Google Drive registered file records.`);

  console.log('[Seed] Water-base paint manufacturing database initialization complete!');
}

// Run directly if invoked via CLI
if (process.argv[1] && (process.argv[1].includes('seed') || process.argv[1].includes('prisma'))) {
  seedDatabase()
    .catch((e) => {
      console.error('[Seed Error]:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
