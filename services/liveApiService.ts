
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export function encodePCM(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodePCM(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const connectLiveChat = (callbacks: {
  onAudioData: (base64: string) => void;
  onInterrupted: () => void;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => callbacks.onOpen(),
      onmessage: async (message: LiveServerMessage) => {
        const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audio) {
          callbacks.onAudioData(audio);
        }
        if (message.serverContent?.interrupted) {
          callbacks.onInterrupted();
        }
      },
      onclose: () => callbacks.onClose(),
      onerror: (e) => console.error("Live API Error:", e),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } // Voz amigable para niños
      },
      systemInstruction: 'Eres un amigo mágico y divertido para un niño. Tu objetivo es ayudarle a hablar mejor mientras juegas con él. Sé muy paciente, usa frases cortas, celebra mucho sus intentos y mantén un tono alegre y animado. Si el niño no habla, anímale con una pregunta sobre animales o colores.'
    }
  });

  return sessionPromise;
};
