
import React, { useState } from 'react';
import { Theme, CodeStorage } from '../types';
import { X, Download, FileCode, Hash, Braces, Zap, Save } from 'lucide-react';

interface SaveModalProps {
  storage: CodeStorage;
  onClose: () => void;
  // Corrigido para aceitar o tipo do toast opcional, resolvendo o erro de múltiplos argumentos na chamada
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  theme: Theme;
}

const SaveModal: React.FC<SaveModalProps> = ({ storage, onClose, addToast, theme }) => {
  const [fileName, setFileName] = useState('projeto-codeflow');

  const downloadFile = (content: string, extension: string, mimeType: string) => {
    if (!content.trim()) {
      addToast('Este módulo está vazio.', 'error');
      return;
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast(`${fileName}.${extension} baixado com sucesso!`);
  };

  const options = [
    { 
      id: 'complete', 
      label: 'Arquivo Único (Bundle)', 
      desc: 'HTML + CSS + JS em um só arquivo',
      icon: <FileCode className="text-indigo-500" />, 
      ext: 'html', 
      mime: 'text/html',
      code: storage.complete 
    },
    { 
      id: 'html', 
      label: 'Apenas Estrutura', 
      desc: 'Somente o código HTML limpo',
      icon: <Hash className="text-orange-500" />, 
      ext: 'html', 
      mime: 'text/html',
      code: storage.html 
    },
    { 
      id: 'css', 
      label: 'Apenas Estilos', 
      desc: 'Somente as regras CSS',
      icon: <Braces className="text-blue-500" />, 
      ext: 'css', 
      mime: 'text/css',
      code: storage.css 
    },
    { 
      id: 'js', 
      label: 'Apenas Lógica', 
      desc: 'Somente os scripts JavaScript',
      icon: <Zap className="text-yellow-500" />, 
      ext: 'js', 
      mime: 'text/javascript',
      code: storage.js 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-indigo-500/20 ${
          theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-indigo-500/10 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Save className="text-indigo-400 w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center">Salvar Projeto</h2>
          <p className="text-sm text-slate-500 mb-8 text-center px-4">
            Escolha como deseja exportar o seu código do editor.
          </p>

          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Nome do Arquivo
            </label>
            <input 
              type="text" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Digite o nome..."
              className={`w-full px-5 py-3 rounded-2xl text-sm outline-none border transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-950/50 border-indigo-500/10 focus:border-indigo-500/40 text-white' 
                  : 'bg-slate-100 border-indigo-500/10 focus:border-indigo-500/30 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((opt) => (
              <button 
                key={opt.id}
                onClick={() => downloadFile(opt.code, opt.ext, opt.mime)}
                className={`group p-4 rounded-3xl border text-left transition-all duration-300 flex items-start gap-4 ${
                  theme === 'dark'
                    ? 'bg-slate-950/30 border-indigo-500/5 hover:border-indigo-500/30 hover:bg-slate-950/50'
                    : 'bg-slate-50 border-indigo-500/5 hover:border-indigo-500/20 hover:bg-indigo-50/50'
                }`}
              >
                <div className="p-3 rounded-xl bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors">
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-0.5">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
                </div>
                <Download size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors mt-1" />
              </button>
            ))}
          </div>

          <button 
            onClick={onClose}
            className={`w-full mt-8 py-4 rounded-2xl text-sm font-bold transition-all ${
              theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            Voltar ao Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
