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
import { Sale } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { Receipt, Printer, Store, Calendar, User, Phone, FileText } from 'lucide-react';

interface SaleDetailModalProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, open, onOpenChange }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t('sales.saleDetails')}</DialogTitle>
                <DialogDescription>
                  {t('sales.invoiceNo')}: <span className="font-mono font-semibold text-foreground">{sale.invoiceNo}</span>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Cash Memo Style Card */}
        <div className="rounded-xl border bg-muted/20 p-5 space-y-4 text-sm">
          {/* Shop Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Store className="h-4 w-4 text-primary" />
              <span>{sale.shopName || 'চট্টগ্রাম অটো পার্টস'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(sale.saleDate, lang)}</span>
            </div>
          </div>

          {/* Customer info if any */}
          {(sale.customerName || sale.customerPhone) && (
            <div className="grid grid-cols-2 gap-2 text-xs border-b pb-3">
              {sale.customerName && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">{sale.customerName}</span>
                </div>
              )}
              {sale.customerPhone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{sale.customerPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Item Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-foreground">{sale.productName}</p>
                {sale.sku && <p className="text-xs text-muted-foreground font-mono">SKU: {sale.sku}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {formatQuantity(sale.quantitySold, lang)} × {formatCurrency(sale.sellingRate, lang)}
                </p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>উপমোট (Subtotal):</span>
                <span>{formatCurrency(sale.quantitySold * sale.sellingRate, lang)}</span>
              </div>
              {sale.discount ? (
                <div className="flex justify-between text-destructive">
                  <span>ডিসকাউন্ট (Discount):</span>
                  <span>- {formatCurrency(sale.discount, lang)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                <span>{t('sales.totalSellingPrice')}:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {formatCurrency(sale.totalSellingPrice, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="pt-2 border-t flex items-start gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{sale.notes}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            প্রিন্ট / চালান
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
