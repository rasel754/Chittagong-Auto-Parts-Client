import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './button';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
  triggerClassName?: string;
  title?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  align = 'right',
  triggerClassName = '',
  title = 'অ্যাকশন মেনু',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 150;
    const menuHeight = items.length * 36 + 12;

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    // Check if space below is enough, else show above
    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight - 10 && rect.top - menuHeight > 10) {
      top = rect.top - menuHeight - 6;
    }

    setPosition({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <Button
        ref={triggerRef}
        size="sm"
        variant="ghost"
        type="button"
        className={`h-8 w-8 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center ${triggerClassName}`}
        onClick={handleToggle}
        title={title}
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">{title}</span>
      </Button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: '150px',
              zIndex: 99999,
            }}
            className="rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-75"
            role="menu"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${
                  item.variant === 'destructive'
                    ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                role="menuitem"
              >
                {item.icon && <span className="h-4 w-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};
