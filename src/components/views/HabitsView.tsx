import React, { useState } from 'react';
import { Habit, DifficultyLevel, DIFFICULTY_XP, DIFFICULTY_LABELS, HabitType } from '../../types';
import {
  Plus,
  Check,
  Flame,
  AlertOctagon,
  Trash2,
  Calendar,
  Sparkles,
  TrendingDown,
  X,
} from 'lucide-react';

interface HabitsViewProps {
  habits: Habit[];
  onCompleteHabit: (habitId: string) => void;
  onTriggerBadHabit: (habitId: string) => void;
  onCreateHabit: (newHabit: Omit<Habit, 'id' | 'completedToday' | 'timesCompleted' | 'timesTriggered' | 'createdAt'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onCompleteHabit,
  onTriggerBadHabit,
  onCreateHabit,
  onDeleteHabit,
}) => {
  const [activeTab, setActiveTab] = useState<HabitType>('good');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [frequency, setFrequency] = useState<'diaria' | 'dias_especificos'>('diaria');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const daysLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateHabit({
      title: title.trim(),
      description: description.trim() || undefined,
      type: activeTab,
      difficulty,
      frequency,
      daysOfWeek: frequency === 'diaria' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
    });

    setTitle('');
    setDescription('');
    setDifficulty('normal');
    setIsCreating(false);
  };

  const filteredHabits = habits.filter((h) => h.type === activeTab);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header con tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-wide">
            Gestión de Hábitos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Los hábitos buenos incrementan tu XP; los hábitos negativos penalizan tu experiencia.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Crear {activeTab === 'good' ? 'Hábito Bueno' : 'Hábito Malo'}
        </button>
      </div>

      {/* Tabs selector */}
      <div className="flex gap-2 p-1.5 bg-slate-950/70 border border-slate-800/90 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('good')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'good'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Hábitos Buenos (+XP)
        </button>

        <button
          onClick={() => setActiveTab('bad')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bad'
              ? 'bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-red-400" />
          Hábitos Malos (-XP)
        </button>
      </div>

      {/* Formulario Modal de Creación */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-serif">
                Nuevo {activeTab === 'good' ? 'Hábito Positivo' : 'Hábito Negativo'}
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Hábito</label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'good' ? 'Ej. Gym, Estudiar, Leer...' : 'Ej. Scroll en redes, Fumar...'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre cuándo o cómo cumplirlo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dificultades exactas: Fácil (+10/-10), Normal (+25/-25), Difícil (+50/-50), Épico (+100/-100), Legendario (+200/-200) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Dificultad e Impacto de XP
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['facil', 'normal', 'dificil', 'epico', 'legendario'] as DifficultyLevel[]).map((dif) => {
                    const xp = DIFFICULTY_XP[dif];
                    const isSelected = difficulty === dif;
                    return (
                      <button
                        key={dif}
                        type="button"
                        onClick={() => setDifficulty(dif)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? activeTab === 'good'
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-red-500/20 border-red-400 text-red-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-[11px] capitalize">{DIFFICULTY_LABELS[dif]}</div>
                        <div className="text-[10px] font-mono mt-0.5">
                          {activeTab === 'good' ? `+${xp} XP` : `-${xp} XP`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frecuencia y Días */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Frecuencia</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency('diaria')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      frequency === 'diaria'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('dias_especificos')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      frequency === 'dias_especificos'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Días específicos
                  </button>
                </div>

                {frequency === 'dias_especificos' && (
                  <div className="flex justify-between gap-1 mt-3">
                    {daysLabels.map((lbl, idx) => {
                      const active = selectedDays.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(idx)}
                          className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                            active
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Crear Hábito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Hábitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.map((habit) => {
          const xp = DIFFICULTY_XP[habit.difficulty];
          const isGood = habit.type === 'good';

          return (
            <div
              key={habit.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isGood
                  ? habit.completedToday
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600 shadow-xl'
                  : 'bg-slate-900/90 border-red-500/20 hover:border-red-500/40 shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-base font-bold ${
                          isGood && habit.completedToday ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {habit.title}
                      </h3>
                    </div>
                    {habit.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {habit.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                    title="Eliminar hábito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                  <span
                    className={`font-mono font-bold px-2.5 py-0.5 rounded-md border text-xs ${
                      isGood
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {isGood ? `+${xp} XP` : `-${xp} XP`}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-400 capitalize bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {DIFFICULTY_LABELS[habit.difficulty]}
                  </span>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {habit.frequency === 'diaria' ? 'Diario' : 'Días selec.'}
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="mt-5 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {isGood
                    ? `Completado: ${habit.timesCompleted} veces`
                    : `Infracciones: ${habit.timesTriggered} veces`}
                </span>

                {isGood ? (
                  <button
                    disabled={habit.completedToday}
                    onClick={() => onCompleteHabit(habit.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      habit.completedToday
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 cursor-pointer'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    {habit.completedToday ? 'Completado Hoy' : 'Completar Hábito'}
                  </button>
                ) : (
                  <button
                    onClick={() => onTriggerBadHabit(habit.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-md"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    Registrar Infracción (-{xp} XP)
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredHabits.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <p className="text-sm text-slate-400">
              No tienes {activeTab === 'good' ? 'hábitos buenos' : 'hábitos malos'} registrados todavía.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Crear tu primer hábito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
