
import React, { useState, useEffect } from 'react';
import { CodeType, CodeStorage, Theme, ToastType, ChatSession } from './types';
import { extractCSS, extractJS, extractHTML, reconstructComplete } from './services/codeUtils';
import Header from './components/Header';
import EditorTabs from './components/EditorTabs';
import CodeEditor from './components/CodeEditor';
import Sidebar from './components/Sidebar';
import BlocksView from './components/BlocksView';
import ToastContainer from './components/ToastContainer';
import DeviceModal from './components/DeviceModal';
import SaveModal from './components/SaveModal';
import ChatView from './components/ChatView';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentTab, setCurrentTab] = useState<CodeType | 'blocks' | 'chat'>('complete');
  const [codeStorage, setCodeStorage] = useState<CodeStorage>({
    complete: '',
    html: '',
    css: '',
    js: ''
  });
  const [charLimit, setCharLimit] = useState(4000);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem('code_storage');
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedSessions = localStorage.getItem('chat_sessions');
    
    if (savedCode) setCodeStorage(JSON.parse(savedCode));
    if (savedTheme) setTheme(savedTheme);
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    } else {
      const initialId = Math.random().toString(36).substring(7);
      const initialSession: ChatSession = {
        id: initialId,
        title: 'Nova Conversa',
        messages: [],
        createdAt: new Date()
      };
      setSessions([initialSession]);
      setActiveSessionId(initialId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('code_storage', JSON.stringify(codeStorage));
    localStorage.setItem('theme', theme);
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    document.body.className = theme === 'dark' ? 'h-full overflow-hidden' : 'h-full overflow-hidden light-theme';
  }, [codeStorage, theme, sessions]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleCodeChange = (newCode: string, type?: CodeType) => {
    const targetTab = type || (currentTab === 'blocks' || currentTab === 'chat' ? 'complete' : currentTab as CodeType);
    
    setCodeStorage(prev => {
      const next = { ...prev, [targetTab]: newCode };
      if (targetTab !== 'complete') {
        next.complete = reconstructComplete(next);
      } else {
        next.css = extractCSS(newCode);
        next.js = extractJS(newCode);
        next.html = extractHTML(newCode);
      }
      return next;
    });
  };

  const handleFileLoad = (content: string, fileName: string) => {
    if (fileName.endsWith('.css')) {
      const next = { ...codeStorage, css: content };
      next.complete = reconstructComplete(next);
      setCodeStorage(next);
      setCurrentTab('css');
    } else if (fileName.endsWith('.js')) {
      const next = { ...codeStorage, js: content };
      next.complete = reconstructComplete(next);
      setCodeStorage(next);
      setCurrentTab('js');
    } else {
      const next = {
        complete: content,
        css: extractCSS(content),
        js: extractJS(content),
        html: extractHTML(content)
      };
      setCodeStorage(next);
      setCurrentTab('complete');
    }
    addToast('Arquivo carregado com sucesso!');
  };

  const clearEditor = () => {
    setCodeStorage({ complete: '', html: '', css: '', js: '' });
    addToast('Todo o conteúdo foi removido', 'info');
  };

  const showSidebar = currentTab !== 'blocks' && currentTab !== 'chat';

  return (
    <div className={`h-full flex flex-col transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100' 
        : 'bg-slate-200 text-slate-600'
    }`}>
      
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        onFileLoad={handleFileLoad} 
        onClear={clearEditor}
        onExecute={() => setShowDeviceModal(true)}
        onSave={() => setShowSaveModal(true)}
        code={codeStorage.complete}
        addToast={addToast}
      />

      <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 w-full min-h-0 overflow-hidden">
        <EditorTabs 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          theme={theme}
        />

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            {currentTab === 'blocks' ? (
              <BlocksView 
                storage={codeStorage} 
                charLimit={charLimit} 
                addToast={addToast}
                theme={theme}
              />
            ) : currentTab === 'chat' ? (
              <ChatView
                storage={codeStorage}
                sessions={sessions}
                setSessions={setSessions}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                onApplyCode={handleCodeChange}
                theme={theme}
                addToast={addToast}
              />
            ) : (
              <CodeEditor 
                code={codeStorage[currentTab as CodeType]} 
                onChange={handleCodeChange}
                fileName={currentTab === 'complete' ? 'arquivo.html' : `${currentTab}.${currentTab === 'js' ? 'js' : currentTab === 'css' ? 'css' : 'html'}`}
                theme={theme}
              />
            )}
          </div>

          {showSidebar && (
            <Sidebar 
              code={codeStorage[currentTab as CodeType]}
              charLimit={charLimit}
              setCharLimit={setCharLimit}
              currentTab={currentTab}
              addToast={addToast}
              theme={theme}
            />
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} />
      
      {showDeviceModal && (
        <DeviceModal 
          code={codeStorage.complete} 
          onClose={() => setShowDeviceModal(false)} 
          addToast={addToast}
          theme={theme}
        />
      )}

      {showSaveModal && (
        <SaveModal
          storage={codeStorage}
          onClose={() => setShowSaveModal(false)}
          addToast={addToast}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
