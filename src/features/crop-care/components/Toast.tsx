
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
    }
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/20 backdrop-blur-md text-emerald-300 border-emerald-500/30';
      case 'error':
        return 'bg-red-500/20 backdrop-blur-md text-red-300 border-red-500/30';
      case 'warning':
        return 'bg-orange-500/20 backdrop-blur-md text-orange-300 border-orange-500/30';
      case 'info':
        return 'bg-blue-500/20 backdrop-blur-md text-blue-300 border-blue-500/30';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-2 ${getToastStyles(toast.type)} animate-slide-down`}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <i className={`fas ${getToastIcon(toast.type)} text-lg`}></i>
            <p className="flex-1 font-medium text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
