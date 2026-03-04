import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Child, Level } from '../types';
import { LEVEL_METADATA } from '../constants';

const ChildProgress: React.FC = () => {
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [child, setChild] = useState<Child | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('hja_children');
    if (saved) {
      const children: Child[] = JSON.parse(saved);
      const found = children.find(c => c.id === id);
      if (found) setChild(found);
    }
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, [id]);

  const data = [
    { name: 'Lun', articulacion: 40, vocabulario: 24, comprension: 10 },
    { name: 'Mar', articulacion: 30, vocabulario: 13, comprension: 22 },
    { name: 'Mie', articulacion: 20, vocabulario: 98, comprension: 22 },
    { name: 'Jue', articulacion: 27, vocabulario: 39, comprension: 20 },
    { name: 'Vie', articulacion: 18, vocabulario: 48, comprension: 21 },
    { name: 'Sab', articulacion: 23, vocabulario: 38, comprension: 25 },
    { name: 'Dom', articulacion: 34, vocabulario: 43, comprension: 21 },
  ];

  const phonemeData = child?.progression?.problematicPhonemes 
    ? Object.entries(child.progression.problematicPhonemes).map(([phoneme, count]) => ({
        subject: phoneme.toUpperCase(),
        A: count,
        fullMark: 10,
      }))
    : [
        { subject: 'R', A: 8, fullMark: 10 },
        { subject: 'S', A: 4, fullMark: 10 },
        { subject: 'L', A: 2, fullMark: 10 },
        { subject: 'CH', A: 5, fullMark: 10 },
        { subject: 'G', A: 3, fullMark: 10 },
      ];

  const sessions = [
    { date: '25/02/2026', duration: '15 min', score: 85, topic: 'Fonema /r/' },
    { date: '23/02/2026', duration: '12 min', score: 70, topic: 'Animales granja' },
    { date: '21/02/2026', duration: '20 min', score: 95, topic: 'Comprensión cuentos' },
  ];

  const handleExport = () => {
    window.print();
  };

  const downloadCSV = () => {
    if (!child) return;
    const headers = ['Fecha', 'Duración', 'Módulo', 'Puntuación'];
    const rows = sessions.map(s => [s.date, s.duration, s.topic, `${s.score}%`]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + `Informe de Progreso: ${child.name}\n`
      + `Edad: ${child.age}\n`
      + `Nivel: ${child.level}\n\n`
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `informe_${child.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!child && isLoaded) {
    return (
      <Layout>
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-400">No se encontró el perfil del niño.</h2>
          <button onClick={() => window.location.hash = '#/dashboard'} className="mt-4 text-blue-500 font-bold underline">Volver al panel</button>
        </div>
      </Layout>
    );
  }

  const currentLevelInfo = (child?.level && LEVEL_METADATA[child.level]) ? LEVEL_METADATA[child.level] : LEVEL_METADATA[Level.EASY];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pt-6">
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Informe: {child?.name}</h2>
                 <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{child?.age} AÑOS</span>
              </div>
              <p className="text-slate-400 font-medium text-sm">Análisis detallado de evolución.</p>
           </div>
           <div className="flex gap-2 print:hidden">
             <button 
               onClick={handleExport}
               className="flex-1 sm:flex-none bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all text-sm"
             >
               🖨️ Imprimir PDF
             </button>
             <button 
               onClick={downloadCSV}
               className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all text-sm"
             >
               📥 Descargar CSV
             </button>
             <button 
               onClick={() => window.location.hash = '#/dashboard'}
               className="flex-1 sm:flex-none bg-white border-2 border-slate-100 text-slate-500 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
             >
               ← Volver
             </button>
           </div>
        </div>

        {/* Resumen de Nivel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl">
            <span className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Nivel Actual</span>
            <h3 className="text-xl md:text-2xl font-black mt-1 mb-4">{child?.level}</h3>
            <div className="w-full bg-blue-800/50 h-2.5 rounded-full overflow-hidden mb-2">
              <div className="bg-yellow-400 h-full" style={{ width: `${child?.progression?.levelProgress || 0}%` }} />
            </div>
            <p className="text-blue-100 text-[10px] font-bold">{child?.progression?.levelProgress || 0}% para el siguiente nivel</p>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Dificultad</span>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{currentLevelInfo?.difficulty}</h3>
            <p className="text-slate-500 text-xs mt-1">Precisión mínima: {(currentLevelInfo?.minAccuracy || 0) * 100}%</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Recompensas</span>
            <div className="flex gap-6 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-black text-xl text-slate-800">{child?.stars}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                <span className="font-black text-xl text-slate-800">{child?.coins}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
             <h3 className="font-bold mb-6 md:mb-8 text-slate-700 flex items-center gap-2 text-sm md:text-base">
               <span className="w-1.5 md:w-2 h-5 md:h-6 bg-blue-500 rounded-full"></span>
               Evolución Semanal
             </h3>
             <div className="w-full h-[250px] md:h-[300px]">
                {isLoaded ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '10px' }} />
                      <Line type="monotone" name="Precisión" dataKey="articulacion" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-slate-50 animate-pulse rounded-2xl" />
                )}
             </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
             <h3 className="font-bold mb-6 md:mb-8 text-slate-700 flex items-center gap-2 text-sm md:text-base">
               <span className="w-1.5 md:w-2 h-5 md:h-6 bg-red-500 rounded-full"></span>
               Dificultades por Fonema
             </h3>
             <div className="w-full h-[250px] md:h-[300px]">
                {isLoaded ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={phonemeData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontWeight: 'bold', fontSize: 10}} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
                      <Radar name="Errores" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-slate-50 animate-pulse rounded-2xl" />
                )}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
          <div className="lg:col-span-1 bg-red-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-red-100">
            <h3 className="font-black text-red-800 text-[10px] md:text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              ⚠️ Alertas Automáticas
            </h3>
            <div className="space-y-4">
              {Object.keys(child?.progression?.problematicPhonemes || {}).length > 0 ? (
                Object.entries(child?.progression?.problematicPhonemes || {}).map(([phoneme, count]) => (
                  <div key={phoneme} className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
                    <p className="text-[9px] font-bold text-red-600 uppercase">Dificultad Crítica</p>
                    <p className="text-xs md:text-sm text-slate-700 font-medium mt-1">El fonema <span className="font-black">/{phoneme}/</span> presenta {count} fallos consecutivos.</p>
                  </div>
                ))
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
                  <p className="text-[9px] font-bold text-green-600 uppercase">Todo en orden</p>
                  <p className="text-xs md:text-sm text-slate-700 font-medium mt-1">No se detectan patrones de error críticos.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-blue-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-blue-100">
            <h3 className="font-black text-blue-800 text-[10px] md:text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              🤖 Recomendaciones de IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-blue-100">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg md:text-xl mb-4">🎯</div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm md:text-base">Enfoque Sugerido</h4>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">Priorizar ejercicios de articulación con el fonema /r/ en posición inicial.</p>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-blue-100">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg md:text-xl mb-4">📈</div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm md:text-base">Ajuste de Dificultad</h4>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">El niño está listo para avanzar a frases cortas en el módulo de vocabulario.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
             <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider">Historial de Sesiones Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Fecha</th>
                  <th className="px-8 py-5">Duración</th>
                  <th className="px-8 py-5">Módulo Principal</th>
                  <th className="px-8 py-5">Puntuación</th>
                  <th className="px-8 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 font-bold text-slate-700">{s.date}</td>
                    <td className="px-8 py-6 text-slate-500 font-medium">{s.duration}</td>
                    <td className="px-8 py-6">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{s.topic}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[80px] bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${s.score}%` }} />
                        </div>
                        <span className="text-xs font-black text-blue-600 w-8">{s.score}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:underline print:hidden">
                        Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hidden print:block mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs font-bold">
          Informe generado automáticamente por Habla, Juega y Aprende el {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </Layout>
  );
};

export default ChildProgress;
