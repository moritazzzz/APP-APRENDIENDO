
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LottiePlayer from '../components/LottiePlayer';
import { LOTTIE_URLS } from '../constants';

const LoginPage: React.FC = () => {
  const bgImage = "https://images.unsplash.com/photo-1500622764614-be3c1783fe95?auto=format&fit=crop&w=1920&q=80";
  const [mascot, setMascot] = useState(LOTTIE_URLS.mascot_happy);

  return (
    <div 
      className="h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ 
        backgroundImage: `url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom'
      }}
    >
      <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-[2px] z-0" />

      {/* Mascota saludando en el lateral para pantallas grandes */}
      <motion.div 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:block absolute left-20 bottom-10 w-96 h-96 z-10"
      >
        <LottiePlayer url={LOTTIE_URLS.mascot_happy} />
      </motion.div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-2xl rounded-[4rem] shadow-2xl p-6 md:p-10 w-full max-w-sm relative z-20 text-center border-[12px] border-white flex flex-col justify-between max-h-[95vh]"
      >
        <div 
          className="relative mb-6 h-40 md:h-56 flex items-center justify-center flex-shrink-0 cursor-pointer"
          onMouseEnter={() => setMascot(LOTTIE_URLS.mascot_celebrate)}
          onMouseLeave={() => setMascot(LOTTIE_URLS.mascot_happy)}
        >
          <motion.div 
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute z-0 w-40 h-40 md:w-64 md:h-64 bg-yellow-300/30 rounded-full blur-3xl"
          />
          <div className="w-full h-full relative z-20">
             <LottiePlayer url={mascot} className="w-full h-full" />
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <h1 className="text-3xl md:text-5xl font-black text-blue-900 mb-2 uppercase leading-none tracking-tighter">
            HABLA, JUEGA<br/>
            <span className="text-blue-500 text-xl md:text-3xl">Y APRENDE ✨</span>
          </h1>
          
          <div className="space-y-4 mt-8">
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMascot(LOTTIE_URLS.mascot_celebrate);
                setTimeout(() => window.location.hash = '#/child/1/play', 500);
              }}
              className="w-full bg-gradient-to-b from-yellow-300 to-orange-400 text-blue-900 font-black py-5 rounded-[2.5rem] shadow-[0_10px_0_rgb(180,130,10)] border-4 border-white text-3xl transition-all"
            >
              ¡JUGAR! 🚀
            </motion.button>
            
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="text-blue-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              PANEL ESPECIALISTA
            </button>
          </div>
        </div>
      </motion.div>

      {/* Destellos ambientales */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <LottiePlayer url={LOTTIE_URLS.stars} className="w-full h-full" />
      </div>
    </div>
  );
};

export default LoginPage;
