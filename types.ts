
export enum Level {
  EXPLORER = 'Explorador de Sonidos',
  ADVENTURER = 'Aventurero del Habla',
  MAESTRO = 'Maestro de Palabras',
  CHAMPION = 'Campeón de Frases',
  LEGEND = 'Leyenda del Lenguaje',
  EASY = 'Fácil',
  MEDIUM = 'Intermedio',
  HARD = 'Difícil'
}

export enum ExerciseType {
  ARTICULATION = 'Articulación',
  VOCABULARY = 'Vocabulario',
  COMPREHENSION = 'Comprensión',
  SENTENCES = 'Oraciones',
  MISSION = 'Misión Especial',
  PUZZLE = 'Rompecabezas'
}

export enum RewardTrigger {
  CONFETTI = 'Confeti Mágico',
  STARS = 'Lluvia de Estrellas',
  SOUND = 'Sonido Triunfal',
  MASCOT = 'Baile de Mascota'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateUnlocked?: string;
}

export interface ProgressionState {
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  problematicPhonemes: Record<string, number>;
  levelProgress: number; // 0 to 100
}

export type AvatarType = 'oso' | 'gato' | 'conejo' | 'perro';
export type AvatarAnimation = 'idle' | 'greet' | 'clap' | 'celebrate';

export interface AvatarConfig {
  tipo: AvatarType | null;
  color: string | null;
  backgroundColor: string | null;
  accesorio: string | null;
  nombre: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  characteristics: string;
  objectives: string[];
  level: Level;
  stars: number;
  coins: number;
  collection: string[];
  achievements: Achievement[];
  unlockedItems: string[];
  progression: ProgressionState;
  preferences: string;
  lastSession?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  level: Level;
  content: string;
  target?: string;
  options?: string[];
  imageUrl?: string;
  audioUrl?: string;
  durationSec?: number;
  repetitions?: number;
  rewardTrigger?: RewardTrigger;
}

export interface Session {
  id: string;
  childId: string;
  date: string;
  durationSec: number;
  results: ExerciseResult[];
}

export interface ExerciseResult {
  exerciseId: string;
  status: 'correct' | 'improving' | 'repeat';
  score: number;
}
