import React from 'react';
import { Achievement } from '../../types';
import {
  Trophy,
  Sparkles,
  Flame,
  ShieldAlert,
  CheckCheck,
  Award,
  Crown,
  Swords,
  Zap,
  Target,
  Feather,
  ShieldCheck,
  Lock,
  Check,
  HelpCircle,
} from 'lucide-react';

interface AchievementsViewProps {
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const renderIcon = (iconName: string, unlocked: boolean, isSecret: boolean) => {
    if (!unlocked && isSecret) {
      return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }

    const className = `w-5 h-5 ${unlocked ? 'text-amber-400' : 'text-slate-500'}`;

    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'CheckCheck':
        return <CheckCheck className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Swords':
        return <Swords className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Feather':
        return <Feather className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Progreso general de Logros */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-wide">
                Salón de Logros
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Desbloquea hitos de constancia, niveles y victorias legendarias.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl">
            <span className="text-2xl font-black text-amber-300 font-mono">
              {unlockedCount} / {totalCount}
            </span>
            <span className="text-xs font-semibold text-amber-400/90">Desbloqueados</span>
          </div>
        </div>

        {/* Barra de progreso de logros */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-950 rounded-full border border-slate-700/80 overflow-hidden p-0.5">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Progreso de Colección: {progressPercent}%</span>
            <span>{totalCount - unlockedCount} restantes</span>
          </div>
        </div>
      </div>

      {/* Grid de Logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => {
          const isSecretLocked = ach.isSecret && !ach.unlocked;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                  : isSecretLocked
                  ? 'bg-slate-950/70 border-slate-800/80 opacity-60'
                  : 'bg-slate-900/40 border-slate-800 opacity-80'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  ach.unlocked
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-inner'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {renderIcon(ach.icon, ach.unlocked, ach.isSecret)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-sm font-bold tracking-wide truncate ${
                      ach.unlocked
                        ? 'text-slate-100'
                        : isSecretLocked
                        ? 'text-slate-500 font-mono'
                        : 'text-slate-300'
                    }`}
                  >
                    {isSecretLocked ? '??? (Logro Secreto)' : ach.title}
                  </h3>

                  {ach.unlocked ? (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Desbloqueado
                    </span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      <Lock className="w-3 h-3" />
                      Bloqueado
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isSecretLocked
                    ? 'Este logro está oculto. Explora y mantén tu constancia para descubrir su desencadenante.'
                    : ach.description}
                </p>

                {ach.unlockedAt && (
                  <div className="text-[10px] text-slate-500 mt-2">
                    Conseguido el {new Date(ach.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
