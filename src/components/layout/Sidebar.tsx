import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Receipt,
  Boxes,
  History,
  TrendingUp,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { Shop } from '@/types';
import { useAuthStore } from '@/features/auth/authStore';
import { useShopStore } from '@/features/shops/shopStore';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';

interface SidebarProps {
  shops: Shop[];
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ shops, onCloseMobile }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { openCreateModal } = useShopStore();
  const [openShopMenuId, setOpenShopMenuId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Auto expand the menu for the current active shop URL
  React.useEffect(() => {
    const match = location.pathname.match(/\/shops\/([^/]+)/);
    if (match && match[1]) {
      setOpenShopMenuId(match[1]);
    }
  }, [location.pathname]);

  const toggleShopSubmenu = (shopId: string) => {
    setOpenShopMenuId((prev) => (prev === shopId ? null : shopId));
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <aside className="w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30 flex items-center justify-center">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-tight text-white truncate flex items-center gap-1.5">
              <span>{t('app.title')}</span>
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            </h1>
            <p className="text-xs text-muted-foreground truncate">{t('app.subtitle')}</p>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Section A: Global Dashboard */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              সার্বিক ব্যবস্থাপনা (Global)
            </div>
            <div className="space-y-1">
              <NavLink
                to="/dashboard"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white'
                  )
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t('nav.commonDashboard')}</span>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  openCreateModal();
                  handleNavClick();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:bg-sidebar-accent hover:text-emerald-300 transition-all border border-dashed border-emerald-500/30 mt-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ {t('nav.createShop')}</span>
              </button>
            </div>
          </div>

          {/* Section B: Dynamic Shops Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              <span>{t('nav.shopsSection')}</span>
              <span className="bg-sidebar-accent text-[10px] px-1.5 py-0.5 rounded-full text-sidebar-foreground/70">
                {shops.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {shops.map((shop) => {
                const isCurrentShopActive = location.pathname.startsWith(`/shops/${shop.id}`);
                const isOpen = openShopMenuId === shop.id || isCurrentShopActive;

                return (
                  <div key={shop.id} className="rounded-xl overflow-hidden bg-sidebar-accent/30">
                    {/* Shop Header Item */}
                    <button
                      type="button"
                      onClick={() => toggleShopSubmenu(shop.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium rounded-xl transition-colors',
                        isCurrentShopActive
                          ? 'bg-sidebar-accent text-emerald-400 font-semibold'
                          : 'text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Store className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{shop.name}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {/* Shop Submenu */}
                    {isOpen && (
                      <div className="pl-6 pr-2 py-1.5 space-y-1 bg-black/20 text-xs border-l-2 border-primary/40 ml-4 my-1">
                        <NavLink
                          to={`/shops/${shop.id}/dashboard`}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors',
                              isActive
                                ? 'bg-primary/20 text-emerald-300 font-semibold'
                                : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                            )
                          }
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>1. {t('nav.dashboard')}</span>
                        </NavLink>

                        <NavLink
                          to={`/shops/${shop.id}/sales`}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors',
                              isActive
                                ? 'bg-primary/20 text-emerald-300 font-semibold'
                                : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                            )
                          }
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>2. {t('nav.salesRecord')}</span>
                        </NavLink>

                        <NavLink
                          to={`/shops/${shop.id}/stock`}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors',
                              isActive
                                ? 'bg-primary/20 text-emerald-300 font-semibold'
                                : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                            )
                          }
                        >
                          <Boxes className="h-3.5 w-3.5" />
                          <span>3. {t('nav.stockRecord')}</span>
                        </NavLink>

                        <NavLink
                          to={`/shops/${shop.id}/sales-history`}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors',
                              isActive
                                ? 'bg-primary/20 text-emerald-300 font-semibold'
                                : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                            )
                          }
                        >
                          <History className="h-3.5 w-3.5" />
                          <span>4. {t('nav.recentSalesHistory')}</span>
                        </NavLink>

                        <NavLink
                          to={`/shops/${shop.id}/stock-history`}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors',
                              isActive
                                ? 'bg-primary/20 text-emerald-300 font-semibold'
                                : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                            )
                          }
                        >
                          <Boxes className="h-3.5 w-3.5" />
                          <span>5. {t('nav.stockHistory')}</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Area: User Profile, Language, Logout */}
        <div className="p-4 border-t border-sidebar-border bg-black/20 space-y-3">
          <div className="flex items-center justify-between">
            <LanguageToggle className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:text-white" />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              title={t('auth.logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-sidebar-border/50">
            <div className="p-2 rounded-full bg-sidebar-accent text-sidebar-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'অ্যাডমিন'}</p>
              <p className="text-[11px] text-muted-foreground truncate font-mono">{user?.phone || '০১৭xxxxxxxx'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title={t('auth.logout')}
        description={t('auth.logoutConfirm')}
        confirmText={t('auth.logout')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
      />
    </>
  );
};
