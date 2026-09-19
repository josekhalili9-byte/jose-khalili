import { UserProfile, UserStats, Habit, Mission, Achievement, CosmeticItem, HistoryEvent } from '../types';
import {
  INITIAL_PROFILE,
  INITIAL_STATS,
  INITIAL_HABITS,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_COSMETICS,
  INITIAL_HISTORY,
} from '../data/initialData';

export const LOCAL_STORAGE_KEY = 'progreso_rpg_save_v2';

export interface GameSaveData {
  version: number;
  savedAt: string;
  profile: UserProfile;
  stats: UserStats;
  habits: Habit[];
  missions: Mission[];
  achievements: Achievement[];
  cosmetics: CosmeticItem[];
  history: HistoryEvent[];
}

/**
 * Lee de forma síncrona el almacenamiento local sin provocar excepciones
 */
export function getStoredLocalData(): GameSaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Intenta migrar versión anterior si existe
      const legacy = localStorage.getItem('progreso_rpg_app_v1');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        return {
          version: 2,
          savedAt: new Date().toISOString(),
          profile: { ...INITIAL_PROFILE, ...(parsedLegacy.profile || {}) },
          stats: { ...INITIAL_STATS, ...(parsedLegacy.stats || {}) },
          habits: parsedLegacy.habits || INITIAL_HABITS,
          missions: parsedLegacy.missions || INITIAL_MISSIONS,
          achievements: parsedLegacy.achievements || INITIAL_ACHIEVEMENTS,
          cosmetics: parsedLegacy.cosmetics || INITIAL_COSMETICS,
          history: parsedLegacy.history || INITIAL_HISTORY,
        };
      }
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      version: parsed.version || 2,
      savedAt: parsed.savedAt || new Date().toISOString(),
      profile: { ...INITIAL_PROFILE, ...(parsed.profile || {}) },
      stats: { ...INITIAL_STATS, ...(parsed.stats || {}) },
      habits: Array.isArray(parsed.habits) ? parsed.habits : INITIAL_HABITS,
      missions: Array.isArray(parsed.missions) ? parsed.missions : INITIAL_MISSIONS,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : INITIAL_ACHIEVEMENTS,
      cosmetics: Array.isArray(parsed.cosmetics) ? parsed.cosmetics : INITIAL_COSMETICS,
      history: Array.isArray(parsed.history) ? parsed.history : INITIAL_HISTORY,
    };
  } catch (err) {
    console.warn('Error al leer de localStorage:', err);
    return null;
  }
}

/**
 * Guarda inmediatamente en LocalStorage
 */
export function saveToLocalStorage(data: Omit<GameSaveData, 'version' | 'savedAt'>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload: GameSaveData = {
      version: 2,
      savedAt: new Date().toISOString(),
      ...data,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Error al guardar en LocalStorage:', err);
    return false;
  }
}

/**
 * Guarda en el backend del servidor Express
 */
export async function saveToServer(data: Omit<GameSaveData, 'version' | 'savedAt'>): Promise<{ success: boolean; savedAt?: string }> {
  try {
    const payload = {
      version: 2,
      savedAt: new Date().toISOString(),
      ...data,
    };
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const result = await res.json();
    return { success: true, savedAt: result.savedAt };
  } catch (err) {
    console.warn('No se pudo sincronizar guardado en servidor:', err);
    return { success: false };
  }
}

/**
 * Carga desde el backend del servidor
 */
export async function loadFromServer(): Promise<GameSaveData | null> {
  try {
    const res = await fetch('/api/save');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.exists && json.data) {
      return {
        version: json.data.version || 2,
        savedAt: json.data.savedAt || new Date().toISOString(),
        profile: { ...INITIAL_PROFILE, ...(json.data.profile || {}) },
        stats: { ...INITIAL_STATS, ...(json.data.stats || {}) },
        habits: Array.isArray(json.data.habits) ? json.data.habits : INITIAL_HABITS,
        missions: Array.isArray(json.data.missions) ? json.data.missions : INITIAL_MISSIONS,
        achievements: Array.isArray(json.data.achievements) ? json.data.achievements : INITIAL_ACHIEVEMENTS,
        cosmetics: Array.isArray(json.data.cosmetics) ? json.data.cosmetics : INITIAL_COSMETICS,
        history: Array.isArray(json.data.history) ? json.data.history : INITIAL_HISTORY,
      };
    }
    return null;
  } catch (err) {
    console.warn('No se pudo cargar desde el servidor:', err);
    return null;
  }
}

/**
 * Reinicia datos tanto en localStorage como en servidor
 */
export async function resetAllData(): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('progreso_rpg_app_v1');
    }
    await fetch('/api/reset', { method: 'POST' }).catch(() => {});
  } catch (err) {
    console.error('Error al reiniciar datos:', err);
  }
}

/**
 * Exporta los datos a un archivo JSON descargable
 */
export function exportDataToFile(data: GameSaveData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `progreso_rpg_partida_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa un archivo JSON y retorna los datos parseados
 */
export function importDataFromFile(file: File): Promise<GameSaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('El archivo no contiene un formato JSON válido.');
        }
        if (!parsed.profile && !parsed.stats) {
          throw new Error('El archivo no parece ser una partida válida de Progreso RPG.');
        }

        const validData: GameSaveData = {
          version: parsed.version || 2,
          savedAt: new Date().toISOString(),
          profile: { ...INITIAL_PROFILE, ...(parsed.profile || {}) },
          stats: { ...INITIAL_STATS, ...(parsed.stats || {}) },
          habits: Array.isArray(parsed.habits) ? parsed.habits : INITIAL_HABITS,
          missions: Array.isArray(parsed.missions) ? parsed.missions : INITIAL_MISSIONS,
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : INITIAL_ACHIEVEMENTS,
          cosmetics: Array.isArray(parsed.cosmetics) ? parsed.cosmetics : INITIAL_COSMETICS,
          history: Array.isArray(parsed.history) ? parsed.history : INITIAL_HISTORY,
        };

        resolve(validData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsText(file);
  });
}
