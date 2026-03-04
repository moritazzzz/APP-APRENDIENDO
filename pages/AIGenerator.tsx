
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { generateStreamingExercise, generateExerciseImage } from '../services/geminiService';
import { ExerciseType, Level, RewardTrigger, Child } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const AIGenerator: React.FC = () => {
  const [type, setType] = useState<ExerciseType>(ExerciseType.ARTICULATION);
  const [level, setLevel] = useState<Level>(Level.EASY);
  const [targetAge, setTargetAge] = useState<number>(5);
  const [topic, setTopic] = useState('');
  const [isLogOpen, setIsLogOpen] = useState(false);
  
  const [duration, setDuration] = useState(5);
  const [repetitions, setRepetitions] = useState(3);
  const [reward, setReward] = useState<RewardTrigger>(RewardTrigger.CONFETTI);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [streamedContent, setStreamedContent] = useState('');
  const [generatedExercise, setGeneratedExercise] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsApproved(false);
    setStreamedContent('');
    setGeneratedExercise(null);
    
    const tempChild: Child = {
      id: 'preview',
      name: 'Explorador',
      age: targetAge,
      characteristics: topic,
      objectives: [],
      level: level,
      stars: 0,
      coins: 0,
      collection: [],
      achievements: [],
      unlockedItems: [],
      progression: {
        consecutiveSuccesses: 0,
        consecutiveFailures: 0,
        problematicPhonemes: {},
        levelProgress: 0
      },
      preferences: topic,
      lastSession: new Date().toLocaleDateString()
    };

    let imageStarted = false;
    let imageUrlPromise: Promise<string> | null = null;

    try {
      const config = { duration, repetitions, reward, history: usedWords };
      const result = await generateStreamingExercise(type, tempChild, config, (chunk) => {
        setStreamedContent(chunk);
        
        // Optimización: Intentar extraer el keyword de la imagen antes de que termine el stream
        if (!imageStarted) {
          const keywordMatch = chunk.match(/"image_keyword":\s*"([^"]+)"/);
          if (keywordMatch) {
            imageStarted = true;
            imageUrlPromise = generateExerciseImage(keywordMatch[1], tempChild.age);
          }
        }
      });

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0].trim());
        
        // Si ya empezamos la imagen, esperamos a que termine. Si no, la empezamos ahora.
        const aiImageUrl = imageUrlPromise 
          ? await imageUrlPromise 
          : await generateExerciseImage(parsed.image_keyword || parsed.target, tempChild.age);
          
        parsed.imageUrl = aiImageUrl;
        parsed.config = config;
        setGeneratedExercise(parsed);
        setUsedWords(prev => [...prev, parsed.target].slice(-10));
      }
    } catch (e) {
      console.error("Generación fallida:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <header className="py-8 flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Fábrica Mágica ✨</h2>
            <p className="text-slate-400 font-medium">Crea materiales educativos únicos con un solo click.</p>
          </div>
          <button 
            onClick={() => window.location.hash = '#/dashboard'} 
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ← Volver
          </button>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
          {/* Lado Configuración */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-8">
            <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Ajustes del Reto</h4>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Módulo</label>
                    <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-bold text-sm" value={type} onChange={e => setType(e.target.value as ExerciseType)}>
                      {Object.values(ExerciseType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Nivel</label>
                    <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-bold text-sm" value={level} onChange={e => setLevel(e.target.value as Level)}>
                      {Object.values(Level).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Edad Objetivo (Etapa de Desarrollo)</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-bold text-sm" 
                    value={targetAge} 
                    onChange={e => setTargetAge(parseInt(e.target.value))}
                  >
                    <option value={3}>3-4 años (Pre-escolar Inicial)</option>
                    <option value={5}>5-6 años (Transición)</option>
                    <option value={7}>7-8 años (Primaria Inicial)</option>
                    <option value={10}>9+ años (Primaria Avanzada)</option>
                  </select>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">¿De qué trata el juego? (Topic)</label>
                  <input 
                    type="text" placeholder="Ej: Dinosaurios, Piratas, Frutas..." 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-4 font-bold outline-none focus:border-blue-100 transition-all"
                    value={topic} onChange={e => setTopic(e.target.value)} 
                  />
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">Duración: {duration} min</label>
                    <input type="range" min="1" max="15" className="w-full accent-blue-600" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">Premios: {reward === RewardTrigger.CONFETTI ? '🎉' : '⭐'}</label>
                    <div className="flex gap-2">
                       <button onClick={() => setReward(RewardTrigger.CONFETTI)} className={`flex-1 p-2 rounded-lg text-sm font-bold border-2 ${reward === RewardTrigger.CONFETTI ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-50 text-slate-300'}`}>Confeti</button>
                       <button onClick={() => setReward(RewardTrigger.STARS)} className={`flex-1 p-2 rounded-lg text-sm font-bold border-2 ${reward === RewardTrigger.STARS ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-50 text-slate-300'}`}>Estrellas</button>
                    </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !topic} 
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "✨ GENERAR JUEGO"}
            </button>
          </div>

          {/* Lado Preview */}
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[2.5rem] min-h-[500px] flex flex-col border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Resultado del Diseño</h4>
                  <button onClick={() => setIsLogOpen(!isLogOpen)} className="text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase">
                    {isLogOpen ? 'Cerrar Log' : 'Ver Log IA'}
                  </button>
               </div>

               <AnimatePresence>
                 {isLogOpen && (
                   <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mb-6">
                      <div className="bg-slate-900 text-green-400 p-4 rounded-xl text-[10px] font-mono whitespace-pre-wrap h-24 overflow-y-auto">
                        {streamedContent || "Esperando..."}
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="flex-grow flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                         <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center animate-bounce">
                           <span className="text-4xl">🎨</span>
                         </div>
                         <p className="text-slate-400 font-bold animate-pulse uppercase text-xs tracking-widest">Ilustrando tu idea...</p>
                      </motion.div>
                    ) : generatedExercise ? (
                      <motion.div key="content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full flex flex-col items-center">
                         <div className="w-full aspect-square max-w-[300px] bg-white rounded-[3rem] shadow-2xl shadow-slate-200 mb-8 border-[10px] border-white overflow-hidden">
                            <img src={generatedExercise.imageUrl} className="w-full h-full object-contain" alt="IA Visual" referrerPolicy="no-referrer" />
                         </div>
                         <div className="bg-white p-8 rounded-[2.5rem] w-full text-center shadow-sm border-4 border-slate-50">
                            <p className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-widest leading-tight">"{generatedExercise.content}"</p>
                            <div className="bg-blue-600 py-4 px-6 rounded-2xl shadow-lg">
                               <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest block mb-1">PALABRA OBJETIVO</span>
                               <p className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tight">{generatedExercise.target}</p>
                            </div>
                            {generatedExercise.hint && (
                              <p className="mt-4 text-slate-400 text-xs font-bold italic">💡 {generatedExercise.hint}</p>
                            )}
                         </div>
                         <div className="flex gap-4 mt-8 w-full">
                            <button onClick={() => setIsApproved(true)} className="flex-1 bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100">Aprobar y Guardar</button>
                            <button onClick={() => setGeneratedExercise(null)} className="flex-1 bg-white text-slate-400 font-bold py-4 rounded-2xl border border-slate-100">Intentar otro</button>
                         </div>
                      </motion.div>
                    ) : (
                      <div className="text-center opacity-20">
                        <span className="text-9xl mb-4 block">🪄</span>
                        <p className="font-black text-slate-500 uppercase tracking-widest">Configura para empezar</p>
                      </div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIGenerator;
