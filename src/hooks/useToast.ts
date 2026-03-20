import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

const DEFAULT_DURATION = 4000;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    title: string,
    options?: {
      type?: ToastType;
      description?: string;
      duration?: number;
    }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = options?.duration ?? DEFAULT_DURATION;

    const toast: Toast = {
      id,
      type: options?.type ?? 'info',
      title,
      description: options?.description,
      duration,
    };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((
    title: string,
    description?: string
  ) => {
    return addToast(title, { type: 'success', description });
  }, [addToast]);

  const error = useCallback((
    title: string,
    description?: string
  ) => {
    return addToast(title, { type: 'error', description });
  }, [addToast]);

  const warning = useCallback((
    title: string,
    description?: string
  ) => {
    return addToast(title, { type: 'warning', description });
  }, [addToast]);

  const info = useCallback((
    title: string,
    description?: string
  ) => {
    return addToast(title, { type: 'info', description });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
