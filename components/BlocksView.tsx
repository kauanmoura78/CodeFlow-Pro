
import React from 'react';
import { CodeStorage, Theme } from '../types';
import { splitIntoBlocks } from '../services/codeUtils';
import { Copy, Hash, Braces, Zap, FileCode, Check } from 'lucide-react';

interface BlocksViewProps {
  storage: CodeStorage;
  charLimit: number;
  // Corrigido para aceitar o tipo do toast opcional
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  theme: Theme;
}

const BlocksView: React.FC<BlocksViewProps> = ({ storage, charLimit, addToast, theme }) => {
  const sections = [
    { key: 'complete', label: 'Completo', icon: <FileCode size={16} />, color: 'indigo' },
    { key: 'html', label: 'HTML', icon: <Hash size={16} />, color: 'orange' },
    { key: 'css', label: 'CSS', icon: <Braces size={16} />, color: 'blue' },
    { key: 'js', label: 'JS', icon: <Zap size={16} />, color: 'yellow' }
  ] as const;

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    addToast(`Bloco ${index + 1} copiado!`);
  };

  return (
    <div className="flex-1 overflow-x-auto no-scrollbar pb-2">
      <div className="flex h-full gap-6 min-w-max md:min-w-0">
        {sections.map((section) => {
          const blocks = splitIntoBlocks(storage[section.key], charLimit);
          return (
            <div key={section.key} className="flex-1 w-80 md:w-auto glass-panel rounded-3xl overflow-hidden flex flex-col h-full shadow-lg">
              <div className={`flex items-center justify-between px-5 py-4 border-b border-indigo-500/10 ${
                theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-200/20'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-${section.color}-500`}>{section.icon}</span>
                  <h3 className="font-bold text-xs uppercase tracking-widest">{section.label}</h3>
                </div>
                <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                  {blocks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {blocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                    <Check size={24} />
                    <p className="text-[10px] font-bold mt-2">Vazio</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <div 
                      key={block.index}
                      onClick={() => handleCopy(block.content, block.index)}
                      className={`group p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        theme === 'dark' 
                          ? 'bg-slate-900/40 border-indigo-500/5 hover:bg-slate-900/80 hover:border-indigo-500/30' 
                          : 'bg-white border-indigo-500/10 hover:shadow-md hover:border-indigo-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase">Bloco {block.index + 1}</span>
                        <Copy size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="code-font text-[10px] text-slate-500 leading-relaxed overflow-hidden line-clamp-3 break-all opacity-70">
                        {block.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlocksView;
