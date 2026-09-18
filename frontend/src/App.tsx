import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { AvatarCropperModal } from './components/common/AvatarCropperModal';
import { DriveUploaderModal } from './components/common/DriveUploaderModal';
import { LoginPage } from './components/auth/LoginPage';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { FinanceWorkspace } from './components/finance/FinanceWorkspace';
import { OperationsDashboard } from './components/operations/OperationsDashboard';
import { SalesDashboard } from './components/sales/SalesDashboard';
import { DriveFileExplorer } from './components/drive/DriveFileExplorer';
import { ProfileSettings } from './components/profile/ProfileSettings';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-charcoal-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-jade-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Managing Director has universal view permission
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'MANAGING_DIRECTOR') {
    // Redirect to their respective home dashboard
    if (user.role === 'FINANCE_ASSISTANT') return <Navigate to="/dashboard/finance" replace />;
    if (user.role === 'OPERATIONAL_MANAGER') return <Navigate to="/dashboard/operations" replace />;
    if (user.role === 'TECH_SALES_MANAGER') return <Navigate to="/dashboard/sales" replace />;
    return <Navigate to="/drive" replace />;
  }

  return <>{children}</>;
};

// Master App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-100/90 dark:bg-[#0b0f19]">
      {/* Liquid Glass Ambient Orbs */}
      <div className="pointer-events-none fixed -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-500/15" />
      <div className="pointer-events-none fixed top-1/2 -left-24 h-96 w-96 -translate-y-1/2 rounded-full bg-teal-400/15 blur-[110px] dark:bg-teal-500/10" />
      <div className="pointer-events-none fixed -bottom-24 right-1/4 h-96 w-96 rounded-full bg-jade-600/15 blur-[120px] dark:bg-emerald-600/10" />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenUploadModal={() => setUploadModalOpen(true)}
          onOpenCropModal={() => setCropModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <AvatarCropperModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
      />

      <DriveUploaderModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};

// Root Redirect Component
const DefaultRouteRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'MANAGING_DIRECTOR':
      return <Navigate to="/dashboard/executive" replace />;
    case 'FINANCE_ASSISTANT':
      return <Navigate to="/dashboard/finance" replace />;
    case 'OPERATIONAL_MANAGER':
      return <Navigate to="/dashboard/operations" replace />;
    case 'TECH_SALES_MANAGER':
      return <Navigate to="/dashboard/sales" replace />;
    default:
      return <Navigate to="/drive" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard/executive"
              element={
                <ProtectedRoute allowedRoles={['MANAGING_DIRECTOR']}>
                  <AppLayout>
                    <ExecutiveDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/finance"
              element={
                <ProtectedRoute allowedRoles={['FINANCE_ASSISTANT', 'MANAGING_DIRECTOR']}>
                  <AppLayout>
                    <FinanceWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/operations"
              element={
                <ProtectedRoute allowedRoles={['OPERATIONAL_MANAGER', 'MANAGING_DIRECTOR']}>
                  <AppLayout>
                    <OperationsDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/sales"
              element={
                <ProtectedRoute allowedRoles={['TECH_SALES_MANAGER', 'MANAGING_DIRECTOR']}>
                  <AppLayout>
                    <SalesDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/drive"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DriveFileExplorer onOpenUpload={() => {}} />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfileSettings onOpenCropModal={() => {}} />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<DefaultRouteRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
