import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserStats, Habit, DifficultyLevel, DIFFICULTY_XP } from '../../types';
import { AvatarView } from '../AvatarView';
import {
  Flame,
  CheckCircle2,
  Trophy,
  Swords,
  Edit2,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile;
  stats: UserStats;
  habits: Habit[];
  onUpdateName: (name: string) => void;
  onOpenArmory: () => void;
  onCompleteHabit: (habitId: string) => void;
  onNavigateToTab: (tab: 'habitos' | 'misiones' | 'logros' | 'estadisticas') => void;
  onBreakStreakSimulate: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  stats,
  habits,
  onUpdateName,
  onOpenArmory,
  onCompleteHabit,
  onNavigateToTab,
  onBreakStreakSimulate,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const xpProgressPercent = Math.min(
    100,
    Math.max(0, (profile.currentLevelXp / profile.requiredXpForNext) * 100)
  );

  // Hábitos positivos activos para hoy
  const todayGoodHabits = habits.filter((h) => h.type === 'good');
  const completedGoodHabitsCount = todayGoodHabits.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 3. PERFIL PRINCIPAL: EN LA PARTE SUPERIOR DEBE APARECER ÚNICAMENTE MI NOMBRE */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                maxLength={24}
                className="bg-slate-900 border border-amber-500/80 rounded-lg px-3 py-1 text-xl font-bold text-white font-serif tracking-wide focus:outline-none shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
              >
                Guardar
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-serif drop-shadow">
                {profile.name}
              </h1>
              <button
                onClick={() => {
                  setTempName(profile.name);
                  setIsEditingName(true);
                }}
                className="p-1 text-slate-500 hover:text-amber-400 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                title="Editar nombre"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Botón rápido para abrir cosméticos */}
        <button
          onClick={onOpenArmory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-xs font-medium transition-all shadow-md cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Armería de Avatar</span>
          <span className="sm:hidden">Avatar</span>
        </button>
      </div>

      {/* HERO SECTION: AVATAR + NIVEL + BARRA DE XP DESTACADA */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow atmosférico RPG */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Avatar interactivo */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative cursor-pointer" onClick={onOpenArmory}>
              <AvatarView config={profile.avatar} level={profile.level} size="lg" />
              <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                <span className="bg-slate-950/90 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md backdrop-blur-sm">
                  Personalizar
                </span>
              </div>
            </div>
          </div>

          {/* Nivel y Gran Barra de XP */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Rango de Personaje
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-100 font-serif tracking-tight">
                    NIVEL {profile.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {profile.level >= 50
                      ? 'Rango Legendario'
                      : profile.level >= 25
                      ? 'Rango Guardián'
                      : profile.level >= 10
                      ? 'Rango Veterano'
                      : 'Rango Iniciado'}
                  </span>
                </div>
              </div>

              {/* Racha actual */}
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl shadow-inner">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                    Racha Actual
                  </span>
                  <span className="text-lg font-black text-amber-200 font-mono leading-none">
                    {profile.streak} {profile.streak === 1 ? 'DÍA' : 'DÍAS'}
                  </span>
                </div>
              </div>
            </div>

            {/* BARRA DE XP PRINCIPAL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Experiencia de Nivel
                </span>
                <span className="font-mono text-amber-300 font-bold tracking-wide">
                  {profile.currentLevelXp.toLocaleString()} / {profile.requiredXpForNext.toLocaleString()} XP
                </span>
              </div>

              {/* Contenedor de la Barra */}
              <div className="relative h-6 w-full bg-slate-950 rounded-xl border border-slate-700/80 overflow-hidden shadow-inner p-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgressPercent}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                  className="h-full rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:16px_16px]" />
                </motion.div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Progreso: {Math.round(xpProgressPercent)}%</span>
                <span>Faltan {(profile.requiredXpForNext - profile.currentLevelXp).toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRICAS PRINCIPALES DEL PERFIL: Racha, Hábitos, Misiones, Logros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Racha Actual</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{profile.streak}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Récord: {stats.maxStreak} días</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Hábitos Realizados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{stats.goodHabitsCompleted}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hoy: {completedGoodHabitsCount}/{todayGoodHabits.length}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Misiones Éxito</span>
            <Swords className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{stats.missionsCompleted}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Objetivos especiales</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Logros Desbloqueados</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{stats.achievementsUnlocked}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hazañas logradas</div>
          </div>
        </div>
      </div>

      {/* OBJETIVOS RÁPIDOS DE HOY */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Hábitos de Hoy ({completedGoodHabitsCount}/{todayGoodHabits.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Completa tus hábitos diarios para ganar XP y proteger tu racha.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('habitos')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Ver todos
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {todayGoodHabits.slice(0, 4).map((habit) => {
            const xpValue = DIFFICULTY_XP[habit.difficulty];
            return (
              <div
                key={habit.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  habit.completedToday
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        habit.completedToday ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      +{xpValue} XP
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {habit.difficulty}
                    </span>
                  </div>
                </div>

                <button
                  disabled={habit.completedToday}
                  onClick={() => onCompleteHabit(habit.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    habit.completedToday
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 cursor-pointer shadow-md'
                  }`}
                  title={habit.completedToday ? 'Completado hoy' : 'Marcar como completado'}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control discreto de simulación de racha para verificar penalizaciones */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-slate-300">Prueba de Mecánica de Racha:</span>{' '}
          Si rompes tu racha, se reinicia a 0 y pierdes exactamente 2 niveles (con piso en Nivel 1).
        </div>
        <button
          onClick={onBreakStreakSimulate}
          className="shrink-0 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors cursor-pointer"
        >
          Simular Romper Racha
        </button>
      </div>
    </div>
  );
};
