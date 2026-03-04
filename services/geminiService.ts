
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ExerciseType, Level, RewardTrigger, Child } from "../types";

export const generateStreamingExercise = async (
  type: ExerciseType,
  child: Child,
  config: { duration: number; repetitions: number; reward: RewardTrigger; history?: string[] },
  onChunk: (chunk: string) => void
) => {
  const apiKey = process.env.API_KEY || "";
  const timestamp = new Date().getTime();
  const randomSeed = Math.random().toString(36).substring(7);

  const isMission = type === ExerciseType.MISSION;
  const isPuzzle = type === ExerciseType.PUZZLE;
  
  const prompt = isMission 
    ? `MODO MISIÓN ESPECIAL: Actúa como un diseñador de videojuegos y terapeuta.
       Crea un reto DESAFIANTE para ${child.name} (${child.age} años).
       Dificultad: ${child.age < 6 ? 'Básico' : child.age < 8 ? 'Intermedio' : 'Avanzado'}.
       Tema: Rescate en el Planeta de los Bloques (Voxel/Roblox).
       REGLA: Si es >=6 años, incluye un reto contrarreloj.
       REGLA: Usa sinfones complejos (pla, tra, bra, gla, fra).
       REGLA: Para 8 años, usa frases largas y complejas.
       
       FORMATO JSON:
       {
         "content": "Instrucción de misión épica (máx 10 palabras)",
         "target": "Palabra o frase objetivo",
         "hint": "Pista fonética",
         "image_keyword": "Escena voxel épica de la palabra",
         "is_timed": ${child.age >= 6},
         "time_limit": ${child.age >= 8 ? 10 : 15}
       }`
    : isPuzzle
    ? `MODO ROMPECABEZAS/ADIVINANZA: Crea un acertijo visual o conceptual para ${child.name} (${child.age} años).
       Dificultad: ${child.level}.
       REGLA: El 'content' debe ser una adivinanza divertida y corta. Ejemplo: 'Tengo orejas largas y me gusta la zanahoria'.
       REGLA: El 'target' es la respuesta a la adivinanza (ej. 'conejo').
       REGLA: El 'image_keyword' debe ser una versión 'misteriosa' o 'fragmentada' del objeto para que parezca un rompecabezas.
       
       FORMATO JSON:
       {
         "content": "Adivinanza divertida (máx 15 palabras)",
         "target": "Respuesta (1 sola palabra)",
         "hint": "Una pista extra",
         "image_keyword": "Voxel puzzle style of [object]"
       }`
    : `Actúa como un experto terapeuta de lenguaje creativo especializado en niños de 4 a 8 años. 
  Genera un ejercicio de tipo "${type}" para un niño llamado ${child.name} de ${child.age} años.
  Nivel de dificultad: ${child.level}.
  PREFERENCIAS DEL NIÑO: ${child.preferences || 'No especificadas'}.
  
  CONTEXTO CRÍTICO:
  - El niño tiene entre 4 y 8 años.
  - Está APRENDIENDO A LEER, por lo que el lenguaje debe ser extremadamente simple, fonético y visual.
  - Usa las PREFERENCIAS del niño para que el ejercicio sea altamente motivador para él.
  - El tema DEBE ser "Mundos de Roblox/Voxel/Bloques", pero varía el sub-tema (espacio, piratas, dinosaurios, ciudades futuristas, granjas mágicas, etc.) integrando sus gustos.
  
  REGLAS PARA EVITAR REPETICIÓN:
  1. NO uses palabras comunes o aburridas. Sé creativo y sorprendente.
  2. Semilla aleatoria: ${randomSeed}_${timestamp}.
  3. ${config.history && config.history.length > 0 ? `EVITA estas palabras que ya usamos recientemente: ${config.history.join(', ')}.` : ''}
  4. Crea una instrucción divertida y motivadora que invite a la acción.
  
  FORMATO JSON REQUERIDO:
  {
    "content": "Instrucción muy corta y clara (máx 8 palabras). Ejemplo: '¡Mira el cohete! Di: Fuego'",
    "target": "Palabra o frase corta (máx 3 palabras para nivel Difícil, 1 para Fácil)",
    "hint": "Pista visual o fonética breve",
    "image_keyword": "Descripción visual para generar una imagen 3D voxel increíble y clara"
  }`;

  try {
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const ai = new GoogleGenAI({ apiKey });
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        temperature: 0.9,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "Instrucción muy corta y motivadora" },
            target: { type: Type.STRING, description: "Palabra o frase objetivo clara" },
            hint: { type: Type.STRING, description: "Pista breve y útil" },
            image_keyword: { type: Type.STRING, description: "Keyword descriptivo para imagen Roblox/Voxel" },
            is_timed: { type: Type.BOOLEAN },
            time_limit: { type: Type.NUMBER }
          },
          required: ["content", "target", "hint", "image_keyword"]
        }
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error: any) {
    console.warn("AI Fallback", error);
    return `{"content": "¡Hola ${child.name}! Vamos a practicar. Di: Sol", "target": "sol", "image_keyword": "smiling sun cartoon", "hint": "Brilla en el cielo"}`;
  }
};

const imageCache: Record<string, string> = {};

export const generateExerciseImage = async (keyword: string, age: number): Promise<string> => {
  const cacheKey = `${keyword}_${age < 5 ? 'young' : 'old'}`;
  if (imageCache[cacheKey]) return imageCache[cacheKey];

  const apiKey = process.env.API_KEY || "";
  if (!apiKey) return "https://img.freepik.com/premium-vector/cute-dog-cartoon_1033285-1.jpg";

  const ai = new GoogleGenAI({ apiKey });
  
  // Adaptamos el estilo visual a la edad
  const stylePrompt = age < 5 
    ? "Bold lines, simple shapes, high contrast, very cute primary colors, white background."
    : "Detailed cartoon, vibrant colors, expressive character, professional sticker style, white background.";

  const prompt = `A professional 3D voxel art illustration (Roblox/Minecraft style) of: ${keyword}. Style: ${stylePrompt} Blocky, vibrant, high quality, white background, no text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const b64 = `data:image/png;base64,${part.inlineData.data}`;
        imageCache[cacheKey] = b64;
        return b64;
      }
    }
    return `https://loremflickr.com/800/800/${encodeURIComponent(keyword)}/all`;
  } catch (error) {
    return `https://loremflickr.com/800/800/${encodeURIComponent(keyword)}/all`;
  }
};
