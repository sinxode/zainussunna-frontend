import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';
import { ToastProvider } from './context/ToastContext';

import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TripsPage } from './features/trips/TripsPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { StudentsPage } from './features/students/StudentsPage';
import { ReceiptBooksPage } from './features/receipt-books/ReceiptBooksPage';
import { ExpensesPage } from './features/expenses/ExpensesPage';
import { CommissionPage } from './features/commission/CommissionPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';

import './styles/main.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        background: '#0B0F19',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        color: '#94A3B8'
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
        }}>
          Z
        </div>
        <span>Loading Zainussunna Calendar Manager...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CampaignProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="trips" element={<TripsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="receipt-books" element={<ReceiptBooksPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="commission" element={<CommissionPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </CampaignProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
