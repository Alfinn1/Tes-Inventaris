import React, { useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { StoreSelectPage } from './components/store-select/StoreSelectPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { FirstLoginPasswordModal } from './components/auth/FirstLoginPasswordModal';

import { MainDashboard } from './components/dashboard/MainDashboard';
import { StoreDashboard } from './components/dashboard/StoreDashboard';
import { InventoryPage } from './components/inventory/InventoryPage';
import { CategoriesPage } from './components/categories/CategoriesPage';
import { StockInPage } from './components/transactions/StockInPage';
import { StockOutPage } from './components/transactions/StockOutPage';
import { DamagedItemsPage } from './components/transactions/DamagedItemsPage';
import { ReturnsPage } from './components/returns/ReturnsPage';
import { AttendancePage } from './components/attendance/AttendancePage';
import { EmployeesPage } from './components/employees/EmployeesPage';
import { StoresPage } from './components/stores/StoresPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { ActivityLogPage } from './components/activity-log/ActivityLogPage';
import { SettingsPage } from './components/settings/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser, currentPage, activeStoreId, setSidebarOpen } = useApp();
  const mainRef = useRef<HTMLElement>(null);

  // Automatically close sidebar/drawer and scroll back to top on login or page change
  useEffect(() => {
    setSidebarOpen(false);
    const scrollToTop = () => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
        mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const rafId = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(rafId);
  }, [currentPage, activeStoreId, currentUser?.id, setSidebarOpen]);

  // 1. If not authenticated, show Login Page
  if (!currentUser) {
    return (
      <main className="min-h-screen font-sans">
        <LoginPage />
        <ToastContainer />
      </main>
    );
  }

  // 2. Render Main App Layout with Sidebar + Header + Page Content
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'DASHBOARD_UTAMA':
        return <MainDashboard />;
      case 'PILIH_TOKO':
        return <StoreSelectPage />;
      case 'DASHBOARD_TOKO':
        return <StoreDashboard />;
      case 'INVENTARIS':
        return <InventoryPage />;
      case 'KATEGORI':
        return <CategoriesPage />;
      case 'BARANG_MASUK':
        return <StockInPage />;
      case 'BARANG_KELUAR':
        return <StockOutPage />;
      case 'BARANG_RUSAK':
        return <DamagedItemsPage />;
      case 'RETURN':
        return <ReturnsPage />;
      case 'ABSENSI':
        return <AttendancePage />;
      case 'KARYAWAN':
        return <EmployeesPage />;
      case 'TOKO':
        return <StoresPage />;
      case 'LAPORAN':
        return <ReportsPage />;
      case 'ACTIVITY_LOG':
        return <ActivityLogPage />;
      case 'PENGATURAN':
        return <SettingsPage />;
      default:
        return <StoreDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main
          key={`${currentPage}-${activeStoreId || 'global'}`}
          ref={mainRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Toast Notifications & Mandatory Password Change Modal */}
      <FirstLoginPasswordModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
