import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

export interface FloatingNotice {
  id: string;
  type: 'xp-gain' | 'xp-loss' | 'achievement';
  amount?: number;
  text: string;
}

interface XpToastProps {
  notices: FloatingNotice[];
  onDismiss: (id: string) => void;
}

export const XpToastContainer: React.FC<XpToastProps> = ({ notices, onDismiss }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85 }}
            transition={{ type: 'spring', damping: 15, stiffness: 250 }}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl border shadow-xl backdrop-blur-md flex items-center gap-2.5 ${
              notice.type === 'xp-gain'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20'
                : notice.type === 'xp-loss'
                ? 'bg-red-950/90 border-red-500/50 text-red-300 shadow-red-500/20'
                : 'bg-amber-950/90 border-amber-500/50 text-amber-300 shadow-amber-500/20'
            }`}
          >
            {notice.type === 'xp-gain' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            {notice.type === 'xp-loss' && (
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            {notice.type === 'achievement' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">{notice.text}</span>
              {notice.amount !== undefined && (
                <span className="text-[11px] font-mono font-extrabold">
                  {notice.amount > 0 ? `+${notice.amount} XP` : `${notice.amount} XP`}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
