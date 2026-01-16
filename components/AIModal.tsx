
import React, { useState, useEffect } from 'react';
import { Theme } from '../types';
import { analyzeCode } from '../services/geminiService';
import { Sparkles, X, Check, RefreshCw, AlertTriangle } from 'lucide-react';

interface AIModalProps {
  task: 'optimize' | 'explain';
  code: string;
  onClose: () => void;
  onApply: (newCode: string) => void;
  theme: Theme;
}

const AIModal: React.FC<AIModalProps> = ({ task, code, onClose, onApply, theme }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAI = async () => {
    if (!code.trim()) {
      setError("O editor está vazio. Insira algum código primeiro.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Timeout de segurança de 30 segundos
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("A requisição demorou muito. Verifique sua conexão ou tente novamente.");
        setLoading(false);
      }
    }, 30000);

    try {
      const output = await analyzeCode(code, task);
      clearTimeout(timeoutId);
      setResult(output || "Nenhuma resposta gerada.");
    } catch (err: any) {
      clearTimeout(timeoutId);
      setError(err.message || "Erro inesperado ao conectar com a IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAI();
  }, [task]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-indigo-500/20 flex flex-col max-h-[85vh] ${
          theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <div className={`p-6 border-b border-indigo-500/10 flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/60' : 'bg-indigo-500/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Gemini AI</h2>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {task === 'optimize' ? 'Otimização' : 'Explicação'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-500/10 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
              <p className="text-sm font-semibold opacity-60">Processando com Inteligência Artificial...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-rose-500 mb-6">{error}</p>
              <button 
                onClick={fetchAI}
                className="px-6 py-3 bg-rose-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`p-6 rounded-3xl code-font text-sm leading-relaxed whitespace-pre-wrap ${
                theme === 'dark' ? 'bg-slate-950/60 text-indigo-100' : 'bg-white border border-indigo-500/10 text-slate-700'
              }`}>
                {result}
              </div>
            </div>
          )}
        </div>

        {!loading && !error && (
          <div className="p-6 border-t border-indigo-500/10 flex justify-end gap-3 bg-opacity-50">
            <button 
              onClick={onClose}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'
              }`}
            >
              Fechar
            </button>
            {task === 'optimize' && (
              <button 
                onClick={() => onApply(result || '')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold flex items-center gap-2 shadow-xl shadow-emerald-500/20"
              >
                <Check size={18} />
                Aplicar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModal;
