
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Theme, CodeStorage, Message, CodeType, ChatSession } from '../types';
import { Send, Bot, User, Sparkles, Trash2, Plus, Menu, Globe, Zap, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ChatMessage = React.memo(({ msg, theme, onApply, renderContent }: { 
  msg: Message, theme: Theme, onApply: (c: string) => void, renderContent: (c: string) => React.ReactNode 
}) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-1 duration-300`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isUser ? 'bg-indigo-600' : 'bg-slate-800 border border-emerald-500/30'}`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-emerald-400" />}
      </div>
      <div className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-[13px] shadow-sm ${
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-none'
          : theme === 'dark' 
            ? 'bg-slate-900/90 text-indigo-50 border border-indigo-500/10 rounded-tl-none' 
            : 'bg-white text-slate-700 border border-indigo-500/10 rounded-tl-none'
      }`}>
        {renderContent(msg.content)}
        <div className={`text-[8px] mt-2 opacity-30 font-black uppercase ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});

interface ChatViewProps {
  storage: CodeStorage;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  onApplyCode: (code: string, type: CodeType) => void;
  theme: Theme;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  storage, sessions, setSessions, activeSessionId, setActiveSessionId, onApplyCode, theme, addToast 
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Assume conectado inicialmente
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  const input = activeSession?.draft || '';

