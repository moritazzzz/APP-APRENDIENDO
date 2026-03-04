
import React from 'react';
import { motion } from 'framer-motion';
import { AvatarType, AvatarAnimation } from '../types';

interface AvatarProps {
  tipo: AvatarType | null;
  color: string | null;
  accesorio: string | null;
  animation?: AvatarAnimation;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ tipo, color, accesorio, animation = 'idle', size = 120 }) => {
  if (!tipo) return null;

  const baseColor = color || '#60a5fa';

  const variants = {
    idle: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
    },
    greet: {
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.5, repeat: 2 }
    },
    clap: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3, repeat: 4 }
    },
    celebrate: {
      y: [0, -20, 0],
      scale: [1, 1.2, 1],
      transition: { duration: 0.5, repeat: 2 }
    }
  };

  const renderShape = () => {
    switch (tipo) {
      case 'oso':
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={baseColor} />
            <circle cx="20" cy="20" r="12" fill={baseColor} />
            <circle cx="80" cy="20" r="12" fill={baseColor} />
            <circle cx="35" cy="45" r="4" fill="white" />
            <circle cx="65" cy="45" r="4" fill="white" />
            <path d="M40 65 Q50 75 60 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'gato':
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={baseColor} />
            <path d="M15 25 L30 15 L40 30 Z" fill={baseColor} />
            <path d="M85 25 L70 15 L60 30 Z" fill={baseColor} />
            <circle cx="35" cy="45" r="4" fill="white" />
            <circle cx="65" cy="45" r="4" fill="white" />
            <path d="M30 60 Q50 70 70 60" stroke="white" strokeWidth="2" fill="none" />
          </g>
        );
      case 'conejo':
        return (
          <g>
            <circle cx="50" cy="55" r="35" fill={baseColor} />
            <ellipse cx="35" cy="20" rx="10" ry="25" fill={baseColor} />
            <ellipse cx="65" cy="20" rx="10" ry="25" fill={baseColor} />
            <circle cx="40" cy="50" r="3" fill="white" />
            <circle cx="60" cy="50" r="3" fill="white" />
            <circle cx="50" cy="60" r="4" fill="#fca5a5" />
          </g>
        );
      case 'perro':
        return (
          <g>
            <rect x="15" y="20" width="70" height="60" rx="30" fill={baseColor} />
            <path d="M15 30 Q5 50 15 70" fill={baseColor} />
            <path d="M85 30 Q95 50 85 70" fill={baseColor} />
            <circle cx="35" cy="45" r="4" fill="white" />
            <circle cx="65" cy="45" r="4" fill="white" />
            <circle cx="50" cy="55" r="6" fill="#334155" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    switch (accesorio) {
      case 'lentes':
        return (
          <g stroke="white" strokeWidth="2" fill="none">
            <circle cx="35" cy="45" r="8" />
            <circle cx="65" cy="45" r="8" />
            <line x1="43" y1="45" x2="57" y2="45" />
          </g>
        );
      case 'moño':
        return (
          <path d="M40 80 L60 90 L60 70 L40 80 Z M60 80 L40 90 L40 70 L60 80 Z" fill="#f43f5e" />
        );
      case 'gorra':
        return (
          <g>
            <path d="M30 30 Q50 15 70 30 L75 35 L25 35 Z" fill="#1e293b" />
            <rect x="25" y="32" width="50" height="4" rx="2" fill="#1e293b" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      animate={animation}
      variants={variants}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {renderShape()}
        {renderAccessory()}
      </svg>
    </motion.div>
  );
};

export default Avatar;
