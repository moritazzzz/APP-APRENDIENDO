import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LottiePlayer from '../components/LottiePlayer';
import { LOTTIE_URLS, LEVEL_METADATA, MOTIVATIONAL_PHRASES, ACHIEVEMENTS } from '../constants';
import { speak, startRecognition, compareText } from '../services/speechService';
import { generateStreamingExercise, generateExerciseImage } from '../services/geminiService';
import { ExerciseType, Level, RewardTrigger, Child, Achievement, AvatarAnimation } from '../types';
import { useAvatar } from '../context/AvatarContext';
import Avatar from '../components/Avatar';

type PlayStep = 'welcome' | 'selection' | 'generating' | 'playing' | 'feedback' | 'levelup';

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "tween" as const, ease: "easeInOut" as const, duration: 0.4 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.02,
    transition: {
      x: { type: "tween" as const, ease: "easeInOut" as const, duration: 0.4 },
      opacity: { duration: 0.4 }
    }
  })
};

const ChildPlay: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { avatar } = useAvatar();
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [currentStep, setCurrentStep] = useState<PlayStep>('welcome');
  const [direction, setDirection] = useState(1);
  const [avatarAnim, setAvatarAnim] = useState<AvatarAnimation>('idle');
  const [isListening, setIsListening] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showStars, setShowStars] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<any>(null);
  const [sessionRewards, setSessionRewards] = useState({ stars: 0, coins: 0 });
  const [lastScore, setLastScore] = useState(0);
  const [showImprovement, setShowImprovement] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && currentStep === 'playing') {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && currentStep === 'playing') {
      const msg = "¡Se acabó el tiempo! Vamos a intentarlo otra vez.";
      setFeedbackMsg(msg);
      speak(msg);
      setTimeout(() => {
        setFeedbackMsg('');
        setTimeLeft(generatedExercise?.time_limit || 15);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, currentStep, generatedExercise]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('hja_children') || '[]');
    const child = saved.find((c: any) => c.id === id);
    if (child) {
      if (!child.progression) {
        child.progression = {
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
          problematicPhonemes: {},
          levelProgress: 0
        };
      }
      if (child.coins === undefined) child.coins = 0;
      if (!child.achievements) child.achievements = [];
      setCurrentChild(child);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const updateChildData = (updatedChild: Child) => {
    const saved = JSON.parse(localStorage.getItem('hja_children') || '[]');
    const index = saved.findIndex((c: any) => c.id === updatedChild.id);
    if (index !== -1) {
      saved[index] = updatedChild;
      localStorage.setItem('hja_children', JSON.stringify(saved));
    }
    setCurrentChild({ ...updatedChild });
  };

  const changeStep = (newStep: PlayStep, newDirection: number = 1) => {
    setDirection(newDirection);
    setCurrentStep(newStep);
  };

  const fetchNewExercise = async (type: ExerciseType) => {
    if (!currentChild) return;
    changeStep('generating', 1);
    setAvatarAnim('idle');
    
    try {
      const result = await generateStreamingExercise(
        type, 
        currentChild, 
        { 
          duration: 5, 
          repetitions: 3, 
          reward: RewardTrigger.STARS
        }, 
        () => {}
      );
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0].trim());
        parsed.type = type; // Store the type for UI logic
        const aiImageUrl = await generateExerciseImage(parsed.image_keyword || parsed.target, currentChild.age);
        parsed.imageUrl = aiImageUrl;
        setGeneratedExercise(parsed);
        if (parsed.is_timed) {
          setTimeLeft(parsed.time_limit || 15);
        } else {
          setTimeLeft(null);
        }
        changeStep('playing', 1);
        setAvatarAnim('greet');
        setTimeout(() => setAvatarAnim('idle'), 2000);
        speak(parsed.content);
      }
    } catch (e) {
      changeStep('selection', -1);
    }
  };

  const handleLevelChange = (child: Child, direction: 'up' | 'down') => {
    const levels = Object.values(Level);
    const currentIndex = levels.indexOf(child.level);
    let nextLevel = child.level;

    if (direction === 'up' && currentIndex < levels.length - 1) {
      nextLevel = levels[currentIndex + 1];
      const phrase = MOTIVATIONAL_PHRASES.levelUp[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.levelUp.length)];
      speak(phrase);
      changeStep('levelup', 1);
    } else if (direction === 'down' && currentIndex > 0) {
      nextLevel = levels[currentIndex - 1];
    }

    return {
      ...child,
      level: nextLevel,
      progression: {
        ...child.progression,
        consecutiveSuccesses: 0,
        consecutiveFailures: 0,
        levelProgress: 0
      }
    };
  };

  const checkAchievements = (child: Child, score: number) => {
    const newAchievements: Achievement[] = [...child.achievements];
    let updated = false;

    if (score === 1 && !newAchievements.find(a => a.id === 'perfect_score')) {
      newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'perfect_score')!);
      updated = true;
    }
    if (child.stars >= 1 && !newAchievements.find(a => a.id === 'first_star')) {
      newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'first_star')!);
      updated = true;
    }

    return updated ? { ...child, achievements: newAchievements } : child;
  };

  const handleListen = useCallback(() => {
    if (isListening || !generatedExercise || !currentChild) return;
    setIsListening(true);
    setAvatarAnim('idle');
    setFeedbackMsg('');

    startRecognition(
      (result) => {
        setIsListening(false);
        const score = compareText(result, generatedExercise.target || '');
        const metadata = LEVEL_METADATA[currentChild.level];
        const isSuccess = score >= metadata.minAccuracy;
        const isAlmost = score >= 0.4 && score < metadata.minAccuracy;

        let updatedChild = { ...currentChild };
        
        if (isSuccess) {
          const starsEarned = Math.ceil(score * 5);
          const coinsEarned = Math.ceil(score * 10);
          const improvementBonus = score > lastScore ? 5 : 0;
          
          if (score > lastScore && lastScore > 0) {
            setShowImprovement(true);
            setTimeout(() => setShowImprovement(false), 2000);
          }

          updatedChild.stars += starsEarned;
          updatedChild.coins += (coinsEarned + improvementBonus);
          updatedChild.progression.consecutiveSuccesses += 1;
          updatedChild.progression.consecutiveFailures = 0;
          updatedChild.progression.levelProgress = Math.min(100, updatedChild.progression.levelProgress + 15);

          setSessionRewards(prev => ({ 
            stars: prev.stars + starsEarned, 
            coins: prev.coins + coinsEarned + improvementBonus 
          }));

          setAvatarAnim('celebrate');
          
          // Regla: 10% de probabilidad de recompensa sorpresa
          const isSurprise = Math.random() < 0.1;
          
          // Regla: 3 éxitos -> celebración ligera
          const phrase = isSurprise 
            ? "¡SORPRESA! ¡Eres genial!"
            : updatedChild.progression.consecutiveSuccesses % 3 === 0 
              ? "¡Eres un campeón!" 
              : MOTIVATIONAL_PHRASES.success[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.success.length)];
          
          setFeedbackMsg(phrase);
          setShowStars(true);
          speak(phrase);

          if (updatedChild.progression.consecutiveSuccesses >= 3 || updatedChild.progression.levelProgress >= 100) {
            updatedChild = handleLevelChange(updatedChild, 'up');
          }

          updatedChild = checkAchievements(updatedChild, score);
          setLastScore(score);
          updatedChild.lastSession = new Date().toLocaleDateString();

          setTimeout(() => { 
            setShowStars(false); 
            if (currentStep !== 'levelup') changeStep('feedback', 1); 
          }, 2000); // Animación corta < 2s

        } else if (isAlmost) {
          setAvatarAnim('clap');
          const phrase = MOTIVATIONAL_PHRASES.almost[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.almost.length)];
          setFeedbackMsg(phrase);
          speak(phrase);
          updatedChild.progression.consecutiveFailures = 0;
          setTimeout(() => setAvatarAnim('idle'), 2000);
        } else {
          updatedChild.progression.consecutiveFailures += 1;
          updatedChild.progression.consecutiveSuccesses = 0;
          
          const target = (generatedExercise.target || '').toLowerCase();
          const firstChar = target.charAt(0);
          updatedChild.progression.problematicPhonemes[firstChar] = (updatedChild.progression.problematicPhonemes[firstChar] || 0) + 1;

          setAvatarAnim('idle');
          
          // Regla: 2 fallos -> ayuda suave
          const phrase = updatedChild.progression.consecutiveFailures >= 2
            ? "¡Escucha y repite!"
            : MOTIVATIONAL_PHRASES.retry[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.retry.length)];
            
          setFeedbackMsg(phrase);
          speak(phrase);

          if (updatedChild.progression.consecutiveFailures >= 5) {
            updatedChild = handleLevelChange(updatedChild, 'down');
          }
        }

        updateChildData(updatedChild);
      },
      (error) => {
        setIsListening(false);
        console.error("Speech Recognition Error:", error);
        
        let msg = "¡Ups! No pude escucharte.";
        if (error === 'not-allowed') {
          msg = "Activa el micrófono para jugar 🎤";
        } else if (error === 'network') {
          msg = "Revisa tu conexión a internet 🌐";
        } else if (error === 'no-speech') {
          msg = "¡No te escuché! Intenta otra vez.";
        }
        
        setFeedbackMsg(msg);
        speak(msg);
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    );
  }, [generatedExercise, isListening, currentChild, lastScore, currentStep]);

  return (
    <Layout role="child" stars={currentChild?.stars || 0}>
      <div className="h-full w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 'welcome' && (
            <motion.div 
              key="welcome" 
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center bg-white p-12 rounded-[2rem] shadow-sm border border-slate-100 max-w-md w-full"
            >
              <div className="w-48 h-48 mx-auto mb-6 flex flex-col items-center">
                <Avatar 
                  tipo={avatar.tipo} 
                  color={avatar.color} 
                  accesorio={avatar.accesorio} 
                  animation="greet"
                  size={160}
                />
              </div>
              <h2 className="text-[24px] font-bold text-slate-800 mb-2">¡Hola {avatar.nombre || currentChild?.name.split(' ')[0]}!</h2>
              <p className="text-[18px] text-slate-500 mb-8">¿Listo para practicar hoy?</p>
              <button 
                onClick={() => changeStep('selection', 1)}
                className="w-full bg-blue-500 text-white text-[20px] font-bold py-4 rounded-xl shadow-md hover:bg-blue-600 transition-all"
              >
                ¡VAMOS A JUGAR!
              </button>
            </motion.div>
          )}

          {currentStep === 'selection' && (
            <motion.div 
              key="selection" 
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-[24px] font-bold text-slate-800 text-center mb-12">Elige una actividad</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
                {[
                  { type: ExerciseType.ARTICULATION, icon: '👄', label: 'Hablar' },
                  { type: ExerciseType.VOCABULARY, icon: '🍎', label: 'Palabras' },
                  { type: ExerciseType.COMPREHENSION, icon: '🧠', label: 'Pensar' }, // Fixed typo in ExerciseType if any, but checking types.ts is better. Wait, COMPREHENSION was in the original.
                  { type: ExerciseType.SENTENCES, icon: '📝', label: 'Frases' },
                  { type: ExerciseType.MISSION, icon: '🚀', label: 'Misión' },
                  { type: ExerciseType.PUZZLE, icon: '🧩', label: 'Puzzle' }
                ].map((mod) => (
                  <motion.button
                    key={mod.type} 
                    whileHover={{ y: -5 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchNewExercise(mod.type)}
                    className="bg-white aspect-square rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-blue-200 transition-all"
                  >
                    <span className="text-5xl mb-4">{mod.icon}</span>
                    <span className="font-bold text-[18px] text-slate-600">{mod.label}</span>
                  </motion.button>
                ))}
              </div>
              <button 
                onClick={() => changeStep('welcome', -1)}
                className="mt-12 text-slate-400 font-medium text-[16px] hover:text-blue-500 transition-colors"
              >
                ← Volver al inicio
              </button>
            </motion.div>
          )}

          {currentStep === 'generating' && (
             <motion.div 
               key="gen" 
               custom={direction}
               variants={slideVariants}
               initial="enter"
               animate="center"
               exit="exit"
               className="text-center"
             >
               <div className="w-72 h-72 mx-auto"><LottiePlayer url={LOTTIE_URLS.clouds} /></div>
               <h3 className="text-4xl font-black text-blue-900 animate-pulse mt-4 uppercase tracking-widest">Creando magia... ✨</h3>
             </motion.div>
          )}

          {currentStep === 'playing' && generatedExercise && (
            <motion.div 
              key="play" 
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-[85%] max-w-5xl aspect-[16/9] bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between p-6 relative overflow-hidden"
            >
              {/* Instrucción: Máximo 2 líneas, tipografía 18-20px */}
              <div className="text-center mt-2 z-10">
                {timeLeft !== null && (
                  <div className="absolute top-6 right-8 flex items-center gap-2 bg-red-50 px-4 py-1 rounded-full border border-red-100">
                    <span className="text-lg">⏱️</span>
                    <span className={`font-black text-xl ${timeLeft < 5 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>{timeLeft}s</span>
                  </div>
                )}
                <h3 className="text-[20px] font-medium text-slate-700 leading-snug max-w-2xl mx-auto">
                  {generatedExercise.content}
                </h3>
                {generatedExercise.type !== ExerciseType.PUZZLE && (
                  <p className="text-[18px] text-slate-400 mt-1">
                    Di: <span className="text-[24px] font-bold text-blue-600">{generatedExercise.target}</span>
                  </p>
                )}
                {generatedExercise.type === ExerciseType.PUZZLE && (
                  <p className="text-[18px] text-slate-400 mt-1 italic">
                    ¿Qué es? ¡Dilo fuerte! 🤫
                  </p>
                )}
              </div>

              {/* Imagen Dinámica Central */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="flex-grow flex items-center justify-center w-full max-h-[40%] my-2"
              >
                <div className="relative group">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-48 h-48 md:w-56 md:h-56 bg-blue-50/50 rounded-[3rem] p-4 flex items-center justify-center border-2 border-dashed border-blue-100 group-hover:border-blue-300 transition-colors"
                  >
                    <img 
                      src={generatedExercise.imageUrl} 
                      className="w-full h-full object-contain drop-shadow-xl" 
                      alt="Actividad" 
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  
                  {/* Decoración dinámica alrededor de la imagen */}
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -inset-4 bg-blue-400/5 rounded-[4rem] -z-10 blur-xl"
                  />
                </div>
              </motion.div>

              {/* Bloque Inferior: Micrófono central, Mascota y Bocina a los lados */}
              <div className="flex items-end justify-between w-full px-12 pb-4">
                {/* Personaje pequeño en un lateral */}
                <div className="w-32 flex flex-col items-center">
                  <Avatar 
                    tipo={avatar.tipo} 
                    color={avatar.color} 
                    accesorio={avatar.accesorio} 
                    animation={avatarAnim}
                    size={100}
                  />
                  <span className="text-[12px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">{avatar.nombre}</span>
                </div>

                {/* Micrófono como elemento central */}
                <div className="relative mb-2">
                  <button 
                    onClick={handleListen}
                    className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-110' 
                        : 'bg-blue-500 shadow-lg hover:bg-blue-600 hover:scale-105'
                    }`}
                  >
                    <span className="text-4xl">{isListening ? '🛑' : '🎤'}</span>
                  </button>
                  
                  {/* Feedback visual breve */}
                  <AnimatePresence>
                    {feedbackMsg && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-blue-600 px-4 py-2 rounded-2xl text-[16px] font-bold shadow-xl border border-blue-50"
                      >
                        {feedbackMsg}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-blue-50" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bocina pequeña en el lateral opuesto */}
                <button 
                  onClick={() => speak(generatedExercise.content)} 
                  className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all border border-slate-100 mb-4"
                >
                  🔊
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'levelup' && (
            <motion.div
              key="levelup"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-blue-600 p-10 rounded-[4rem] border-[10px] border-white text-center max-w-sm w-full shadow-xl text-white"
            >
              <div className="text-7xl mb-6">🚀</div>
              <h2 className="text-3xl font-black mb-2 uppercase">¡NUEVO NIVEL!</h2>
              <p className="text-lg font-bold mb-8 text-blue-100">Ahora eres: <br/><span className="text-yellow-400 text-2xl">{currentChild?.level}</span></p>
              <button 
                onClick={() => changeStep('feedback', 1)} 
                className="w-full bg-white text-blue-600 font-black py-4 rounded-2xl text-xl shadow-md active:scale-95 transition-all"
              >
                ¡CONTINUAR! ✨
              </button>
            </motion.div>
          )}

          {currentStep === 'feedback' && (
             <motion.div 
               key="feed" 
               custom={direction}
               variants={slideVariants}
               initial="enter"
               animate="center"
               exit="exit"
               className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center max-w-md w-full shadow-sm"
             >
               <div className="w-40 h-40 mx-auto mb-6 flex justify-center">
                <Avatar 
                  tipo={avatar.tipo} 
                  color={avatar.color} 
                  accesorio={avatar.accesorio} 
                  animation="celebrate"
                  size={160}
                />
               </div>
               <h2 className="text-[24px] font-bold text-slate-800 mb-2">¡Excelente trabajo!</h2>
               <p className="text-[18px] text-slate-500 mb-8">Has ganado {sessionRewards.stars} estrellas nuevas.</p>
               
               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => { setSessionRewards({stars: 0, coins: 0}); changeStep('selection', -1); }} 
                    className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl text-[20px] shadow-md hover:bg-blue-600 transition-all"
                  >
                    JUGAR OTRA VEZ
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full bg-slate-50 text-slate-400 font-medium py-3 rounded-xl text-[16px] hover:bg-slate-100 transition-all"
                  >
                    Terminar por hoy
                  </button>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
};

export default ChildPlay;
