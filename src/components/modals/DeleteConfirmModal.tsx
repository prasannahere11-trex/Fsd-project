import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-ink-primary/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-modal p-6 text-center animate-slide-up z-10">
          <div className="w-12 h-12 rounded-full bg-terracotta-surface dark:bg-terracotta/20 text-terracotta mx-auto flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-ink-primary dark:text-darkink-primary mb-1">
            {title}
          </h3>
          <p className="text-xs text-ink-secondary dark:text-darkink-secondary mb-5 leading-relaxed">
            {message}
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2 text-xs font-medium text-ink-secondary dark:text-darkink-secondary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 bg-terracotta hover:bg-terracotta-dark text-paper-light rounded-xl text-xs font-medium shadow-subtle transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
