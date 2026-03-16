'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  onClose: (id: string) => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-100',
    titleColor: 'text-green-300',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-100',
    titleColor: 'text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-100',
    titleColor: 'text-yellow-300',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-100',
    titleColor: 'text-blue-300',
  },
};

export function Toast({
  id,
  type,
  title,
  description,
  onClose,
  duration = 4000,
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
        'animate-in fade-in slide-in-from-right-2 duration-300',
        config.bgColor,
        config.borderColor
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-sm', config.titleColor)}>
          {title}
        </p>
        {description && (
          <p className={cn('text-sm mt-1', config.textColor)}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className={cn(
          'flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors',
          config.textColor
        )}
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
