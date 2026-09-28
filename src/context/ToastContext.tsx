import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: string | ToastOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((options: string | ToastOptions) => {
    const opts: ToastOptions = typeof options === 'string' ? { message: options, type: 'success' } : options;
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      id,
      title: opts.title,
      message: opts.message,
      type: opts.type || 'success',
      duration: opts.duration ?? 4500,
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }
  }, [dismissToast]);

  const showSuccess = useCallback((message: string, title: string = 'Success') => {
    showToast({ message, title, type: 'success' });
  }, [showToast]);

  const showError = useCallback((message: string, title: string = 'Error') => {
    showToast({ message, title, type: 'error' });
  }, [showToast]);

  const showInfo = useCallback((message: string, title: string = 'Information') => {
    showToast({ message, title, type: 'info' });
  }, [showToast]);

  const showWarning = useCallback((message: string, title: string = 'Warning') => {
    showToast({ message, title, type: 'warning' });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning, dismissToast }}>
      {children}

      {/* Floating Global Toast Stack */}
      <div 
        aria-live="polite"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success' || !toast.type;
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto rounded-lg shadow-xl border p-3.5 flex items-start gap-3 transition-all transform duration-300 animate-in fade-in slide-in-from-top-4 ${
                isSuccess
                  ? 'bg-white border-emerald-500/30 text-slate-800 shadow-emerald-900/10'
                  : isError
                  ? 'bg-white border-rose-500/30 text-slate-800 shadow-rose-900/10'
                  : isWarning
                  ? 'bg-white border-amber-500/30 text-slate-800 shadow-amber-900/10'
                  : 'bg-white border-sky-500/30 text-slate-800 shadow-sky-900/10'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : isError
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : isWarning
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-sky-50 text-sky-600 border border-sky-200'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isError && <AlertCircle className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {isInfo && <Info className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className={`text-xs font-bold leading-none mb-1 ${
                    isSuccess ? 'text-emerald-800' : isError ? 'text-rose-800' : isWarning ? 'text-amber-800' : 'text-sky-800'
                  }`}>
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 font-medium leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded transition-colors shrink-0 cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
