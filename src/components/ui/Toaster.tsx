import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToasterContextType {
  showToast: (message: string, type: Toast['type']) => void;
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined);

export const useToaster = () => {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) {
        removeToast(toasts[0].id);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToasterContext.Provider>
  );
};

interface ToasterProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Simplified implementation without context for this example
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const portalElement = document.body;
  
  if (!portalElement) return null;

  return createPortal(
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[250px] max-w-sm ${
              toast.type === 'success' 
                ? 'bg-success-500 text-white' 
                : toast.type === 'error' 
                ? 'bg-error-500 text-white' 
                : 'bg-primary-500 text-white'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-white opacity-70 hover:opacity-100">
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    portalElement
  );
};

export default Toaster;