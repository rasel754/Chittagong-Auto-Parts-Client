import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { CommonDashboardPage } from '@/features/dashboard/CommonDashboardPage';
import { ShopDashboardPage } from '@/features/dashboard/ShopDashboardPage';
import { SalesRecordPage } from '@/features/sales/SalesRecordPage';
import { StockRecordPage } from '@/features/stock/StockRecordPage';
import { RecentSalesHistoryPage } from '@/features/sales/RecentSalesHistoryPage';
import { StockHistoryPage } from '@/features/stock/StockHistoryPage';
import { CreateShopPage } from '@/features/shops/CreateShopPage';
import { useAuthStore } from '@/features/auth/authStore';
import { queryClient } from '@/lib/query-client';



export const App: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<CommonDashboardPage />} />
            <Route path="shops/new" element={<CreateShopPage />} />
            <Route path="shops/:shopId/dashboard" element={<ShopDashboardPage />} />
            <Route path="shops/:shopId/sales" element={<SalesRecordPage />} />
            <Route path="shops/:shopId/stock" element={<StockRecordPage />} />
            <Route path="shops/:shopId/sales-history" element={<RecentSalesHistoryPage />} />
            <Route path="shops/:shopId/stock-history" element={<StockHistoryPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
