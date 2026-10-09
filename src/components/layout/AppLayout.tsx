import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { api } from '@/lib/api-client';
import { ToastContainer } from '@/components/ui/toast';
import { Shop } from '@/types';
import { Loader2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch all shops dynamically from API
  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: () => api.getShops(),
    staleTime: 1000 * 30, // 30 secs cache
    refetchOnMount: true,
  });


  if (isLoading && shops.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">দোকানের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar shops={shops} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-72 h-full">
            <Sidebar shops={shops} onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Right Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavbar shops={shops} onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-muted/10">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ shops }} />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
