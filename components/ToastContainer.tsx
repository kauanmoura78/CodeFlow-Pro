
import React from 'react';
import { ToastType } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastType[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-[1.25rem] shadow-2xl animate-in slide-in-from-right-full duration-300 border backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-400/30' 
              : toast.type === 'error'
              ? 'bg-rose-500 text-white border-rose-400/30'
              : 'bg-indigo-600 text-white border-indigo-400/30'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
