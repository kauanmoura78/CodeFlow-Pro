
import { CodeStorage, CodeBlock } from '../types';

export const extractCSS = (html: string): string => {
  let css = '';
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    css += match[1].trim() + '\n\n';
  }
  return css.trim();
};

export const extractJS = (html: string): string => {
  let js = '';
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    js += match[1].trim() + '\n\n';
  }
  return js.trim();
};

export const extractHTML = (html: string): string => {
  let cleanHtml = html;
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanHtml = cleanHtml.replace(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi, '');
  return cleanHtml.trim();
};

export const splitIntoBlocks = (code: string, maxChars: number): CodeBlock[] => {
  if (!code.trim()) return [];
  const blocks: CodeBlock[] = [];
  for (let i = 0; i < code.length; i += maxChars) {
    const content = code.substring(i, i + maxChars);
    blocks.push({
      content,
      index: Math.floor(i / maxChars),
      lines: content.split('\n').length,
      chars: content.length
    });
  }
  return blocks;
};

export const reconstructComplete = (storage: CodeStorage): string => {
  let completeCode = storage.html;
  
  if (storage.css.trim()) {
    if (completeCode.includes('</head>')) {
      completeCode = completeCode.replace('</head>', `  <style>\n${storage.css}\n  </style>\n</head>`);
    } else if (completeCode.includes('<body>')) {
      completeCode = completeCode.replace('<body>', `<style>\n${storage.css}\n</style>\n<body>`);
    } else {
      completeCode = `<style>\n${storage.css}\n</style>\n\n${completeCode}`;
    }
  }
  
  if (storage.js.trim()) {
    if (completeCode.includes('</body>')) {
      completeCode = completeCode.replace('</body>', `  <script>\n${storage.js}\n  </script>\n</body>`);
    } else {
      completeCode = `${completeCode}\n\n<script>\n${storage.js}\n</script>`;
    }
  }
  
  return completeCode;
};
