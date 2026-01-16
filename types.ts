
export type CodeType = 'complete' | 'html' | 'css' | 'js';

export interface CodeStorage {
  complete: string;
  html: string;
  css: string;
  js: string;
}

export interface CodeBlock {
  content: string;
  index: number;
  lines: number;
  chars: number;
}

export type Theme = 'dark' | 'light';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // Adicionado para suporte a grounding de pesquisa conforme diretrizes do Gemini API
  groundingChunks?: any[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  draft?: string;
  createdAt: Date;
}

export interface ToastType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
