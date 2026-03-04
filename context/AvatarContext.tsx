
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AvatarConfig } from '../types';

interface AvatarContextType {
  avatar: AvatarConfig;
  setAvatar: (config: AvatarConfig) => void;
  updateAvatar: (updates: Partial<AvatarConfig>) => void;
}

const defaultAvatar: AvatarConfig = {
  tipo: 'oso',
  color: '#60a5fa', // blue-400
  backgroundColor: '#f0f9ff', // default light blue
  accesorio: 'ninguno',
  nombre: '',
};

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatar, setAvatarState] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('hja_avatar');
    return saved ? JSON.parse(saved) : defaultAvatar;
  });

  const setAvatar = (config: AvatarConfig) => {
    setAvatarState(config);
    localStorage.setItem('hja_avatar', JSON.stringify(config));
  };

  const updateAvatar = (updates: Partial<AvatarConfig>) => {
    const newAvatar = { ...avatar, ...updates };
    setAvatarState(newAvatar);
    localStorage.setItem('hja_avatar', JSON.stringify(newAvatar));
  };

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar, updateAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
