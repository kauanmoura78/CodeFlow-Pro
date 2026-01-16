
import React from 'react';
import { Theme, CodeBlock } from '../types';
import { splitIntoBlocks } from '../services/codeUtils';
import { Settings, Box, ChevronRight, Hash } from 'lucide-react';

interface SidebarProps {
  code: string;
  charLimit: number;
  setCharLimit: (limit: number) => void;
  currentTab: string;
  // Corrigido para aceitar o tipo do toast opcional
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  theme: Theme;
}

const Sidebar: React.FC<SidebarProps> = ({ code, charLimit, setCharLimit, currentTab, addToast, theme }) => {
  const blocks = splitIntoBlocks(code, charLimit);

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    addToast(`Bloco ${index + 1} copiado!`);
  };

  return (
    <aside className="hidden lg:flex w-80 flex-col gap-6">
      <div className="glass-panel rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <Settings size={18} className="text-indigo-400" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Configurações</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Caracteres por Bloco
            </label>
            <input 
              type="number" 
              value={charLimit}
              onChange={(e) => setCharLimit(Math.max(100, parseInt(e.target.value) || 0))}
              className={`w-full px-4 py-3 rounded-2xl text-sm code-font outline-none border transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-900/50 border-indigo-500/10 focus:border-indigo-500/40 text-white' 
                  : 'bg-white border-indigo-500/20 focus:border-indigo-500/60 text-slate-900'
              }`}
            />
            <p className="text-[10px] text-slate-500 mt-2 italic">Recomendado: 4000 para LLMs</p>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl p-6 shadow-xl flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Box size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Preview</h3>
          </div>
          <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full">
            {blocks.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {blocks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500/30">
              <Hash size={32} />
              <p className="text-[10px] font-bold uppercase mt-2">Vazio</p>
            </div>
          ) : (
            blocks.map((block) => (
              <div 
                key={block.index}
                onClick={() => handleCopy(block.content, block.index)}
                className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-slate-900/30 border-indigo-500/5 hover:bg-slate-900/60 hover:border-indigo-500/20' 
                    : 'bg-white border-indigo-500/10 hover:shadow-md hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {block.index + 1}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter line-clamp-1 opacity-60">
                      {block.content.substring(0, 20)}...
                    </div>
                    <div className="text-[8px] font-medium text-indigo-400/60 uppercase">
                      {block.chars} chars
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
