import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'amber' | 'blue' | 'purple';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'bg-card text-card-foreground',
    primary: 'bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/20 text-emerald-950 dark:text-emerald-50',
    amber: 'bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/20',
    blue: 'bg-gradient-to-br from-blue-500/10 via-card to-card border-blue-500/20',
    purple: 'bg-gradient-to-br from-purple-500/10 via-card to-card border-purple-500/20',
  };

  const iconBgStyles = {
    default: 'bg-muted text-foreground',
    primary: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card className={cn('relative overflow-hidden border shadow-sm transition-all hover:shadow-md', variantStyles[variant], className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground line-clamp-1">{title}</p>
          <div className={cn('p-2.5 rounded-xl shrink-0 ml-2', iconBgStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    'font-medium px-1.5 py-0.5 rounded text-[11px]',
                    trend.isPositive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  )}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && <span className="truncate">{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
