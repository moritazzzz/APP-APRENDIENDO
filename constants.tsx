
import React from 'react';
import { Level } from './types';

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  background: '#f0f9ff',
  card: '#ffffff'
};

export const LOTTIE_URLS = {
  mascot_idle: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/pet_supplies/default/24px.svg',
  mascot_happy: 'https://assets2.lottiefiles.com/packages/lf20_myejioos.json', 
  mascot_encourage: 'https://assets1.lottiefiles.com/private_files/lf30_8np77z9t.json', 
  mascot_celebrate: 'https://assets5.lottiefiles.com/packages/lf20_touohxv0.json',
  confetti: 'https://assets5.lottiefiles.com/packages/lf20_xh839orv.json',
  stars: 'https://assets10.lottiefiles.com/packages/lf20_ay3mufz3.json',
  clouds: 'https://assets3.lottiefiles.com/packages/lf20_skm9v6qv.json'
};

export const LEVEL_METADATA = {
  [Level.EXPLORER]: {
    name: 'Explorador de Sonidos',
    description: '¡Comienza tu viaje descubriendo sonidos mágicos!',
    difficulty: 'Sílabas simples',
    minAccuracy: 0.6,
    maxAttempts: 5,
    phonemes: ['m', 'p', 'b', 't', 'd']
  },
  [Level.ADVENTURER]: {
    name: 'Aventurero del Habla',
    description: '¡Explora palabras nuevas en la selva del lenguaje!',
    difficulty: 'Palabras bisílabas',
    minAccuracy: 0.7,
    maxAttempts: 4,
    phonemes: ['f', 's', 'l', 'n', 'k']
  },
  [Level.MAESTRO]: {
    name: 'Maestro de Palabras',
    description: '¡Domina los sonidos más divertidos y complejos!',
    difficulty: 'Sílabas trabadas (bl, cl, fl)',
    minAccuracy: 0.75,
    maxAttempts: 3,
    phonemes: ['r', 'rr', 'g', 'j', 'ch']
  },
  [Level.CHAMPION]: {
    name: 'Campeón de Frases',
    description: '¡Construye puentes de palabras y oraciones!',
    difficulty: 'Frases cortas',
    minAccuracy: 0.8,
    maxAttempts: 3,
    phonemes: ['todos']
  },
  [Level.LEGEND]: {
    name: 'Leyenda del Lenguaje',
    description: '¡Eres un experto comunicador del universo!',
    difficulty: 'Narración y fluidez',
    minAccuracy: 0.85,
    maxAttempts: 2,
    phonemes: ['todos']
  },
  [Level.EASY]: {
    name: 'Nivel Fácil',
    description: 'Ejercicios sencillos para empezar.',
    difficulty: 'Sílabas simples',
    minAccuracy: 0.6,
    maxAttempts: 5,
    phonemes: ['m', 'p', 'b']
  },
  [Level.MEDIUM]: {
    name: 'Nivel Intermedio',
    description: 'Ejercicios con palabras comunes.',
    difficulty: 'Palabras bisílabas',
    minAccuracy: 0.7,
    maxAttempts: 4,
    phonemes: ['f', 's', 'l']
  },
  [Level.HARD]: {
    name: 'Nivel Difícil',
    description: 'Ejercicios complejos y frases.',
    difficulty: 'Sílabas trabadas',
    minAccuracy: 0.8,
    maxAttempts: 3,
    phonemes: ['r', 'rr']
  }
};

export const ACHIEVEMENTS = [
  { id: 'first_star', name: 'Primera Estrella', description: '¡Tu primer paso en el camino!', icon: '⭐' },
  { id: 'r_master', name: 'Maestro de la R', description: '¡Pronunciaste la R perfectamente!', icon: '🦁' },
  { id: '3_day_streak', name: 'Constancia de Hierro', description: '¡Jugaste 3 días seguidos!', icon: '🔥' },
  { id: 'level_up', name: 'Subida de Nivel', description: '¡Desbloqueaste un nuevo mundo!', icon: '🆙' },
  { id: 'perfect_score', name: 'Perfección', description: '¡100% de precisión en un ejercicio!', icon: '🎯' }
];

export const MOTIVATIONAL_PHRASES = {
  success: [
    "¡Increíble! ¡Lo hiciste genial!",
    "¡Eres un superhéroe!",
    "¡Tu voz suena fantástica!",
    "¡Sigue así, vas bien!",
    "¡Me encanta cómo suena!"
  ],
  almost: [
    "¡Casi lo tienes, campeón!",
    "¡Muy cerca! ¡Una más!",
    "¡Casi! ¡Tú puedes!",
    "¡Qué buen intento!",
    "¡Ya casi sale perfecto!"
  ],
  retry: [
    "¡Vamos, tú puedes!",
    "¡Inténtalo otra vez!",
    "¡Casi sale, otra vez!",
    "¡Sigue practicando!",
    "¡Una vez más, amigo!"
  ],
  levelUp: [
    "¡Felicidades! ¡Nuevo nivel!",
    "¡Eres imparable!",
    "¡Nuevos mundos te esperan!"
  ]
};

export const REWARDS: any[] = [
  { id: '1', name: 'Estrella Fugaz', image: '✨', requirement: 10, cost: 50 },
  { id: '2', name: 'Super Cohete', image: '🚀', requirement: 30, cost: 150 },
  { id: '3', name: 'Dinosaurio Alegre', image: '🦖', requirement: 60, cost: 300 },
  { id: '4', name: 'Castillo Mágico', image: '🏰', requirement: 100, cost: 500 },
  { id: '5', name: 'Amigo Robot', image: '🤖', requirement: 150, cost: 800 },
];
