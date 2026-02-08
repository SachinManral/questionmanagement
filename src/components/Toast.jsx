import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
    
  clearAll: () => set({ toasts: [] }),
}));

// Toast Component with Dark Glass Theme
export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-success/10 border-success/30',
      icon: CheckCircle,
      iconColor: 'text-success',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      icon: XCircle,
      iconColor: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      icon: AlertCircle,
      iconColor: 'text-yellow-400',
    },
    info: {
      bg: 'bg-primary/10 border-primary/30',
      icon: Info,
      iconColor: 'text-primary',
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bg}
        backdrop-blur-md
        border
        px-4 py-3 rounded-lg shadow-2xl
        flex items-center gap-3 
        min-w-[300px] max-w-md
        animate-slide-in-right
        text-slate-200
      `}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};