import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarConfig, CosmeticItem } from '../types';
import { AvatarView } from './AvatarView';
import { X, Lock, Check, Sparkles, Shirt, Shield, User, Sun, Image as ImageIcon } from 'lucide-react';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AvatarConfig;
  onSave: (newConfig: AvatarConfig) => void;
  userLevel: number;
  unlockedAchievements: string[];
  cosmetics: CosmeticItem[];
}

type TabCategory = 'ropa' | 'accesorio' | 'peinado' | 'efecto' | 'fondo';

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  userLevel,
  unlockedAchievements,
  cosmetics,
}) => {
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(config);
  const [activeTab, setActiveTab] = useState<TabCategory>('ropa');

  if (!isOpen) return null;

  const isItemUnlocked = (item: CosmeticItem): boolean => {
    if (item.unlockType === 'level') {
      return userLevel >= (item.unlockRequirement as number);
    }
    if (item.unlockType === 'achievement') {
      return unlockedAchievements.includes(item.unlockRequirement as string);
    }
    return false;
  };

  const filteredItems = cosmetics.filter((c) => c.category === activeTab);

  const handleEquip = (itemId: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [activeTab]: itemId,
    }));
  };

  const handleApply = () => {
    onSave(currentConfig);
    onClose();
  };

  const tabs: { id: TabCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'ropa', label: 'Ropa / Armadura', icon: <Shirt className="w-4 h-4" /> },
    { id: 'accesorio', label: 'Accesorios', icon: <Shield className="w-4 h-4" /> },
    { id: 'peinado', label: 'Peinados', icon: <User className="w-4 h-4" /> },
    { id: 'efecto', label: 'Auras & Efectos', icon: <Sun className="w-4 h-4" /> },
    { id: 'fondo', label: 'Fondos', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100 tracking-wide">
                Armería Cosmética del Avatar
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Preview Left */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <AvatarView config={currentConfig} level={userLevel} size="lg" />
              <div className="mt-4 text-center">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  Previsualización en vivo
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Los cosméticos son puramente estéticos y no modifican estadísticas.
                </p>
              </div>
            </div>

            {/* Customization Right */}
            <div className="md:col-span-7 flex flex-col">
              {/* Categorías */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 mb-4 scrollbar-thin">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[280px] pr-1">
                {filteredItems.map((item) => {
                  const unlocked = isItemUnlocked(item);
                  const isEquipped = currentConfig[activeTab] === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={!unlocked}
                      onClick={() => handleEquip(item.id)}
                      className={`relative p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isEquipped
                          ? 'border-amber-500 bg-amber-500/10 text-white shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : unlocked
                          ? 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                          : 'border-slate-800/40 bg-slate-950/40 text-slate-600 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.previewColor }}
                        />
                        <div>
                          <div className="text-xs font-semibold leading-tight">{item.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {unlocked ? (
                              <span className="text-emerald-400">Desbloqueado</span>
                            ) : item.unlockType === 'level' ? (
                              <span>Requiere Nivel {item.unlockRequirement}</span>
                            ) : (
                              <span>Requiere Logro Especial</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isEquipped ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : !unlocked ? (
                          <Lock className="w-4 h-4 text-slate-600" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/60">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Equipar y Guardar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
