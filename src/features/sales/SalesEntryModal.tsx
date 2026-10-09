import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { getTodayDateString } from '@/lib/date';
import { Shop, Product, Sale } from '@/types';
import { ShoppingCart, Calculator, AlertCircle, Edit3 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const saleSchema = z.object({
  shopId: z.string().min(1, 'দোকান আবশ্যক'),
  productId: z.string().min(1, 'পণ্য নির্বাচন করুন'),
  quantitySold: z
    .number({ invalid_type_error: 'সঠিক সংখ্যা লিখুন' })
    .positive('বিক্রয় পরিমাণ ১ বা তার বেশি হতে হবে'),
  sellingRate: z
    .number({ invalid_type_error: 'সঠিক মূল্য লিখুন' })
    .positive('বিক্রয়মূল্য ধনাত্মক হতে হবে'),
  discount: z.number().min(0, 'ডিসকাউন্ট ০ বা তার বেশি হতে হবে').optional(),
  saleDate: z.string().min(1, 'তারিখ আবশ্যক'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SalesEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultShopId?: string;
  shops: Shop[];
  initialData?: Sale | null;
}

export const SalesEntryModal: React.FC<SalesEntryModalProps> = ({
  open,
  onOpenChange,
  defaultShopId,
  shops,
  initialData,
}) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<SaleFormData | null>(null);

  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      shopId: defaultShopId || (shops[0]?.id || ''),
      productId: '',
      quantitySold: 1,
      sellingRate: 0,
      discount: 0,
      saleDate: getTodayDateString(),
      customerName: '',
      customerPhone: '',
      notes: '',
    },
  });

  const selectedShopId = watch('shopId');
  const selectedProductId = watch('productId');
  const quantitySold = watch('quantitySold') || 0;
  const sellingRate = watch('sellingRate') || 0;
  const discount = watch('discount') || 0;

  // Fetch products for selected shop
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', selectedShopId],
    queryFn: () => api.getProducts(selectedShopId),
    enabled: open && !!selectedShopId,
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Sync form data on open / edit
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          shopId: initialData.shopId,
          productId: initialData.productId,
          quantitySold: initialData.quantitySold,
          sellingRate: initialData.sellingRate,
          discount: initialData.discount || 0,
          saleDate: initialData.saleDate ? initialData.saleDate.slice(0, 10) : getTodayDateString(),
          customerName: initialData.customerName || '',
          customerPhone: initialData.customerPhone || '',
          notes: initialData.notes || '',
        });
      } else {
        reset({
          shopId: defaultShopId || (shops[0]?.id || ''),
          productId: '',
          quantitySold: 1,
          sellingRate: 0,
          discount: 0,
          saleDate: getTodayDateString(),
          customerName: '',
          customerPhone: '',
          notes: '',
        });
      }
    }
  }, [open, initialData, defaultShopId, shops, reset]);

  // When product changes in create mode, prefill default selling rate
  useEffect(() => {
    if (selectedProduct && !isEditMode) {
      setValue('sellingRate', selectedProduct.sellingRate || 0);
    }
  }, [selectedProduct, isEditMode, setValue]);

  const effectiveAvailableStock = selectedProduct
    ? selectedProduct.availableStock + (isEditMode && initialData?.productId === selectedProduct.id ? initialData.quantitySold : 0)
    : 0;

  const calculatedTotal = Math.max(0, quantitySold * sellingRate - discount);
  const isStockInsufficient = selectedProduct
    ? quantitySold > effectiveAvailableStock
    : false;

  const mutation = useMutation({
    mutationFn: (data: SaleFormData) => {
      if (isEditMode && initialData) {
        return api.updateSale(initialData.id, data);
      }
      return api.createSale(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(isEditMode ? t('sales.updateSuccess') : t('sales.successMessage'));
      reset();
      setShowConfirm(false);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(t('common.errorOccurred'), err.message || (isEditMode ? 'বিক্রয় আপডেট করা যায়নি' : 'বিক্রয় সম্পন্ন করা যায়নি'));
      setShowConfirm(false);
    },
  });

  const onPreSubmit = (data: SaleFormData) => {
    if (isStockInsufficient) {
      toast.error(
        t('sales.insufficientStock'),
        `${formatQuantity(effectiveAvailableStock, lang)}`
      );
      return;
    }
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = () => {
    if (pendingData) {
      mutation.mutate(pendingData);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
          <form onSubmit={handleSubmit(onPreSubmit)}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  {isEditMode ? <Edit3 className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
                </div>
                <div>
                  <DialogTitle>{isEditMode ? t('sales.editTitle') : t('sales.entryTitle')}</DialogTitle>
                  <DialogDescription>{t('sales.title')}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Shop selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t('stock.selectShop')} <span className="text-destructive">*</span>
                  </label>
                  <select
                    {...register('shopId')}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label={t('sales.saleDate')}
                  type="date"
                  required
                  {...register('saleDate')}
                  error={errors.saleDate?.message}
                />
              </div>

              {/* Product Selector with available units */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  {t('sales.selectProduct')} <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('productId')}
                  className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                >
                  <option value="">{t('sales.selectProductPlaceholder')}</option>
                  {products.map((p) => {
                    const avail = p.availableStock + (isEditMode && initialData?.productId === p.id ? initialData.quantitySold : 0);
                    return (
                      <option key={p.id} value={p.id} disabled={avail <= 0}>
                        {p.name} {p.sku ? `(${p.sku})` : ''} — [মজুদ: {formatQuantity(avail, lang)}]
                      </option>
                    );
                  })}
                </select>
                {errors.productId && (
                  <p className="text-xs text-destructive">{errors.productId.message}</p>
                )}
              </div>

              {/* Stock Warning if low or exceeded */}
              {selectedProduct && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                    isStockInsufficient
                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : 'bg-muted/40 text-muted-foreground border-border'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    বর্তমান মজুদ: <strong>{formatQuantity(effectiveAvailableStock, lang)}</strong>
                    {isStockInsufficient && ' — পর্যাপ্ত স্টক নেই!'}
                  </span>
                </div>
              )}

              {/* Quantity, Rate & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={t('sales.quantitySold')}
                  type="number"
                  min="1"
                  step="1"
                  required
                  {...register('quantitySold', { valueAsNumber: true })}
                  error={
                    errors.quantitySold?.message ||
                    (isStockInsufficient ? t('sales.insufficientStock') : undefined)
                  }
                />
                <Input
                  label={t('sales.sellingRate')}
                  type="number"
                  min="0"
                  step="any"
                  required
                  {...register('sellingRate', { valueAsNumber: true })}
                  error={errors.sellingRate?.message}
                />
                <Input
                  label={t('sales.discount')}
                  type="number"
                  min="0"
                  step="any"
                  {...register('discount', { valueAsNumber: true })}
                  error={errors.discount?.message}
                />
              </div>

              {/* Calculated Total Price */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                  <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium">{t('sales.totalSellingPrice')}:</span>
                </div>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(calculatedTotal, lang)}
                </span>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('sales.customerName')}
                  placeholder={t('sales.customerNamePlaceholder')}
                  {...register('customerName')}
                  error={errors.customerName?.message}
                />
                <Input
                  label={t('sales.customerPhone')}
                  placeholder={t('sales.customerPhonePlaceholder')}
                  {...register('customerPhone')}
                  error={errors.customerPhone?.message}
                />
              </div>

              <Input
                label={t('sales.notes')}
                placeholder={t('sales.notes')}
                {...register('notes')}
                error={errors.notes?.message}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                isLoading={mutation.isPending}
                disabled={isStockInsufficient}
              >
                {isEditMode ? t('sales.updateBtn') : t('sales.submitBtn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={isEditMode ? t('sales.editTitle') : t('sales.confirmSale')}
        description={`${selectedProduct?.name || 'পণ্য'} (${pendingData?.quantitySold || 0} পিস) - সর্বমোট বিক্রয়মূল্য ${formatCurrency(
          calculatedTotal,
          lang
        )} ${isEditMode ? 'আপডেট করতে চান?' : 'রেকর্ড করতে চান?'}`}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmedSubmit}
        isLoading={mutation.isPending}
      />
    </>
  );
};
