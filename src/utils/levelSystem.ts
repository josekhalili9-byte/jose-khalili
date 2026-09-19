/**
 * Sistema de niveles y experiencia para Progreso RPG
 * Fórmula estricta: XP_necesario = round_to_10(100 × L^1.5)
 */

export function calculateRequiredXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  // Fórmula exacta requerida: redondear al múltiplo de 10 más cercano (100 × L^1.5)
  const raw = 100 * Math.pow(safeLevel, 1.5);
  return Math.round(raw / 10) * 10;
}

export interface XpGainResult {
  newLevel: number;
  newLevelXp: number;
  newRequiredXp: number;
  levelsGained: number;
  levelUps: Array<{ level: number; requiredXp: number }>;
}

/**
 * Añade XP procesando múltiples niveles si hay suficiente XP sobrante.
 */
export function applyXpGain(
  currentLevel: number,
  currentLevelXp: number,
  xpToAdd: number
): XpGainResult {
  let level = Math.max(1, currentLevel);
  let xp = Math.max(0, currentLevelXp) + Math.max(0, xpToAdd);
  let levelsGained = 0;
  const levelUps: Array<{ level: number; requiredXp: number }> = [];

  let requiredForCurrent = calculateRequiredXpForLevel(level);

  while (xp >= requiredForCurrent) {
    xp -= requiredForCurrent;
    level += 1;
    levelsGained += 1;
    requiredForCurrent = calculateRequiredXpForLevel(level);
    levelUps.push({
      level,
      requiredXp: requiredForCurrent,
    });
  }

  return {
    newLevel: level,
    newLevelXp: xp,
    newRequiredXp: requiredForCurrent,
    levelsGained,
    levelUps,
  };
}

export interface XpLossResult {
  newLevel: number;
  newLevelXp: number;
  newRequiredXp: number;
  levelsLost: number;
}

/**
 * Resta XP por hábitos malos. Nunca permite bajar de Nivel 1 con 0 XP.
 */
export function applyXpLoss(
  currentLevel: number,
  currentLevelXp: number,
  xpToDeduct: number
): XpLossResult {
  let level = Math.max(1, currentLevel);
  let xp = currentLevelXp - Math.max(0, xpToDeduct);
  let levelsLost = 0;

  while (xp < 0 && level > 1) {
    level -= 1;
    levelsLost += 1;
    const prevRequired = calculateRequiredXpForLevel(level);
    xp += prevRequired;
  }

  // Nivel 1 nunca tiene XP negativo
  if (level <= 1) {
    level = 1;
    xp = Math.max(0, xp);
  }

  return {
    newLevel: level,
    newLevelXp: xp,
    newRequiredXp: calculateRequiredXpForLevel(level),
    levelsLost,
  };
}

export interface StreakBreakResult {
  newLevel: number;
  newLevelXp: number;
  newRequiredXp: number;
  levelsDropped: number;
}

/**
 * Al romper la racha:
 * 1. La racha vuelve a 0
 * 2. Se bajan exactamente 2 niveles (o hasta nivel 1 mínimo)
 * 3. Se recalcula el XP proporcionalmente en el nuevo nivel
 */
export function calculateStreakBreakPenalty(
  currentLevel: number,
  currentLevelXp: number
): StreakBreakResult {
  const previousRequired = calculateRequiredXpForLevel(currentLevel);
  const xpRatio = previousRequired > 0 ? Math.min(1, Math.max(0, currentLevelXp / previousRequired)) : 0;

  // Baja exactamente 2 niveles, piso mínimo nivel 1
  const targetLevel = Math.max(1, currentLevel - 2);
  const levelsDropped = currentLevel - targetLevel;

  const newRequiredXp = calculateRequiredXpForLevel(targetLevel);
  // Conserva el ratio relativo dentro del nuevo nivel
  const newLevelXp = Math.min(newRequiredXp - 1, Math.round(xpRatio * newRequiredXp));

  return {
    newLevel: targetLevel,
    newLevelXp: Math.max(0, newLevelXp),
    newRequiredXp,
    levelsDropped,
  };
}

export const calculateStreakBrokenPenalty = calculateStreakBreakPenalty;

export interface UnifiedXpResult {
  newLevel: number;
  newCurrentXp: number;
  newRequiredXp: number;
  leveledUp: boolean;
  levelsDelta: number;
}

export function applyXpChange(
  currentLevel: number,
  currentLevelXp: number,
  xpDelta: number
): UnifiedXpResult {
  if (xpDelta >= 0) {
    const gain = applyXpGain(currentLevel, currentLevelXp, xpDelta);
    return {
      newLevel: gain.newLevel,
      newCurrentXp: gain.newLevelXp,
      newRequiredXp: gain.newRequiredXp,
      leveledUp: gain.levelsGained > 0,
      levelsDelta: gain.levelsGained,
    };
  } else {
    const loss = applyXpLoss(currentLevel, currentLevelXp, Math.abs(xpDelta));
    return {
      newLevel: loss.newLevel,
      newCurrentXp: loss.newLevelXp,
      newRequiredXp: loss.newRequiredXp,
      leveledUp: false,
      levelsDelta: -loss.levelsLost,
    };
  }
}

