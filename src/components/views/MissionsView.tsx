import React, { useState } from 'react';
import { Mission, DifficultyLevel, DIFFICULTY_XP, DIFFICULTY_LABELS } from '../../types';
import { Swords, Plus, Check, Clock, Trash2, X, Sparkles } from 'lucide-react';

interface MissionsViewProps {
  missions: Mission[];
  onCompleteMission: (missionId: string) => void;
  onCreateMission: (newMission: Omit<Mission, 'id' | 'completed' | 'xpReward' | 'createdAt'>) => void;
  onDeleteMission: (missionId: string) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  onCompleteMission,
  onCreateMission,
  onDeleteMission,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [dueDate, setDueDate] = useState('Esta semana');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateMission({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      dueDate: dueDate.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setDifficulty('normal');
    setDueDate('Esta semana');
    setIsCreating(false);
  };

  const activeMissions = missions.filter((m) => !m.completed);
  const completedMissions = missions.filter((m) => m.completed);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-wide">
              Misiones
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Retos y objetivos especiales que entregan experiencia según su dificultad.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nueva Misión
        </button>
      </div>

      {/* Modal de Creación */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-serif">
                Crear Nueva Misión
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre de la Misión</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Terminar proyecto, Correr 10k, Semana sin azúcar..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción / Condiciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre los requerimientos para considerarla completada..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dificultades con XP automático */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Dificultad (XP calculado automáticamente)
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
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-[11px] capitalize">{DIFFICULTY_LABELS[dif]}</div>
                        <div className="text-[10px] font-mono font-bold mt-0.5 text-amber-400">
                          +{xp} XP
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fecha o Periodo de Realización</label>
                <input
                  type="text"
                  placeholder="Ej. Hoy, Este fin de semana, Fin de mes..."
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
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
                  Lanzar Misión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Misiones Activas */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>En Curso</span>
          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-xs font-mono">
            {activeMissions.length}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMissions.map((mission) => {
            const xp = DIFFICULTY_XP[mission.difficulty];
            return (
              <div
                key={mission.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/40 shadow-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-100">
                        {mission.title}
                      </h4>
                      {mission.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {mission.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteMission(mission.id)}
                      className="text-slate-600 hover:text-red-400 p-1"
                      title="Eliminar misión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                    <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      +{xp} XP
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 capitalize bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {DIFFICULTY_LABELS[mission.difficulty]}
                    </span>
                    {mission.dueDate && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mission.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => onCompleteMission(mission.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    Completar Misión (+{xp} XP)
                  </button>
                </div>
              </div>
            );
          })}

          {activeMissions.length === 0 && (
            <div className="col-span-full text-center py-10 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <p className="text-sm text-slate-400">
                No tienes misiones activas. ¡Crea una nueva misión para desafiar tus límites!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Misiones Completadas */}
      {completedMissions.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>Completadas</span>
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-xs font-mono">
              {completedMissions.length}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-75">
            {completedMissions.map((mission) => (
              <div
                key={mission.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-400 line-through">
                    {mission.title}
                  </h4>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    +{DIFFICULTY_XP[mission.difficulty]} XP ganados
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Completada
                  </span>
                  <button
                    onClick={() => onDeleteMission(mission.id)}
                    className="text-slate-600 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
