import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ChevronRight, Sparkles } from 'lucide-react';
import { CosmeticItem } from '../types';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  xpGained: number;
  unlockedRewards: CosmeticItem[];
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  xpGained,
  unlockedRewards,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center overflow-hidden"
        >
          {/* Luz de fondo en expansión */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(245,158,11,0.15)_360deg)] pointer-events-none rounded-full"
          />

          <div className="relative z-10">
            {/* Header / Titular */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-widest uppercase mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Progresión de Personaje
            </motion.div>

            <motion.h1
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 uppercase font-serif drop-shadow"
            >
              LEVEL UP!
            </motion.h1>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="my-5 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-b from-amber-400/20 to-slate-900 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                  NIVEL
                </span>
                <span className="text-4xl font-black text-amber-200 font-mono">
                  {newLevel}
                </span>
              </div>
            </motion.div>

            <p className="text-sm text-slate-300 mb-4">
              ¡Has acumulado suficiente experiencia para ascender de rango!
              <span className="block text-xs text-amber-400 font-semibold mt-1">
                +{xpGained} XP acumulados en esta acción
              </span>
            </p>

            {/* Recompensas cosméticas desbloqueadas */}
            {unlockedRewards && unlockedRewards.length > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">
                  <Award className="w-4 h-4" />
                  Recompensa Desbloqueada:
                </div>
                <div className="space-y-1.5">
                  {unlockedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between text-xs text-slate-200 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="font-semibold">{reward.name}</span>
                      <span className="text-[10px] uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                        {reward.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black tracking-wide uppercase text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continuar la Aventura
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
