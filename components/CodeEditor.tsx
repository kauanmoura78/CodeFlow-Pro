
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Theme } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  fileName: string;
  theme: Theme;
}

const CodeEditor: React.FC<CodeEditorProps> = React.memo(({ code, onChange, fileName, theme }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Memoizar cálculo de linhas para evitar processamento em re-renders não relacionados
  const { lineCount, charCount, lineNumbersText } = useMemo(() => {
    const lines = code.split('\n');
    const count = Math.max(lines.length, 1);
    const text = Array.from({ length: count }, (_, i) => i + 1).join('\n');
    return { lineCount: count, charCount: code.length, lineNumbersText: text };
  }, [code]);

  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  const styles = useMemo(() => ({
    lineHeight: '1.5rem',
    fontSize: '0.85rem',
    fontFamily: '"Fira Code", monospace',
    paddingTop: '1rem',
    paddingBottom: '1rem',
  }), []);

  return (
    <div className="flex-1 flex flex-col min-h-0 glass-panel rounded-3xl overflow-hidden shadow-xl transition-all duration-200">
      <div className={`flex items-center justify-between px-6 py-2.5 border-b border-indigo-500/10 ${
        theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-200/40'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></div>
          </div>
          <span className={`text-[11px] font-bold code-font ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{fileName}</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest opacity-40">
          L: {lineCount} • C: {charCount}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative bg-transparent">
        <div 
          ref={lineNumbersRef}
          className={`w-12 px-2 text-right code-font text-[11px] select-none border-r border-indigo-500/5 overflow-hidden no-scrollbar whitespace-pre pointer-events-none ${
            theme === 'dark' ? 'bg-slate-950/30 text-slate-600' : 'bg-slate-300/30 text-slate-500'
          }`}
          style={styles}
        >
          {lineNumbersText}
        </div>
        
        <textarea
          ref={editorRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder="Comece a codar..."
          className={`flex-1 w-full h-full px-5 bg-transparent resize-none outline-none leading-relaxed transition-colors ${
            theme === 'dark' ? 'text-indigo-50 placeholder-slate-800' : 'text-slate-800 placeholder-slate-400'
          }`}
          style={styles}
        />
      </div>
    </div>
  );
});

export default CodeEditor;
