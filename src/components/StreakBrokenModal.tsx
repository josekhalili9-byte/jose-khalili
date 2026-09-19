import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Flame, TrendingDown, ArrowRight } from 'lucide-react';

interface StreakBrokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousLevel: number;
  newLevel: number;
  lostStreak: number;
}

export const StreakBrokenModal: React.FC<StreakBrokenModalProps> = ({
  isOpen,
  onClose,
  previousLevel,
  newLevel,
  lostStreak,
}) => {
  if (!isOpen) return null;

  const levelsLost = previousLevel - newLevel;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-md bg-gradient-to-b from-red-950/60 via-slate-900 to-slate-950 border-2 border-red-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.35)] text-center overflow-hidden"
        >
          {/* Luz de advertencia pulsante */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10">
            <motion.div
              initial={{ rotate: -15, scale: 0.7 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-400 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <AlertTriangle className="w-8 h-8" />
            </motion.div>

            <h1 className="text-3xl font-extrabold tracking-wider text-red-400 uppercase font-serif drop-shadow mb-1">
              RACHA ROTA
            </h1>
            <p className="text-xs uppercase tracking-widest text-red-300/80 font-bold mb-4">
              Penalización de Inactividad
            </p>

            <div className="bg-slate-950/80 border border-red-500/30 rounded-xl p-4 mb-5 text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Flame className="w-4 h-4 text-red-400" />
                  Racha reiniciada:
                </span>
                <span className="font-mono font-bold text-red-400">
                  {lostStreak} días &rarr; 0 días
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Penalización de Rango:
                </span>
                <span className="font-mono font-bold text-red-400">
                  -{levelsLost} niveles
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Nivel Resultante:</span>
                <span className="text-sm font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Nivel {newLevel}
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl mb-5 text-left">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200/90 leading-relaxed">
                  No te rindas. En este juego, la disciplina no es la ausencia de tropiezos, sino la rapidez con la que vuelves a levantarte y forjar tu racha.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold tracking-wide uppercase text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Aceptar y Levantarse
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
