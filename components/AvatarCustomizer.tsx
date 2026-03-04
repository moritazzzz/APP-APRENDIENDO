
import React from 'react';
import { useAvatar } from '../context/AvatarContext';
import Avatar from './Avatar';
import { AvatarType } from '../types';

const TYPES: { id: AvatarType; label: string; icon: string }[] = [
  { id: 'oso', label: 'Oso', icon: '🐻' },
  { id: 'gato', label: 'Gato', icon: '🐱' },
  { id: 'conejo', label: 'Conejo', icon: '🐰' },
  { id: 'perro', label: 'Perro', icon: '🐶' },
];

const COLORS = [
  { id: '#60a5fa', label: 'Azul' },
  { id: '#f87171', label: 'Rojo' },
  { id: '#4ade80', label: 'Verde' },
  { id: '#fbbf24', label: 'Amarillo' },
  { id: '#c084fc', label: 'Morado' },
];

const BG_COLORS = [
  { id: '#f0f9ff', label: 'Cielo' },
  { id: '#fdf2f8', label: 'Rosa' },
  { id: '#f0fdf4', label: 'Menta' },
  { id: '#fffbeb', label: 'Crema' },
  { id: '#fafaf9', label: 'Piedra' },
];

const ACCESSORIES = [
  { id: 'ninguno', label: 'Nada', icon: '❌' },
  { id: 'lentes', label: 'Lentes', icon: '👓' },
  { id: 'moño', label: 'Moño', icon: '🎀' },
  { id: 'gorra', label: 'Gorra', icon: '🧢' },
];

const AvatarCustomizer: React.FC = () => {
  const { avatar, updateAvatar } = useAvatar();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
      {/* Vista previa del Avatar */}
      <div className="flex flex-col items-center gap-6 bg-slate-50 p-12 rounded-[2rem] border border-slate-100">
        <Avatar 
          tipo={avatar.tipo} 
          color={avatar.color} 
          accesorio={avatar.accesorio} 
          animation="idle"
          size={200}
        />
        <input
          type="text"
          placeholder="Tu nombre aquí..."
          value={avatar.nombre}
          onChange={(e) => updateAvatar({ nombre: e.target.value })}
          className="text-center text-[20px] font-bold text-slate-700 bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none px-4 py-2"
        />
      </div>

      {/* Opciones de personalización */}
      <div className="flex-grow flex flex-col gap-8">
        {/* Tipo de personaje */}
        <div>
          <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-widest mb-4">Elige tu amigo</h4>
          <div className="flex gap-4">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => updateAvatar({ tipo: t.id })}
                className={`w-16 h-16 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                  avatar.tipo === t.id ? 'bg-blue-500 text-white shadow-md scale-110' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Colores */}
        <div>
          <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tu color favorito</h4>
          <div className="flex gap-4">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => updateAvatar({ color: c.id })}
                style={{ backgroundColor: c.id }}
                className={`w-10 h-10 rounded-full transition-all ${
                  avatar.color === c.id ? 'ring-4 ring-blue-100 scale-125' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Fondo */}
        <div>
          <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-widest mb-4">Color de fondo</h4>
          <div className="flex gap-4">
            {BG_COLORS.map((bc) => (
              <button
                key={bc.id}
                onClick={() => updateAvatar({ backgroundColor: bc.id })}
                style={{ backgroundColor: bc.id }}
                className={`w-10 h-10 rounded-xl border-2 border-slate-100 transition-all ${
                  avatar.backgroundColor === bc.id ? 'ring-4 ring-blue-100 scale-125 border-blue-200' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Accesorios */}
        <div>
          <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-widest mb-4">Un accesorio</h4>
          <div className="flex gap-4">
            {ACCESSORIES.map((a) => (
              <button
                key={a.id}
                onClick={() => updateAvatar({ accesorio: a.id })}
                className={`px-4 py-2 rounded-xl font-bold text-[14px] flex items-center gap-2 transition-all ${
                  avatar.accesorio === a.id ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
