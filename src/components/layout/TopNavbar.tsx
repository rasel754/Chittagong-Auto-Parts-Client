import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Menu,
  ShoppingCart,
  Boxes,
  Store,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { StockEntryModal } from '@/features/stock/StockEntryModal';
import { SalesEntryModal } from '@/features/sales/SalesEntryModal';
import { CreateShopModal } from '@/features/shops/CreateShopModal';
import { Shop } from '@/types';

interface TopNavbarProps {
  shops: Shop[];
  onOpenMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ shops, onOpenMobileMenu }) => {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId?: string }>();

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const activeShop = shops.find((s) => s.id === shopId);

  return (
    <>
      <header className="h-16 border-b bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left Section: Mobile Menu Toggle & Title / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {activeShop ? (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {activeShop.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">
                    {activeShop.address || activeShop.code || 'সক্রিয় শাখা'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {t('nav.commonDashboard')}
                  </h2>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">
                    সকল দোকানের সমন্বিত ওভারভিউ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Quick Action Buttons & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Stock Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsStockModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            <Boxes className="h-4 w-4 text-emerald-600" />
            <span>+ {t('nav.addStock')}</span>
          </Button>

          {/* Quick Record Sale Button */}
          <Button
            size="sm"
            onClick={() => setIsSalesModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden xs:inline">{t('nav.recordSale')}</span>
            <span className="xs:hidden">+ বিক্রয়</span>
          </Button>

          <LanguageToggle className="hidden md:inline-flex" />
        </div>
      </header>

      {/* Global Quick Action Modals */}
      <StockEntryModal
        open={isStockModalOpen}
        onOpenChange={setIsStockModalOpen}
        defaultShopId={shopId || shops[0]?.id}
        shops={shops}
      />

      <SalesEntryModal
        open={isSalesModalOpen}
        onOpenChange={setIsSalesModalOpen}
        defaultShopId={shopId || shops[0]?.id}
        shops={shops}
      />

      <CreateShopModal />
    </>
  );
};
