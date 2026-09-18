# JADE System - Enterprise Office Management System

A full-stack, enterprise-grade Office Management System engineered with **Role-Based Access Control (RBAC)** across 7 designated accounts, native **Google Drive API (v3)** cloud storage integration, a tailored **Jade Green & Charcoal design system**, and dedicated executive, operational, and financial workspaces.

---

## 1. System Overview & Preconfigured Accounts

The system is preconfigured with **7 designated accounts** mapped to specific operational permissions:

| # | Name | Email | Role | Department | Workspace Access |
|---|------|-------|------|------------|------------------|
| 1 | **Eleanor Vance** | `md@jade.office` | `MANAGING_DIRECTOR` | Executive Board | Executive Suite, Global Financial Audits, Cross-Departmental Drive Explorer |
| 2 | **Marcus Chen** | `operations@jade.office` | `OPERATIONAL_MANAGER` | Operations | Operational Board, Milestones, Operations Drive |
| 3 | **Sophia Rodriguez** | `techsales@jade.office` | `TECH_SALES_MANAGER` | Technical & Sales | Pipeline & Deals, Proposals Drive |
| 4 | **David Kim** | `finance1@jade.office` | `FINANCE_ASSISTANT` | Finance & Accounts | High-Speed Ledger, Voucher Uploads, Financial Reports |
| 5 | **Amina Patel** | `finance2@jade.office` | `FINANCE_ASSISTANT` | Finance & Accounts | High-Speed Ledger, Voucher Uploads, Financial Reports |
| 6 | **Lucas Dubois** | `finance3@jade.office` | `FINANCE_ASSISTANT` | Finance & Accounts | High-Speed Ledger, Voucher Uploads, Financial Reports |
| 7 | **Elena Rostova** | `finance4@jade.office` | `FINANCE_ASSISTANT` | Finance & Accounts | High-Speed Ledger, Voucher Uploads, Financial Reports |

> **Default Password for all 7 accounts**: `Jade2026!`  
> *(Password change functionality is available to all users under **Profile & Security**)*.

---

## 2. Core Architecture & Tech Stack

### Backend
- **Runtime**: Node.js (v24+) & TypeScript
- **Framework**: Express.js
- **Database & ORM**: SQLite (zero-config local run) with Prisma ORM (seamlessly switchable to PostgreSQL or MySQL)
- **Cloud Storage**: `@googleapis/drive` (Google APIs Node.js Client v3)
- **Authentication**: JWT with Bearer authorization and `bcryptjs` password hashing
- **Security**: Custom RBAC middleware (`requireRoles`) enforcing role guards on endpoints

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom Jade Green (`#059669` / `#10b981`) and Deep Charcoal (`#0f172a` / `#1e293b`)
- **Data Visualization**: Recharts (Cash Flow Area Chart, Target Fulfillment Bars)
- **Icons**: Lucide React
- **Client Cropper**: Interactive HTML5 Canvas avatar cropper with drag-to-pan, zoom slider, and direct Google Drive buffer upload

---

## 3. Google Drive API Integration

All documents, vouchers, invoices, proposals, and profile pictures are synchronized to Google Drive.

### Folder Hierarchy in Google Drive
On initialization or first upload, the system automatically checks and provisions the directory hierarchy:
```
Google Drive Root
└── JADE_System/
    ├── Finance/         (Invoices, receipts, tax vouchers)
    ├── Operations/      (SOPs, operational audits, incident logs)
    ├── Sales/           (Client proposals, tender submissions, deliverables)
    ├── Profiles/        (User avatar profile pictures)
    └── General/         (Company-wide announcements & policies)
```

### Google Cloud Credentials Setup
1. In the **Google Cloud Console**, enable the **Google Drive API**.
2. Create a **Service Account** with the `Editor` role.
3. Generate a **JSON Key** and save it as:
   ```
   backend/service-account.json
   ```
4. In `backend/.env`, set:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE="./service-account.json"
   ```
5. *(Optional)* Share your Google Drive team folder with the service account's client email.

> **Graceful Fallback Mode**: If `service-account.json` is not present, the system automatically activates a local high-fidelity simulated Google Drive engine (`backend/mock_drive_storage/`), allowing complete testing of upload, download, and file browsing flows without blocking development.

---

## 4. UI/UX Design & Theming

- **Core Palette**:
  - **Jade Green** (`#059669` / `#10b981`): Buttons, active navigation pills, progress bars, positive financial metrics.
  - **Clean White** (`#ffffff` / `#f8fafc`): Card surfaces, clean canvas in Light Mode.
  - **Midnight Charcoal** (`#0f172a` / `#1e293b`): Persistent navigation sidebars, high-contrast dark mode canvas.
- **Theme Persistence**: Dark/Light mode toggle is saved both locally in browser state and synchronized to the user's database profile (`themePreference`).
- **Interactive Avatar Cropper**: Users can upload any photo, pan and zoom within a circular crop viewport, and save the cropped output directly to `JADE_System/Profiles` in Google Drive.

---

## 5. Getting Started & Running the System

### Prerequisites
- Node.js (v18 or higher) & npm

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run build
npm start
```
The backend starts at `http://localhost:5000` with the health check available at `http://localhost:5000/api/health`.

### Step 2: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server launches at `http://localhost:5173`.

---

## 6. API Route Reference

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticates user & returns JWT | Public |
| `GET` | `/api/auth/me` | Fetches current user profile | Authenticated |
| `POST` | `/api/auth/change-password` | Updates user password | Authenticated |
| `PATCH` | `/api/auth/theme` | Updates user Dark/Light theme | Authenticated |
| `POST` | `/api/drive/upload` | Streams document directly to Google Drive | Authenticated |
| `POST` | `/api/drive/avatar` | Crops & uploads avatar to Google Drive | Authenticated |
| `GET` | `/api/drive/files` | Lists files with folder and category filters | Scoped by Role (MD Global) |
| `GET` | `/api/drive/download/:fileId` | Streams file download from Google Drive | Authenticated |
| `DELETE`| `/api/drive/:fileId` | Deletes file from Google Drive and DB | Uploader or MD |
| `GET` | `/api/finance/transactions` | Lists paginated financial ledger records | Finance, MD |
| `POST` | `/api/finance/transactions` | Records daily transaction with voucher attachment | Finance, MD |
| `GET` | `/api/finance/summary` | Aggregated cash flow, category breakdown, & net margin | Finance, MD |
| `GET` | `/api/metrics/executive` | High-level executive KPI metrics & Recharts data | MD Only |
| `GET` | `/api/metrics/department/:dept`| Department-specific operational metrics | Authenticated |
| `PATCH`| `/api/metrics/:id` | Increments or updates metric progress | Authenticated |
| `GET` | `/api/health` | System and Google Drive connection status | Public |
