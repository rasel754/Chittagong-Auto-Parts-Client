import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { matchesMixedQuery } from '@/lib/search-utils';
import { Search, X, Check, Package, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductSearchSelectorProps {
  products: Product[];
  selectedProductId: string;
  onSelectProduct: (product: Product | null) => void;
  isEditMode?: boolean;
  initialProductId?: string;
  initialQuantitySold?: number;
  isLoading?: boolean;
  error?: string;
}

export const ProductSearchSelector: React.FC<ProductSearchSelectorProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  isEditMode = false,
  initialProductId,
  initialQuantitySold = 0,
  isLoading = false,
  error,
}) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find currently selected product
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  // Calculate available stock taking into account edit mode adjustment
  const getEffectiveStock = (product: Product): number => {
    const isThisInitialProduct = isEditMode && initialProductId === product.id;
    return (product.availableStock || 0) + (isThisInitialProduct ? initialQuantitySold : 0);
  };

  // Filter products by search term supporting mixed Bangla & English, and sort in-stock first
  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchTerm.trim()) {
      list = products.filter((p) =>
        matchesMixedQuery([p.name, p.sku, p.category], searchTerm)
      );
    }
    // Always prioritize in-stock items at the top
    return [...list].sort((a, b) => {
      const stockA = getEffectiveStock(a);
      const stockB = getEffectiveStock(b);
      const hasStockA = stockA > 0;
      const hasStockB = stockB > 0;
      if (hasStockA && !hasStockB) return -1;
      if (!hasStockA && hasStockB) return 1;
      if (stockB !== stockA) return stockB - stockA;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, searchTerm, isEditMode, initialProductId, initialQuantitySold]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (product: Product) => {
    const effStock = getEffectiveStock(product);
    if (effStock <= 0) return; // Prevent selection if completely out of stock
    onSelectProduct(product);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProduct(null);
    setSearchTerm('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-medium text-foreground">
        {t('sales.selectProduct')} <span className="text-destructive">*</span>
      </label>

      {/* Selected product card view (when selected and dropdown is closed) */}
      {selectedProduct && !isOpen ? (
        <div
          onClick={handleOpenDropdown}
          className="flex items-center justify-between p-2.5 rounded-lg border border-input bg-card hover:bg-accent/40 cursor-pointer transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedProduct.name}
                </p>
                {selectedProduct.sku && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-mono">
                    {selectedProduct.sku}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {t('sales.inStock')}: {formatQuantity(getEffectiveStock(selectedProduct), lang)}
                </span>
                {selectedProduct.sellingRate ? (
                  <span>
                    • {formatCurrency(selectedProduct.sellingRate, lang)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              title={t('common.clear') || 'Clear'}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenDropdown}
              className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
            >
              {t('sales.changeProduct')}
            </button>
          </div>
        </div>
      ) : (
        /* Search input view */
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={t('sales.searchProductPlaceholder')}
              className={`w-full h-10 pl-9 pr-9 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${
                error ? 'border-destructive' : 'border-input'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtered Dropdown list */}
          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>পণ্য লোড হচ্ছে...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground/70" />
                  <span>{t('sales.noProductsFound')}</span>
                  {searchTerm && (
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      "{searchTerm}" এর সাথে কোনো পণ্য মেলেনি
                    </p>
                  )}
                </div>
              ) : (
                <ul className="py-1 divide-y divide-border/40">
                  {filteredProducts.map((p) => {
                    const effStock = getEffectiveStock(p);
                    const isSelected = p.id === selectedProductId;
                    const isOutOfStock = effStock <= 0;

                    return (
                      <li
                        key={p.id}
                        onClick={() => !isOutOfStock && handleSelect(p)}
                        className={`px-3 py-2 flex items-center justify-between transition-colors ${
                          isOutOfStock
                            ? 'opacity-50 cursor-not-allowed bg-muted/20'
                            : isSelected
                            ? 'bg-primary/10 text-primary cursor-pointer'
                            : 'hover:bg-accent cursor-pointer'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {p.name}
                            </span>
                            {p.sku && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-mono">
                                {p.sku}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {p.sellingRate ? (
                              <span>
                                {t('stock.sellingRate')}: {formatCurrency(p.sellingRate, lang)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                              {t('sales.outOfStock')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            >
                              {t('sales.inStock')}: {formatQuantity(effStock, lang)}
                            </Badge>
                          )}
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};
