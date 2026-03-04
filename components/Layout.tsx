
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  role?: 'therapist' | 'child';
  stars?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, title, role = 'therapist', stars = 0 }) => {
  const navigate = useNavigate();
  const { avatar } = useAvatar();
  const childBgUrl = "https://img.freepik.com/premium-vector/nature-landscape-with-kids-playing-park_29937-4340.jpg";

  const containerStyle: React.CSSProperties = {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    ...(role === 'child' ? {
      backgroundColor: avatar.backgroundColor || '#ffffff',
    } : {
      backgroundColor: '#f8fafc'
    })
  };

  return (
    <div style={containerStyle}>
      {role === 'child' && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-0 pointer-events-none" />
      )}

      <header className={`${role === 'child' ? 'bg-white/95 h-[50px]' : 'bg-white h-16 md:h-20'} border-b px-4 shadow-sm flex items-center justify-between sticky top-0 z-50 flex-shrink-0 transition-all`}>
        {role === 'therapist' ? (
          <Link to="/" className="flex items-center gap-2 group cursor-pointer overflow-hidden">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg"
            >
              H
            </motion.div>
            <h1 className="text-sm md:text-xl font-black text-blue-800 tracking-tight group-hover:text-blue-600 transition-colors whitespace-nowrap hidden xs:block">
              HABLA, JUEGA Y APRENDE
            </h1>
          </Link>
        ) : (
          <div className="w-10" /> // Spacer to balance
        )}
        
        <div className="flex items-center gap-4">
           {role === 'therapist' && (
             <div className="hidden md:flex flex-col items-end mr-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoy</span>
               <span className="text-sm font-bold text-slate-700">
                 {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
               </span>
             </div>
           )}
           {role === 'child' && (
             <motion.div 
               initial={{ scale: 0.8 }}
               animate={{ scale: 1 }}
               className="flex items-center gap-2 bg-white px-4 py-1 rounded-full text-blue-900 font-bold border-2 border-blue-100 shadow-sm text-lg"
             >
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >⭐</motion.span>
                <span className="text-[18px]">{stars}</span>
             </motion.div>
           )}
           {role === 'therapist' && (
             <button 
               onClick={() => navigate('/')}
               className="flex items-center gap-1 text-[10px] md:text-sm bg-red-500 hover:bg-red-600 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl transition-all text-white font-black border-2 border-white shadow-md active:scale-90"
             >
               <span>🚪 Salir</span>
             </button>
           )}
           {role === 'child' && (
             <button 
               onClick={() => navigate('/')}
               className="text-[12px] text-slate-400 font-bold hover:text-slate-600 transition-colors"
             >
               SALIR
             </button>
           )}
        </div>
      </header>
      
      <main className={`relative z-10 w-full flex-grow overflow-hidden flex flex-col`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.hash}
            className="w-full h-full flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-full h-full overflow-y-auto custom-scrollbar ${role === 'child' ? 'p-2 md:p-6' : 'max-w-7xl mx-auto px-4 py-6 w-full'}`}>
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
