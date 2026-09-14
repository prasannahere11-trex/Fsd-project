import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-terracotta flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-ochre flex-shrink-0" />,
  };

  return (
    <div className="pointer-events-auto bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-xl shadow-modal p-3 flex items-center justify-between space-x-3 animate-slide-up">
      <div className="flex items-center space-x-2.5">
        {icons[toast.type]}
        <span className="text-xs font-medium text-ink-primary dark:text-darkink-primary">
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-ink-muted hover:text-ink-primary p-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
