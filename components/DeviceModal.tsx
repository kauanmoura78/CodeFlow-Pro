
import React from 'react';
import { Theme } from '../types';
import { Monitor, Smartphone, X } from 'lucide-react';

interface DeviceModalProps {
  code: string;
  onClose: () => void;
  // Corrigido para aceitar o tipo do toast opcional
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  theme: Theme;
}

const DeviceModal: React.FC<DeviceModalProps> = ({ code, onClose, addToast, theme }) => {
  const execute = (mode: 'pc' | 'mobile') => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    if (mode === 'mobile') {
      window.open(url, '_blank', 'width=375,height=667,noopener,noreferrer');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    addToast(`Executando em modo ${mode === 'mobile' ? 'Mobile' : 'Desktop'}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-indigo-500/20 ${
          theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="relative p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-indigo-500/10 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>

          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Monitor className="text-indigo-400 w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Visualização</h2>
          <p className="text-sm text-slate-500 mb-8 px-4">Escolha como deseja visualizar o resultado do seu projeto.</p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => execute('pc')}
              className="group p-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 flex flex-col items-center gap-3 text-white shadow-lg shadow-indigo-600/20"
            >
              <Monitor size={32} />
              <div className="text-center">
                <div className="font-bold text-sm">Desktop</div>
                <div className="text-[10px] opacity-60">Full Window</div>
              </div>
            </button>

            <button 
              onClick={() => execute('mobile')}
              className="group p-6 rounded-3xl bg-violet-600 hover:bg-violet-500 transition-all duration-300 flex flex-col items-center gap-3 text-white shadow-lg shadow-violet-600/20"
            >
              <Smartphone size={32} />
              <div className="text-center">
                <div className="font-bold text-sm">Mobile</div>
                <div className="text-[10px] opacity-60">375 x 667</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;
