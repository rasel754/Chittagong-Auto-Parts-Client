import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { api } from '@/lib/api-client';
import { ToastContainer } from '@/components/ui/toast';
import { Shop } from '@/types';
import { Loader2, RefreshCw } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  // Fetch all shops dynamically from API
  const { data: shops = [], isLoading, refetch } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: () => api.getShops(),
    staleTime: 1000 * 60 * 10, // 10 mins cache
    refetchOnMount: false,
    retry: 1,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading && shops.length === 0) {
      timer = setTimeout(() => {
        setShowSlowNotice(true);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isLoading, shops.length]);

  if (isLoading && shops.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">দোকানের তথ্য লোড হচ্ছে...</p>
          {showSlowNotice && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                সার্ভারের সংযোগে দেরি হচ্ছে। অনুগ্রহ করে ইন্টারনেট বা ডিএনএস সংযোগ যাচাই করুন।
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                আবার চেষ্টা করুন
              </button>
            </div>
          )}
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
