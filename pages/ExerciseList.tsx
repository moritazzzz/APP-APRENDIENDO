
import React from 'react';
import Layout from '../components/Layout';
import { ExerciseType, Level } from '../types';

const ExerciseList: React.FC = () => {
  const exercises = [
    { id: '1', type: ExerciseType.ARTICULATION, level: Level.EASY, content: 'Fonema /r/ inicial', usage: 12 },
    { id: '2', type: ExerciseType.VOCABULARY, level: Level.MEDIUM, content: 'Frutas tropicales', usage: 45 },
    { id: '3', type: ExerciseType.SENTENCES, level: Level.HARD, content: 'Estructura Sujeto + Verbo + Predicado', usage: 8 }
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Biblioteca de Ejercicios</h2>
          <p className="text-gray-500">Explora o crea nuevos materiales terapéuticos.</p>
        </div>
        <a href="#/ai-generator" className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-purple-700 transition-all">
          ✨ Crear con IA
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map(ex => (
          <div key={ex.id} className="bg-white border rounded-2xl p-6 hover:shadow-md transition-all group">
            <div className="flex justify-between mb-4">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{ex.type}</span>
              <span className="text-gray-400 text-xs">Usado {ex.usage} veces</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{ex.content}</h3>
            <div className="flex items-center gap-2 mb-6">
               <span className={`w-3 h-3 rounded-full ${ex.level === Level.EASY ? 'bg-green-400' : ex.level === Level.MEDIUM ? 'bg-yellow-400' : 'bg-red-400'}`} />
               <span className="text-sm font-medium text-gray-600">{ex.level}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 hover:bg-blue-500 hover:text-white py-2 rounded-lg font-bold text-sm transition-all">Editar</button>
              <button className="flex-1 bg-gray-100 hover:bg-red-500 hover:text-white py-2 rounded-lg font-bold text-sm transition-all">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default ExerciseList;