  const setInput = useCallback((val: string) => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, draft: val } : s
    ));
  }, [activeSessionId, setSessions]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, isTyping]);

  const handleConnect = async () => {
    try {
      if (typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
        setIsConnected(true);
        addToast('Maki Bridge: Conexão Estabelecida', 'success');
      } else {
        // Fallback para quando o seletor não está disponível
        addToast('Aguardando configuração de API_KEY no Netlify...', 'info');
      }
    } catch (e) {
      addToast('Falha na autenticação.', 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const currentKey = process.env.API_KEY;
    if (!currentKey) {
      setIsConnected(false);
      return;
    }

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const newTitle = s.messages.length === 0 ? input.substring(0, 30) + (input.length > 30 ? '...' : '') : s.title;
        return { ...s, title: newTitle, draft: '', messages: [...s.messages, userMessage] };
      }
      return s;
    }));
    
    setIsTyping(true);

    try {
      // Cria uma nova instância do SDK usando a chave atual do ambiente
      const ai = new GoogleGenAI({ apiKey: currentKey });
      
      const systemPrompt = `Você é Maki, Sênior Dev. 
      Responda de forma técnica e direta. 
      Se o usuário pedir código, use blocos de código markdown.
      Atualmente o projeto tem: HTML(${storage.html.length} chars), CSS(${storage.css.length}), JS(${storage.js.length}).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...activeSession.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: { 
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "Maki ficou offline. Tente reenviar.",
        timestamp: new Date()
      };

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMessage] } : s
      ));
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('401') || error.message?.includes('not found')) {
        setIsConnected(false);
        addToast('Chave expirada ou inválida.', 'error');
      } else {
        addToast('Erro na rede neural da Maki.', 'error');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyCode = useCallback((content: string) => {
    let type: CodeType = 'html';
    const c = content.toLowerCase();
    if (c.includes('document.') || c.includes('function')) type = 'js';
    else if (c.includes('{') && c.includes(':')) type = 'css';
    onApplyCode(content, type);
    addToast(`Injetado em ${type.toUpperCase()}`);
  }, [onApplyCode, addToast]);

  const renderContent = useCallback((content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-indigo-500/20 bg-slate-950 shadow-2xl">
            <div className="bg-slate-900/90 px-4 py-2 flex items-center justify-between border-b border-white/5">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Maki Generated Code</span>
              <button onClick={() => handleApplyCode(code)} className="text-[10px] font-bold text-emerald-400 hover:text-white transition-colors">APLICAR</button>
            </div>
            <pre className="p-4 text-[11px] code-font overflow-x-auto text-indigo-100/90 leading-relaxed no-scrollbar"><code>{code}</code></pre>
          </div>
        );
      }
      return <span key={i} className="leading-relaxed">{part}</span>;
    });
  }, [handleApplyCode]);

  if (!isConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/20 rounded-3xl border border-indigo-500/10">
        <div className="w-24 h-24 rounded-full bg-indigo-500/5 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping"></div>
          <ShieldCheck size={40} className="text-indigo-400 opacity-50" />
        </div>
        <h2 className="text-xl font-bold mb-3 tracking-tight">Ativação Necessária</h2>
        <p className="text-sm text-slate-500 max-w-sm text-center mb-8 leading-relaxed">
          Para garantir a segurança no Netlify, a Maki precisa de uma ponte de conexão. Clique abaixo para ativar sua licença gratuita.
        </p>
        <button 
          onClick={handleConnect}
          className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-sm shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Key size={18} />
          Ativar Maki AI
        </button>
        <p className="mt-8 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">CodeFlow Secure Protocol</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 glass-panel rounded-3xl overflow-hidden relative shadow-2xl border border-indigo-500/10 transition-all duration-300">
      <aside className={`absolute lg:relative z-20 h-full w-64 border-r border-indigo-500/5 transition-transform duration-200 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-slate-50/95'} backdrop-blur-xl`}>
        <div className="p-4 flex flex-col h-full">
          <button onClick={() => {
            const newId = Math.random().toString(36).substring(7);
            setSessions(prev => [{ id: newId, title: 'Nova Sessão', messages: [], draft: '', createdAt: new Date() }, ...prev]);
            setActiveSessionId(newId);
            setShowSidebar(false);
          }} className="w-full mb-6 py-3 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg hover:bg-indigo-500 transition-all">
            <Plus size={14} /> Nova Conversa
          </button>
          <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
            {sessions.map(s => (
              <div key={s.id} onClick={() => { setActiveSessionId(s.id); setShowSidebar(false); }} className={`px-4 py-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all group ${activeSessionId === s.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:bg-indigo-500/5'}`}>
                <span className="text-[10px] truncate font-bold uppercase tracking-tight">{s.title}</span>
                <Trash2 size={12} className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity" onClick={(e) => {
                   e.stopPropagation();
                   if (sessions.length > 1) {
                     const next = sessions.filter(x => x.id !== s.id);
                     setSessions(next);
                     if (activeSessionId === s.id) setActiveSessionId(next[0].id);
                   }
                }} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-indigo-500/10 ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-white/40'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-1.5 text-slate-500 hover:bg-indigo-500/10 rounded-lg"><Menu size={18} /></button>
            <div className="relative">
              <Bot size={20} className="text-emerald-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 block leading-none">Maki Senior</span>
              <span className="text-[8px] text-emerald-500/60 font-bold uppercase">Ready to Code</span>
            </div>
          </div>
          <button onClick={() => setIsConnected(false)} className="p-2 text-slate-500 hover:text-indigo-500 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {activeSession?.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale">
              <Sparkles size={48} className="text-indigo-500 mb-4 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Maki Integrated AI</p>
            </div>
          )}

          {activeSession?.messages.map((msg, idx) => (
            <ChatMessage key={idx} msg={msg} theme={theme} onApply={handleApplyCode} renderContent={renderContent} />
          ))}
          {isTyping && (
            <div className="flex gap-3 p-2 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-emerald-500/20">
                <Bot size={16} className="text-emerald-500" />
              </div>
              <div className="flex gap-1.5 items-center bg-indigo-500/5 px-4 rounded-full border border-indigo-500/10">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6">
          <div className={`flex items-end gap-3 px-5 py-4 rounded-3xl border transition-all duration-300 shadow-xl ${theme === 'dark' ? 'bg-slate-950/60 border-indigo-500/20 focus-within:border-emerald-500/30' : 'bg-white border-indigo-500/10 focus-within:border-emerald-500/30'}`}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Digite sua dúvida ou comando para a Maki..."
              className="flex-1 bg-transparent text-sm outline-none resize-none overflow-hidden max-h-48 py-1 placeholder-slate-700 font-medium"
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isTyping} 
              className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-emerald-600 disabled:opacity-20 transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
