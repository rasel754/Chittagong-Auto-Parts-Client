import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const duration = toast.duration || 4000;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, description?: string) =>
    useToast.getState().addToast({ type: 'success', message, description }),
  error: (message: string, description?: string) =>
    useToast.getState().addToast({ type: 'error', message, description }),
  info: (message: string, description?: string) =>
    useToast.getState().addToast({ type: 'info', message, description }),
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl bg-card text-card-foreground animate-in slide-in-from-bottom-4 duration-200',
            item.type === 'success' && 'border-emerald-500/30 bg-emerald-50/90 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-100',
            item.type === 'error' && 'border-destructive/30 bg-rose-50/90 text-rose-950 dark:bg-rose-950/80 dark:text-rose-100',
            item.type === 'info' && 'border-blue-500/30 bg-blue-50/90 text-blue-950 dark:bg-blue-950/80 dark:text-blue-100'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {item.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            {item.type === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
            {item.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold leading-tight">{item.message}</p>
            {item.description && <p className="text-xs opacity-90 mt-1">{item.description}</p>}
          </div>
          <button
            onClick={() => removeToast(item.id)}
            className="text-muted-foreground hover:text-foreground shrink-0 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
