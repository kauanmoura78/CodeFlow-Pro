
import { GoogleGenAI } from "@google/genai";

export const analyzeCode = async (code: string, task: 'optimize' | 'explain') => {
  // A chave é obtida diretamente do ambiente no momento da execução
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("AUTH_REQUIRED");
  }

  // Instancia o cliente apenas no momento da chamada
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstructions = task === 'optimize' 
    ? "Você é o Maki Engine. Otimize o código para performance extrema. Retorne APENAS o código puro."
    : "Você é o Maki Mentor. Explique o código em 3 tópicos ultra-rápidos.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: code,
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.1,
      }
    });

    let text = response.text || "";
    if (task === 'optimize') {
      text = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }
    
    return text;
  } catch (error: any) {
    console.error("Maki Error:", error);
    // Erros de autenticação retornam um código específico para o UI tratar
    if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('API_KEY')) {
      throw new Error("AUTH_REQUIRED");
    }
    throw new Error("OFFLINE");
  }
};
