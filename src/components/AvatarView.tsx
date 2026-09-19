import React from 'react';
import { motion } from 'motion/react';
import { AvatarConfig } from '../types';

interface AvatarViewProps {
  config: AvatarConfig;
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  config,
  level,
  size = 'md',
  showBadge = true,
}) => {
  // Dimensiones según el tamaño
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-56 h-56',
    xl: 'w-72 h-72',
  };

  // Colores de ropa según equipamiento
  const getOutfitColors = () => {
    switch (config.ropa) {
      case 'outfit-leather':
        return { base: '#78350f', trim: '#b45309', chest: '#92400e' };
      case 'outfit-steel':
        return { base: '#334155', trim: '#38bdf8', chest: '#64748b' };
      case 'outfit-shadow':
        return { base: '#1e1b4b', trim: '#818cf8', chest: '#312e81' };
      case 'outfit-dragon':
        return { base: '#450a0a', trim: '#f87171', chest: '#7f1d1d' };
      case 'outfit-titan':
        return { base: '#422006', trim: '#facc15', chest: '#854d0e' };
      case 'outfit-novice':
      default:
        return { base: '#1e293b', trim: '#64748b', chest: '#334155' };
    }
  };

  // Colores de peinado
  const getHairStyle = () => {
    switch (config.peinado) {
      case 'hair-warrior':
        return { color: '#854d0e', style: 'warrior' };
      case 'hair-runic':
        return { color: '#0284c7', style: 'runic' };
      case 'hair-cyber':
        return { color: '#ec4899', style: 'cyber' };
      case 'hair-explorer':
      default:
        return { color: '#475569', style: 'explorer' };
    }
  };

  // Fondo estilizado
  const getBackgroundGradient = () => {
    switch (config.fondo) {
      case 'bg-bastion':
        return 'from-slate-900 via-indigo-950/80 to-slate-950';
      case 'bg-cyber':
        return 'from-emerald-950 via-teal-950/80 to-slate-950';
      case 'bg-throne':
        return 'from-amber-950/80 via-yellow-950/60 to-slate-950';
      case 'bg-camp':
      default:
        return 'from-slate-900 via-slate-950 to-black';
    }
  };

  const outfit = getOutfitColors();
  const hair = getHairStyle();

  return (
    <div
      id="avatar-container"
      className={`relative ${sizeMap[size]} rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-gradient-to-b ${getBackgroundGradient()} flex items-center justify-center p-2 group transition-all duration-300`}
    >
      {/* Luz y rejilla de fondo estilo HUD de videojuego */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Efectos / Auras */}
      {config.efecto === 'eff-flame' && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-t from-red-600/30 via-orange-500/20 to-transparent pointer-events-none filter blur-md"
        />
      )}
      {config.efecto === 'eff-lightning' && (
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 pointer-events-none shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        />
      )}
      {config.efecto === 'eff-stardust' && (
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-500/10 via-slate-300/15 to-transparent pointer-events-none"
        />
      )}
      {config.efecto === 'eff-divine' && (
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.8, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.4)] pointer-events-none"
        />
      )}

      {/* SVG del Personaje con animación sutil de respiración idle */}
      <motion.svg
        viewBox="0 0 200 240"
        className="w-full h-full relative z-10 drop-shadow-md"
        animate={{ y: [0, -2.5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={outfit.trim} />
            <stop offset="40%" stopColor={outfit.base} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="chestPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={outfit.chest} />
            <stop offset="100%" stopColor={outfit.base} />
          </linearGradient>
          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Capa de fondo si tiene capa de héroe */}
        {config.accesorio === 'acc-hero-cape' && (
          <path
            d="M 55 125 L 35 230 L 165 230 L 145 125 Z"
            fill="#be123c"
            stroke="#e11d48"
            strokeWidth="2"
            opacity="0.9"
          />
        )}

        {/* Alas de cristal si es nivel alto */}
        {level >= 25 && (
          <g opacity="0.75" filter="url(#glowEffect)">
            <path
              d="M 45 110 C 10 90, 0 40, 25 20 C 35 60, 45 90, 60 115 Z"
              fill="#38bdf8"
              opacity="0.6"
            />
            <path
              d="M 155 110 C 190 90, 200 40, 175 20 C 165 60, 155 90, 140 115 Z"
              fill="#38bdf8"
              opacity="0.6"
            />
          </g>
        )}

        {/* Hombros y Torso (Armadura) */}
        {/* Hombrera izquierda */}
        <path
          d="M 38 128 L 65 118 L 68 155 L 42 160 Z"
          fill={outfit.chest}
          stroke={outfit.trim}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Hombrera derecha */}
        <path
          d="M 162 128 L 135 118 L 132 155 L 158 160 Z"
          fill={outfit.chest}
          stroke={outfit.trim}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Pechera / Armadura principal */}
        <path
          d="M 64 120 L 136 120 L 148 230 L 52 230 Z"
          fill="url(#bodyGrad)"
          stroke={outfit.trim}
          strokeWidth="2"
        />

        {/* Detalles de la placa de pecho */}
        <polygon
          points="80,132 120,132 130,175 100,195 70,175"
          fill="url(#chestPlateGrad)"
          stroke={outfit.trim}
          strokeWidth="2"
        />

        {/* Reactor rúnico central de la armadura */}
        <circle
          cx="100"
          cy="158"
          r={level >= 10 ? '7' : '5'}
          fill={level >= 20 ? '#fbbf24' : '#38bdf8'}
          filter="url(#glowEffect)"
        />

        {/* Bufanda si la tiene equipada */}
        {config.accesorio === 'acc-scarf' && (
          <g>
            <path
              d="M 70 102 C 100 112, 115 112, 130 102 L 134 116 C 115 128, 85 128, 66 116 Z"
              fill="#ea580c"
              stroke="#f97316"
              strokeWidth="2"
            />
            <path
              d="M 115 114 L 135 160 L 122 165 L 105 120 Z"
              fill="#c2410c"
            />
          </g>
        )}

        {/* Cuello */}
        <rect x="90" y="98" width="20" height="20" fill="#f59e0b" rx="4" />

        {/* Cabeza / Rostro */}
        <path
          d="M 72 65 C 72 40, 128 40, 128 65 C 128 92, 114 105, 100 105 C 86 105, 72 92, 72 65 Z"
          fill="url(#skinGrad)"
          stroke="#d97706"
          strokeWidth="1.5"
        />

        {/* Ojos estilo anime/cyber RPG */}
        <g>
          {/* Ojo Izquierdo */}
          <path d="M 82 68 L 92 68 L 86 73 Z" fill="#0f172a" />
          <circle cx="87" cy="70" r="1.5" fill="#38bdf8" />
          {/* Ojo Derecho */}
          <path d="M 108 68 L 118 68 L 114 73 Z" fill="#0f172a" />
          <circle cx="113" cy="70" r="1.5" fill="#38bdf8" />
        </g>

        {/* Visor Táctico Holográfico */}
        {config.accesorio === 'acc-visor' && (
          <path
            d="M 74 63 L 126 63 L 122 75 L 78 75 Z"
            fill="url(#visorGrad)"
            stroke="#0891b2"
            strokeWidth="1.5"
            opacity="0.85"
            filter="url(#glowEffect)"
          />
        )}

        {/* Peinado */}
        {hair.style === 'warrior' && (
          <path
            d="M 66 60 C 60 30, 80 15, 100 18 C 120 15, 140 30, 134 60 C 130 35, 115 28, 100 30 C 85 28, 70 35, 66 60 Z"
            fill={hair.color}
            stroke="#451a03"
            strokeWidth="2"
          />
        )}
        {hair.style === 'runic' && (
          <g>
            <path
              d="M 70 55 C 70 32, 130 32, 130 55 C 125 40, 115 35, 100 35 C 85 35, 75 40, 70 55 Z"
              fill="#1e293b"
            />
            <path d="M 85 45 L 92 40 L 98 48" stroke="#38bdf8" strokeWidth="2" fill="none" filter="url(#glowEffect)" />
          </g>
        )}
        {hair.style === 'cyber' && (
          <g>
            <path
              d="M 68 55 C 65 25, 135 20, 132 55 L 125 35 C 110 25, 90 25, 75 35 Z"
              fill={hair.color}
            />
            {/* Coleta cyber lateral */}
            <path
              d="M 128 45 C 150 50, 160 85, 155 110 L 148 105 C 152 85, 142 60, 126 52 Z"
              fill={hair.color}
              stroke="#be185d"
              strokeWidth="1.5"
            />
          </g>
        )}
        {hair.style === 'explorer' && (
          <path
            d="M 68 58 C 65 30, 135 30, 132 58 C 124 38, 115 34, 100 34 C 85 34, 76 38, 68 58 Z"
            fill={hair.color}
            stroke="#1e293b"
            strokeWidth="1.5"
          />
        )}

        {/* Corona Dorada (Accesorio de Racha) */}
        {config.accesorio === 'acc-crown-7' && (
          <g filter="url(#glowEffect)">
            <polygon
              points="78,35 84,18 92,28 100,12 108,28 116,18 122,35"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            <circle cx="100" cy="22" r="2.5" fill="#ef4444" />
          </g>
        )}

        {/* Cinturón Táctico */}
        <rect x="62" y="210" width="76" height="12" fill="#0f172a" stroke={outfit.trim} strokeWidth="1.5" rx="2" />
        <rect x="92" y="208" width="16" height="16" fill={outfit.chest} stroke={outfit.trim} strokeWidth="2" rx="3" />
      </motion.svg>

      {/* Badge de Nivel flotante */}
      {showBadge && (
        <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-amber-500/50 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider shadow-lg flex items-center gap-1 backdrop-blur-md">
          <span className="text-[10px] text-amber-500 uppercase">LVL</span>
          <span className="font-mono text-sm">{level}</span>
        </div>
      )}
    </div>
  );
};
