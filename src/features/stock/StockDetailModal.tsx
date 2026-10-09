import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StockEntry } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { Boxes, Printer, Store, Calendar, Truck, FileText } from 'lucide-react';

interface StockDetailModalProps {
  entry: StockEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ entry, open, onOpenChange }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  if (!entry) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t('stock.entryDetails')}</DialogTitle>
                <DialogDescription>
                  {t('stock.title')}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Stock Memo Style Card */}
        <div className="rounded-xl border bg-muted/20 p-5 space-y-4 text-sm">
          {/* Shop Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Store className="h-4 w-4 text-primary" />
              <span>{entry.shopName || 'চট্টগ্রাম অটো পার্টস'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(entry.entryDate, lang)}</span>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="flex items-center gap-2 text-xs border-b pb-3 text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{entry.supplierName}</span>
          </div>

          {/* Item Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-foreground">{entry.productName}</p>
                {entry.sku && <p className="text-xs text-muted-foreground font-mono">SKU: {entry.sku}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {formatQuantity(entry.quantityReceived, lang)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ক্রয়দর: {formatCurrency(entry.buyingRate, lang)}
                </p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>বিক্রয়দর (Selling Rate):</span>
                <span className="text-emerald-600 font-semibold">{formatCurrency(entry.sellingRate, lang)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                <span>{t('stock.totalPurchaseValue')}:</span>
                <span className="text-primary font-extrabold">
                  {formatCurrency(entry.totalPurchaseValue, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="pt-2 border-t flex items-start gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{entry.notes}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            প্রিন্ট
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
