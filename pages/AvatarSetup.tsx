
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import AvatarCustomizer from '../components/AvatarCustomizer';
import { useAvatar } from '../context/AvatarContext';

const AvatarSetup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { avatar } = useAvatar();

  const handleFinish = () => {
    if (!avatar.nombre.trim()) {
      alert("¡Por favor, escribe tu nombre!");
      return;
    }
    navigate(`/child/${id}/play`);
  };

  return (
    <Layout role="child">
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-[28px] font-bold text-slate-800 mb-2">¡Crea tu personaje!</h2>
          <p className="text-[18px] text-slate-500">Personaliza a tu amigo para empezar a jugar</p>
        </div>

        <AvatarCustomizer />

        <button
          onClick={handleFinish}
          className="mt-12 bg-blue-500 text-white font-bold text-[20px] px-16 py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-all active:scale-95"
        >
          ¡TODO LISTO! 🚀
        </button>
      </div>
    </Layout>
  );
};

export default AvatarSetup;
