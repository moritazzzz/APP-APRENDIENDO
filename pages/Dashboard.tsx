
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Child, Level } from '../types';

const Dashboard: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [viewingDetails, setViewingDetails] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: 5,
    characteristics: '',
    level: Level.EXPLORER
  });

  useEffect(() => {
    const saved = localStorage.getItem('hja_children');
    if (saved) {
      setChildren(JSON.parse(saved));
    } else {
      const initial: Child[] = [
        { 
          id: '1', 
          name: 'Mateo R.', 
          age: 5, 
          characteristics: 'Dificultad con fonema /r/, le gusta el espacio.', 
          objectives: [], 
          level: Level.EXPLORER, 
          stars: 45, 
          coins: 120,
          collection: [], 
          achievements: [],
          unlockedItems: [],
          progression: {
            consecutiveSuccesses: 0,
            consecutiveFailures: 0,
            problematicPhonemes: { 'r': 5 },
            levelProgress: 40
          },
          preferences: 'Dinosaurios y el espacio',
          lastSession: '25/02/26' 
        },
      ];
      setChildren(initial);
      localStorage.setItem('hja_children', JSON.stringify(initial));
    }
  }, []);

  const saveToLocal = (newChildren: Child[]) => {
    setChildren(newChildren);
    localStorage.setItem('hja_children', JSON.stringify(newChildren));
  };

  const handleOpenModal = (child?: Child) => {
    if (child) {
      setEditingChild(child);
      setFormData({ name: child.name, age: child.age, characteristics: child.characteristics, level: child.level });
    } else {
      setEditingChild(null);
      setFormData({ name: '', age: 5, characteristics: '', level: Level.EXPLORER });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChild) {
      const updated = children.map(c => c.id === editingChild.id ? { ...c, ...formData } : c);
      saveToLocal(updated);
    } else {
      const newChild: Child = {
        id: Date.now().toString(),
        ...formData,
        objectives: [],
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
        preferences: formData.characteristics,
        lastSession: new Date().toLocaleDateString()
      };
      saveToLocal([...children, newChild]);
    }
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 h-full flex flex-col">
        <header className="py-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Panel de Control</h2>
            <p className="text-slate-400 font-medium">Gestiona y personaliza cada sesión de forma sencilla.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            + Añadir Niño
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {children.map((child) => (
            <motion.div
              layout
              key={child.id}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600 border border-slate-100">
                  {child.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{child.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md uppercase tracking-wider">{child.age} años</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md uppercase tracking-wider">{child.level}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                 <button 
                   onClick={() => setViewingDetails(viewingDetails === child.id ? null : child.id)}
                   className="text-[11px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                 >
                   {viewingDetails === child.id ? '🔼 Ocultar detalles' : '🔽 Ver necesidades terapéuticas'}
                 </button>
                 
                 <AnimatePresence>
                   {viewingDetails === child.id && (
                     <motion.p 
                       initial={{ height: 0, opacity: 0 }} 
                       animate={{ height: 'auto', opacity: 1 }} 
                       exit={{ height: 0, opacity: 0 }}
                       className="text-xs text-slate-500 leading-relaxed overflow-hidden italic"
                     >
                       "{child.characteristics}"
                     </motion.p>
                   )}
                 </AnimatePresence>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                     ⭐ {child.stars}
                   </div>
                   <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                     🪙 {child.coins || 0}
                   </div>
                   <div className="flex items-center gap-1 text-purple-500 font-bold text-sm">
                     🏆 {child.achievements?.length || 0}
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => window.location.hash = `#/child/${child.id}/avatar`}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-green-600 transition-colors"
                    >
                      Jugar
                    </button>
                    <button 
                      onClick={() => window.location.hash = `#/progress/${child.id}`}
                      className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
                    >
                      Informe
                    </button>
                    <button 
                      onClick={() => handleOpenModal(child)}
                      className="p-2.5 text-slate-400 hover:text-blue-500 transition-all"
                    >
                      ✏️
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal Simplificado */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.form 
                onSubmit={handleSubmit}
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-md rounded-[2.5rem] p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Perfil del Alumno</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <input 
                      required placeholder="Nombre completo" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-medium outline-none focus:border-blue-400 transition-all"
                    />
                    <input 
                      placeholder="Edad" type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                      className="bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-medium outline-none"
                    />
                  </div>
                  <select 
                    value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as Level})}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-medium outline-none"
                  >
                    {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <textarea 
                    required value={formData.characteristics} onChange={e => setFormData({...formData, characteristics: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl p-3 font-medium h-24 resize-none outline-none focus:border-blue-400"
                    placeholder="Describe necesidades, estilo de aprendizaje y gustos..."
                  />
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-100">Guardar</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-50 text-slate-500 font-bold py-3.5 rounded-2xl">Cerrar</button>
                  </div>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Dashboard;
