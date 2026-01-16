
import React from 'react';
import { CodeType, Theme } from '../types';
import { FileCode, Hash, Braces, Zap, Box, Bot } from 'lucide-react';

interface EditorTabsProps {
  currentTab: CodeType | 'blocks' | 'chat';
  setCurrentTab: (tab: CodeType | 'blocks' | 'chat') => void;
  theme: Theme;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ currentTab, setCurrentTab, theme }) => {
  const tabs: { id: CodeType | 'blocks' | 'chat'; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'complete', label: 'Completo', icon: <FileCode size={18} />, color: 'indigo' },
    { id: 'html', label: 'HTML', icon: <Hash size={18} />, color: 'orange' },
    { id: 'css', label: 'CSS', icon: <Braces size={18} />, color: 'blue' },
    { id: 'js', label: 'JS', icon: <Zap size={18} />, color: 'yellow' },
    { id: 'blocks', label: 'Blocos', icon: <Box size={18} />, color: 'violet' },
    { id: 'chat', label: 'Copilot', icon: <Bot size={18} />, color: 'emerald' },
  ];

  return (
    <div className="flex gap-2 p-1 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
            currentTab === tab.id
              ? `bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]`
              : theme === 'dark'
              ? 'text-slate-400 hover:text-white hover:bg-white/5'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/40'
          }`}
        >
          <span className={currentTab === tab.id ? 'text-white' : ''}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default EditorTabs;
