export type DifficultyLevel = 'facil' | 'normal' | 'dificil' | 'epico' | 'legendario';

export const DIFFICULTY_XP: Record<DifficultyLevel, number> = {
  facil: 10,
  normal: 25,
  dificil: 50,
  epico: 100,
  legendario: 200,
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  facil: 'Fácil',
  normal: 'Normal',
  dificil: 'Difícil',
  epico: 'Épico',
  legendario: 'Legendario',
};

export type HabitType = 'good' | 'bad';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  difficulty: DifficultyLevel;
  frequency: 'diaria' | 'dias_especificos';
  daysOfWeek: number[]; // 0: Dom, 1: Lun, 2: Mar, 3: Mie, 4: Jue, 5: Vie, 6: Sab
  completedToday: boolean;
  timesCompleted: number;
  timesTriggered: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  difficulty: DifficultyLevel;
  xpReward: number;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  category: 'ropa' | 'accesorio' | 'peinado' | 'efecto' | 'fondo';
  unlockType: 'level' | 'achievement';
  unlockRequirement: number | string; // Nivel requerido o ID de logro
  unlocked: boolean;
  iconName: string;
  previewColor: string;
}

export interface AvatarConfig {
  gender: 'neutral' | 'guerrero' | 'mago';
  ropa: string;
  accesorio: string;
  peinado: string;
  efecto: string;
  fondo: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isSecret: boolean;
  unlocked: boolean;
  unlockedAt?: string;
  progressCurrent?: number;
  progressTarget?: number;
}

export interface UserStats {
  totalXp: number;
  xpGained: number;
  xpLost: number;
  maxStreak: number;
  goodHabitsCompleted: number;
  badHabitsTriggered: number;
  missionsCompleted: number;
  achievementsUnlocked: number;
  completionRate: number;
  hardHabitsCompleted: number;
}

export interface HistoryEvent {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  type: 'habit_good' | 'habit_bad' | 'mission' | 'streak_break' | 'level_up' | 'streak_increment';
  title: string;
  xpChange: number;
  levelBefore?: number;
  levelAfter?: number;
}

export interface UserProfile {
  name: string;
  level: number;
  currentLevelXp: number;
  requiredXpForNext: number;
  streak: number;
  soundEnabled: boolean;
  avatar: AvatarConfig;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface AIAnalysisResult {
  summary: string;
  consistencyInsight: string;
  xpRatioInsight: string;
  streakInsight: string;
  recommendations: string[];
  dataSufficient: boolean;
}

export type NavigationTab = 'inicio' | 'habitos' | 'misiones' | 'logros' | 'estadisticas';
