
export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  try {
    // Cancelar cualquier discurso previo para evitar superposiciones
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.85; // Velocidad óptima para claridad infantil
    utterance.pitch = 1.3;  // Tono ligeramente más agudo para sonar amigable/infantil
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speech Synthesis error:", err);
  }
};

export const startRecognition = (onResult: (result: string) => void, onError: (err: any) => void) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError("Browser doesn't support Speech Recognition");
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const result = event.results[0][0].transcript;
        console.log("Recognition result:", result);
        onResult(result);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech Recognition error:", event.error);
      onError(event.error);
    };

    recognition.onend = () => {
      console.log("Recognition session ended");
    };

    recognition.start();
    return recognition;
  } catch (e) {
    console.error("Recognition initialization failed:", e);
    onError(e);
    return null;
  }
};

export const compareText = (input: string, target: string): number => {
  const normalize = (str: string) => 
    str.toLowerCase()
       .trim()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
       
  const s1 = normalize(input);
  const s2 = normalize(target);
  
  if (s1 === s2) return 1;
  
  // Lógica de coincidencia parcial para mayor tolerancia con niños
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  const matches = words1.filter(w => words2.some(tw => tw.includes(w) || w.includes(tw)));
  const score = matches.length / Math.max(words1.length, words2.length);
  
  // Si contiene la palabra clave principal, damos un empujón al puntaje
  if (s1.includes(s2) || s2.includes(s1)) return Math.max(score, 0.8);
  
  return score;
};
