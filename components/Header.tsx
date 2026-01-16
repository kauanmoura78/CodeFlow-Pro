
import React from 'react';
import { Theme } from '../types';
import { 
  FileUp, 
  Trash2, 
  Play, 
  Copy, 
  Sun, 
  Moon, 
  Download,
  Layout
} from 'lucide-react';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onFileLoad: (content: string, fileName: string) => void;
  onClear: () => void;
  onExecute: () => void;
  onSave: () => void;
  code: string;
  // Atualizado para usar os tipos literais específicos em vez de any
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, 
  setTheme, 
  onFileLoad, 
  onClear, 
  onExecute, 
  onSave,
  code,
  addToast
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onFileLoad(event.target?.result as string, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleCopyAll = () => {
    if (!code.trim()) {
      addToast('Nenhum código para copiar', 'error');
      return;
    }
    navigator.clipboard.writeText(code);
    addToast('Código copiado para a área de transferência!');
  };

  const btnClass = "px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 active:scale-95";
  const actionBtn = `${btnClass} ${theme === 'dark' ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400' : 'bg-slate-300/50 hover:bg-slate-300/80 text-slate-700'}`;
  const deleteBtn = `${btnClass} ${theme === 'dark' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-rose-100 hover:bg-rose-200 text-rose-600'}`;
  const primaryBtn = `${btnClass} bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20`;

  return (
    <header className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-indigo-500/10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl">
          <Layout className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">CodeFlow <span className="text-indigo-500">Pro</span></h1>
          <p className="text-xs text-indigo-400/80 font-medium">Produzido por Kauan Moura</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <label className={actionBtn + " cursor-pointer"}>
          <FileUp size={18} />
          <span>Carregar</span>
          <input type="file" onChange={handleFileUpload} className="hidden" accept=".html,.css,.js,.txt" />
        </label>

        <button onClick={handleCopyAll} className={actionBtn}>
          <Copy size={18} />
          <span>Copiar</span>
        </button>

        <button onClick={onSave} className={`${actionBtn} border border-indigo-500/20`}>
          <Download size={18} className="text-indigo-500" />
          <span>Salvar</span>
        </button>

        <button onClick={onExecute} className={primaryBtn}>
          <Play size={18} fill="currentColor" />
          <span>Executar</span>
        </button>

        <div className="w-px h-8 bg-indigo-500/10 mx-1 hidden md:block"></div>

        <button onClick={onClear} className={deleteBtn} title="Limpar Editor">
          <Trash2 size={18} />
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`${actionBtn} ${theme === 'dark' ? 'text-yellow-400' : 'text-slate-600'}`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
