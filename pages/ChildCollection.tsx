
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { REWARDS } from '../constants';
import { Child } from '../types';

const ChildCollection: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentChild, setCurrentChild] = useState<Child | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('hja_children') || '[]');
    const child = saved.find((c: any) => c.id === id);
    if (child) {
      setCurrentChild(child);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const unlockedIds = currentChild?.unlockedItems || [];

  return (
    <Layout role="child" stars={currentChild?.stars || 0}>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <header className="text-center mb-12">
           <h2 className="text-[24px] font-bold text-slate-800 mb-2">MI ÁLBUM MÁGICO</h2>
           <p className="text-[18px] text-slate-500">¡Mira todo lo que has conseguido!</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
           {REWARDS.map((reward, idx) => {
             const isUnlocked = unlockedIds.includes(reward.id);
             const canAfford = (currentChild?.coins || 0) >= reward.cost;
             
             return (
               <motion.div 
                 key={reward.id}
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: idx * 0.1 }}
                 whileHover={{ rotate: isUnlocked ? [0, -5, 5, 0] : 0 }}
                 className={`aspect-square rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden border-4 ${isUnlocked ? 'bg-white border-yellow-300' : 'bg-gray-100 border-gray-200'}`}
               >
                 {isUnlocked && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-200/20 to-transparent pointer-events-none" />}
                 <span className={`text-6xl mb-4 ${!isUnlocked && 'grayscale opacity-30'}`}>{isUnlocked ? reward.image : reward.image}</span>
                 <h3 className={`font-black text-center ${isUnlocked ? 'text-blue-900' : 'text-gray-400'}`}>
                   {isUnlocked ? reward.name : 'Bloqueado'}
                 </h3>
                 {!isUnlocked && (
                   <div className="mt-2 flex flex-col items-center">
                     <span className="text-[10px] text-gray-500 uppercase font-black">Cuesta</span>
                     <span className={`text-sm font-black ${canAfford ? 'text-amber-600' : 'text-gray-400'}`}>🪙 {reward.cost}</span>
                   </div>
                 )}
                 {isUnlocked && <div className="absolute top-2 right-2 text-[8px] bg-yellow-400 px-2 py-0.5 rounded-full font-black uppercase">¡MÍO!</div>}
               </motion.div>
             );
           })}
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
           <button 
             onClick={() => navigate(`/child/${id}/play`)}
             className="bg-blue-500 text-white font-bold text-[20px] px-12 py-4 rounded-xl shadow-md hover:bg-blue-600 transition-all"
           >
             SIGUE JUGANDO
           </button>
           
           <button 
             onClick={() => navigate('/dashboard')}
             className="text-slate-400 font-medium text-[16px] hover:text-blue-500 transition-colors"
           >
             Volver al Menú
           </button>
        </div>
      </div>
    </Layout>
  );
};

export default ChildCollection;
