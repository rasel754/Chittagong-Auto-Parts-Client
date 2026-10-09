import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/20 my-4 ${
        className || ''
      }`}
    >
      <div className="p-4 rounded-full bg-muted/60 text-muted-foreground mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default" size="sm" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
