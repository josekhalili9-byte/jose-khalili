import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserStats,
  Habit,
  Mission,
  Achievement,
  CosmeticItem,
  HistoryEvent,
  DIFFICULTY_XP,
  AvatarConfig,
} from './types';
import {
  INITIAL_PROFILE,
  INITIAL_STATS,
  INITIAL_HABITS,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_COSMETICS,
  INITIAL_HISTORY,
} from './data/initialData';
import { applyXpChange, calculateStreakBrokenPenalty } from './utils/levelSystem';
import { sounds } from './utils/audioSystem';

import { HomeView } from './components/views/HomeView';
import { HabitsView } from './components/views/HabitsView';
import { MissionsView } from './components/views/MissionsView';
import { AchievementsView } from './components/views/AchievementsView';
import { StatsView } from './components/views/StatsView';

import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { LevelUpModal } from './components/LevelUpModal';
import { StreakBrokenModal } from './components/StreakBrokenModal';
import { XpToastContainer, FloatingNotice } from './components/XpToast';
import { DataManagementModal } from './components/DataManagementModal';

import {
  getStoredLocalData,
  saveToLocalStorage,
  saveToServer,
  loadFromServer,
  GameSaveData,
} from './utils/storageSystem';

import {
  Home,
  CheckSquare,
  Swords,
  Trophy,
  BarChart3,
  Volume2,
  VolumeX,
  Save,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

type NavTab = 'inicio' | 'habitos' | 'misiones' | 'logros' | 'estadisticas';

export function App() {
  // Inicialización síncrona desde localStorage para no parpadear ni sobreescribir datos previos
  const initialLocal = getStoredLocalData();

  // Estado general de la aplicación
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [profile, setProfile] = useState<UserProfile>(() => initialLocal?.profile ?? INITIAL_PROFILE);
  const [stats, setStats] = useState<UserStats>(() => initialLocal?.stats ?? INITIAL_STATS);
  const [habits, setHabits] = useState<Habit[]>(() => initialLocal?.habits ?? INITIAL_HABITS);
  const [missions, setMissions] = useState<Mission[]>(() => initialLocal?.missions ?? INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<Achievement[]>(() => initialLocal?.achievements ?? INITIAL_ACHIEVEMENTS);
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>(() => initialLocal?.cosmetics ?? INITIAL_COSMETICS);
  const [history, setHistory] = useState<HistoryEvent[]>(() => initialLocal?.history ?? INITIAL_HISTORY);

  // Estados de persistencia y guardado
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => initialLocal?.savedAt ?? null);
  const [serverSynced, setServerSynced] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Modales y Toasts
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    newLevel: number;
    xpGained: number;
    unlockedRewards: CosmeticItem[];
  }>({
    isOpen: false,
    newLevel: 1,
    xpGained: 0,
    unlockedRewards: [],
  });

  const [streakBrokenData, setStreakBrokenData] = useState<{
    isOpen: boolean;
    previousLevel: number;
    newLevel: number;
    lostStreak: number;
  }>({
    isOpen: false,
    previousLevel: 1,
    newLevel: 1,
    lostStreak: 0,
  });

  const [notices, setNotices] = useState<FloatingNotice[]>([]);

  // 1. Cargar desde el servidor en caso de que localStorage esté vacío (ej: nueva pestaña privada o navegador limpio)
  useEffect(() => {
    let isMounted = true;
    loadFromServer().then((serverData) => {
      if (!isMounted || !serverData) return;
      setServerSynced(true);
      if (!initialLocal) {
        setProfile(serverData.profile);
        setStats(serverData.stats);
        setHabits(serverData.habits);
        setMissions(serverData.missions);
        setAchievements(serverData.achievements);
        setCosmetics(serverData.cosmetics);
        setHistory(serverData.history);
        setLastSavedAt(serverData.savedAt);
        saveToLocalStorage(serverData);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Guardar automáticamente en LocalStorage y Servidor ante cualquier cambio en el estado
  useEffect(() => {
    const dataToSave = {
      profile,
      stats,
      habits,
      missions,
      achievements,
      cosmetics,
      history,
    };
    
    // Guardado inmediato en LocalStorage
    saveToLocalStorage(dataToSave);
    const nowIso = new Date().toISOString();
    setLastSavedAt(nowIso);

    // Sincronización debounced con el servidor backend
    const timer = setTimeout(() => {
      saveToServer(dataToSave).then((res) => {
        if (res.success) {
          setServerSynced(true);
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [profile, stats, habits, missions, achievements, cosmetics, history]);

  // Guardado manual explícito
  const handleManualSave = async () => {
    setIsSavingManual(true);
    sounds.playClick();
    const dataToSave = {
      profile,
      stats,
      habits,
      missions,
      achievements,
      cosmetics,
      history,
    };
    saveToLocalStorage(dataToSave);
    const res = await saveToServer(dataToSave);
    const nowIso = res.savedAt || new Date().toISOString();
    setLastSavedAt(nowIso);
    setServerSynced(true);
    setIsSavingManual(false);

    addNotice({
      type: 'achievement',
      text: '¡Partida e información guardada con éxito!',
    });
  };

  const handleRestoreData = (data: GameSaveData) => {
    setProfile(data.profile);
    setStats(data.stats);
    setHabits(data.habits);
    setMissions(data.missions);
    setAchievements(data.achievements);
    setCosmetics(data.cosmetics);
    setHistory(data.history);
    saveToLocalStorage(data);
    saveToServer(data);
    setLastSavedAt(new Date().toISOString());
    sounds.playLevelUp();
    addNotice({
      type: 'achievement',
      text: '¡Partida restaurada con éxito!',
    });
  };

  // Manejador de sonido
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playClick();
  };

  const addNotice = (notice: Omit<FloatingNotice, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotice = { ...notice, id };
    setNotices((prev) => [...prev, newNotice]);
    setTimeout(() => {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  // Revisor y actualizador de logros automáticos
  const checkAchievements = (
    currentProfile: UserProfile,
    currentStats: UserStats,
    completedAction?: { type: 'habit' | 'mission'; difficulty: string }
  ) => {
    setAchievements((prevAchievements) => {
      let anyUnlocked = false;
      const updated = prevAchievements.map((ach) => {
        if (ach.unlocked) return ach;

        let shouldUnlock = false;

        switch (ach.id) {
          case 'ach-first-step':
            if (currentStats.goodHabitsCompleted >= 1) shouldUnlock = true;
            break;
          case 'ach-streak-7':
            if (currentProfile.streak >= 7) shouldUnlock = true;
            break;
          case 'ach-streak-30':
            if (currentProfile.streak >= 30) shouldUnlock = true;
            break;
          case 'ach-habits-100':
            if (currentStats.goodHabitsCompleted >= 100) shouldUnlock = true;
            break;
          case 'ach-lvl-10':
            if (currentProfile.level >= 10) shouldUnlock = true;
            break;
          case 'ach-lvl-25':
            if (currentProfile.level >= 25) shouldUnlock = true;
            break;
          case 'ach-lvl-50':
            if (currentProfile.level >= 50) shouldUnlock = true;
            break;
          case 'ach-mission-legendary':
            if (completedAction?.type === 'mission' && completedAction.difficulty === 'legendario') {
              shouldUnlock = true;
            }
            break;
          case 'ach-xp-10k':
            if (currentStats.totalXp >= 10000) shouldUnlock = true;
            break;
          case 'ach-secret-iron':
            // Secreto: Racha de 14 días
            if (currentProfile.streak >= 14) shouldUnlock = true;
            break;
          case 'ach-secret-phoenix':
            // Secreto: Subir de nivel después de una penalización
            if (currentProfile.level >= 3 && currentStats.badHabitsTriggered >= 1) {
              shouldUnlock = true;
            }
            break;
          case 'ach-secret-transcendence':
            // Secreto: 5 hábitos difíciles completados
            if (currentStats.hardHabitsCompleted >= 5) shouldUnlock = true;
            break;
        }

        if (shouldUnlock) {
          anyUnlocked = true;
          sounds.playAchievement();
          addNotice({
            type: 'achievement',
            text: `¡Logro Desbloqueado: ${ach.title}!`,
          });
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
        }

        return ach;
      });

      if (anyUnlocked) {
        setStats((s) => ({
          ...s,
          achievementsUnlocked: updated.filter((a) => a.unlocked).length,
        }));
      }

      return updated;
    });
  };

  // 1. Completar Hábito Bueno
  const handleCompleteHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit || habit.completedToday) return;

    sounds.playHabitComplete();
    const xp = DIFFICULTY_XP[habit.difficulty];

    // Marcar completado
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, completedToday: true, timesCompleted: h.timesCompleted + 1 }
          : h
      )
    );

    // Aplicar XP
    const result = applyXpChange(profile.level, profile.currentLevelXp, xp);

    // Actualizar Perfil
    const updatedProfile: UserProfile = {
      ...profile,
      level: result.newLevel,
      currentLevelXp: result.newCurrentXp,
      requiredXpForNext: result.newRequiredXp,
    };
    setProfile(updatedProfile);

    // Actualizar Stats
    const newGoodCompleted = stats.goodHabitsCompleted + 1;
    const isHard = habit.difficulty === 'dificil' || habit.difficulty === 'epico' || habit.difficulty === 'legendario';
    const newStats: UserStats = {
      ...stats,
      totalXp: stats.totalXp + xp,
      xpGained: stats.xpGained + xp,
      goodHabitsCompleted: newGoodCompleted,
      hardHabitsCompleted: isHard ? stats.hardHabitsCompleted + 1 : stats.hardHabitsCompleted,
      completionRate: Math.round(
        (newGoodCompleted / (newGoodCompleted + stats.badHabitsTriggered)) * 100
      ),
    };
    setStats(newStats);

    // Historial
    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        dateStr: new Date().toISOString().split('T')[0],
        type: 'habit_good',
        title: `Hábito: ${habit.title}`,
        xpChange: xp,
      },
    ]);

    addNotice({
      type: 'xp-gain',
      amount: xp,
      text: habit.title,
    });

    // Level Up Check
    if (result.leveledUp) {
      sounds.playLevelUp();
      const newlyAvailableRewards = cosmetics.filter(
        (c) => c.unlockType === 'level' && (c.unlockRequirement as number) <= result.newLevel
      );
      setLevelUpData({
        isOpen: true,
        newLevel: result.newLevel,
        xpGained: xp,
        unlockedRewards: newlyAvailableRewards,
      });
    }

    // Check Logros
    checkAchievements(updatedProfile, newStats, { type: 'habit', difficulty: habit.difficulty });
  };

  // 2. Registrar Infracción (Hábito Malo)
  const handleTriggerBadHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    sounds.playXpLoss();
    const penaltyXp = DIFFICULTY_XP[habit.difficulty];

    // Marcar infracción
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, timesTriggered: h.timesTriggered + 1 } : h
      )
    );

    // Aplicar resta de XP (con piso en Nivel 1 con 0 XP)
    const result = applyXpChange(profile.level, profile.currentLevelXp, -penaltyXp);

    setProfile((prev) => ({
      ...prev,
      level: result.newLevel,
      currentLevelXp: result.newCurrentXp,
      requiredXpForNext: result.newRequiredXp,
    }));

    const newBadCount = stats.badHabitsTriggered + 1;
    setStats((s) => ({
      ...s,
      totalXp: Math.max(0, s.totalXp - penaltyXp),
      xpLost: s.xpLost + penaltyXp,
      badHabitsTriggered: newBadCount,
      completionRate: Math.round(
        (s.goodHabitsCompleted / (s.goodHabitsCompleted + newBadCount)) * 100
      ),
    }));

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        dateStr: new Date().toISOString().split('T')[0],
        type: 'habit_bad',
        title: `Infracción: ${habit.title}`,
        xpChange: -penaltyXp,
      },
    ]);

    addNotice({
      type: 'xp-loss',
      amount: -penaltyXp,
      text: `Infracción: ${habit.title}`,
    });
  };

  // 3. Completar Misión
  const handleCompleteMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.completed) return;

    sounds.playMissionComplete();
    const xp = DIFFICULTY_XP[mission.difficulty];

    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, completed: true, completedAt: new Date().toISOString() } : m
      )
    );

    const result = applyXpChange(profile.level, profile.currentLevelXp, xp);

    const updatedProfile: UserProfile = {
      ...profile,
      level: result.newLevel,
      currentLevelXp: result.newCurrentXp,
      requiredXpForNext: result.newRequiredXp,
    };
    setProfile(updatedProfile);

    const newStats: UserStats = {
      ...stats,
      totalXp: stats.totalXp + xp,
      xpGained: stats.xpGained + xp,
      missionsCompleted: stats.missionsCompleted + 1,
    };
    setStats(newStats);

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        dateStr: new Date().toISOString().split('T')[0],
        type: 'mission',
        title: `Misión: ${mission.title}`,
        xpChange: xp,
      },
    ]);

    addNotice({
      type: 'xp-gain',
      amount: xp,
      text: `Misión: ${mission.title}`,
    });

    if (result.leveledUp) {
      sounds.playLevelUp();
      setLevelUpData({
        isOpen: true,
        newLevel: result.newLevel,
        xpGained: xp,
        unlockedRewards: [],
      });
    }

    checkAchievements(updatedProfile, newStats, { type: 'mission', difficulty: mission.difficulty });
  };

  // 4. Crear Hábito
  const handleCreateHabit = (
    newHabit: Omit<Habit, 'id' | 'completedToday' | 'timesCompleted' | 'timesTriggered' | 'createdAt'>
  ) => {
    sounds.playClick();
    const created: Habit = {
      ...newHabit,
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      completedToday: false,
      timesCompleted: 0,
      timesTriggered: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [created, ...prev]);
  };

  // 5. Eliminar Hábito
  const handleDeleteHabit = (habitId: string) => {
    sounds.playClick();
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // 6. Crear Misión
  const handleCreateMission = (
    newMission: Omit<Mission, 'id' | 'completed' | 'xpReward' | 'createdAt'>
  ) => {
    sounds.playClick();
    const created: Mission = {
      ...newMission,
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      xpReward: DIFFICULTY_XP[newMission.difficulty],
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setMissions((prev) => [created, ...prev]);
  };

  // 7. Eliminar Misión
  const handleDeleteMission = (missionId: string) => {
    sounds.playClick();
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
  };

  // 8. Simular o Ejecutar Penalización de Racha Rota
  const handleBreakStreak = () => {
    sounds.playStreakBroken();
    const prevLevel = profile.level;
    const prevStreak = profile.streak;

    const penaltyResult = calculateStreakBrokenPenalty(profile.level, profile.currentLevelXp);

    setProfile((prev) => ({
      ...prev,
      level: penaltyResult.newLevel,
      currentLevelXp: penaltyResult.newLevelXp,
      requiredXpForNext: penaltyResult.newRequiredXp,
      streak: 0,
    }));

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        dateStr: new Date().toISOString().split('T')[0],
        type: 'streak_break',
        title: 'Penalización: Racha rota (-2 Niveles, Racha 0)',
        xpChange: 0,
      },
    ]);

    setStreakBrokenData({
      isOpen: true,
      previousLevel: prevLevel,
      newLevel: penaltyResult.newLevel,
      lostStreak: prevStreak,
    });
  };

  // 9. Actualizar Nombre de Usuario
  const handleUpdateName = (newName: string) => {
    sounds.playClick();
    setProfile((prev) => ({ ...prev, name: newName }));
  };

  // 10. Actualizar Cosméticos de Avatar
  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    sounds.playClick();
    setProfile((prev) => ({ ...prev, avatar: newConfig }));
  };

  // 11. Exportar Datos
  const handleExportData = () => {
    sounds.playClick();
    const dataToSave = {
      version: 2,
      savedAt: new Date().toISOString(),
      profile,
      stats,
      habits,
      missions,
      achievements,
      cosmetics,
      history,
    };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progreso_rpg_partida_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 12. Importar Datos
  const handleImportData = (rawJson: string) => {
    try {
      const data = JSON.parse(rawJson);
      if (!data.profile || !data.stats) {
        throw new Error('Estructura de respaldo no válida');
      }
      handleRestoreData(data);
    } catch (err: any) {
      throw new Error('El archivo no contiene un respaldo válido.');
    }
  };

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { id: 'habitos', label: 'Hábitos', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'misiones', label: 'Misiones', icon: <Swords className="w-4 h-4" /> },
    { id: 'logros', label: 'Logros', icon: <Trophy className="w-4 h-4" /> },
    { id: 'estadisticas', label: 'Estadísticas', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Barra Superior Minimalista */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 font-serif">
              PROGRESO RPG
            </span>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(item.id as NavTab);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Controles rápidos (Guardar, Datos, Sonido) */}
          <div className="flex items-center gap-2">
            {/* Indicador de estado de guardado */}
            <button
              id="header-data-status-btn"
              onClick={() => {
                sounds.playClick();
                setIsDataModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
              title={lastSavedAt ? `Último guardado: ${new Date(lastSavedAt).toLocaleTimeString('es-ES')}` : 'Guardado automático activo'}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-slate-300">Guardado</span>
            </button>

            {/* Botón manual de Guardar */}
            <button
              id="header-manual-save-btn"
              onClick={handleManualSave}
              disabled={isSavingManual}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Guardar información ahora"
            >
              <Save className={`w-3.5 h-3.5 ${isSavingManual ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isSavingManual ? 'Guardando...' : 'Guardar'}</span>
            </button>

            {/* Modal de Gestión de Datos */}
            <button
              id="header-open-data-modal-btn"
              onClick={() => {
                sounds.playClick();
                setIsDataModalOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Gestión de datos y copias de seguridad"
            >
              <HardDrive className="w-4 h-4 text-slate-400" />
            </button>

            {/* Botón de Sonido */}
            <button
              id="header-sound-toggle-btn"
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar audio' : 'Activar audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 pb-24 md:pb-8">
        {activeTab === 'inicio' && (
          <HomeView
            profile={profile}
            stats={stats}
            habits={habits}
            onUpdateName={handleUpdateName}
            onOpenArmory={() => setIsArmoryOpen(true)}
            onCompleteHabit={handleCompleteHabit}
            onNavigateToTab={(t) => setActiveTab(t)}
            onBreakStreakSimulate={handleBreakStreak}
          />
        )}

        {activeTab === 'habitos' && (
          <HabitsView
            habits={habits}
            onCompleteHabit={handleCompleteHabit}
            onTriggerBadHabit={handleTriggerBadHabit}
            onCreateHabit={handleCreateHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'misiones' && (
          <MissionsView
            missions={missions}
            onCompleteMission={handleCompleteMission}
            onCreateMission={handleCreateMission}
            onDeleteMission={handleDeleteMission}
          />
        )}

        {activeTab === 'logros' && (
          <AchievementsView achievements={achievements} />
        )}

        {activeTab === 'estadisticas' && (
          <StatsView
            profile={profile}
            stats={stats}
            habits={habits}
            missions={missions}
            history={history}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Barra de Navegación Móvil Inferior */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md px-2 py-2 flex justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(item.id as NavTab);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modales y Notificaciones */}
      <AvatarCustomizerModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        config={profile.avatar}
        onSave={handleSaveAvatar}
        userLevel={profile.level}
        unlockedAchievements={achievements.filter((a) => a.unlocked).map((a) => a.id)}
        cosmetics={cosmetics}
      />

      <LevelUpModal
        isOpen={levelUpData.isOpen}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
        newLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
        unlockedRewards={levelUpData.unlockedRewards}
      />

      <StreakBrokenModal
        isOpen={streakBrokenData.isOpen}
        onClose={() => setStreakBrokenData((prev) => ({ ...prev, isOpen: false }))}
        previousLevel={streakBrokenData.previousLevel}
        newLevel={streakBrokenData.newLevel}
        lostStreak={streakBrokenData.lostStreak}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        lastSavedAt={lastSavedAt}
        serverSynced={serverSynced}
        onManualSave={handleManualSave}
        getCurrentSaveData={() => ({
          version: 2,
          savedAt: new Date().toISOString(),
          profile,
          stats,
          habits,
          missions,
          achievements,
          cosmetics,
          history,
        })}
        onRestoreData={handleRestoreData}
      />

      <XpToastContainer
        notices={notices}
        onDismiss={(id) => setNotices((prev) => prev.filter((n) => n.id !== id))}
      />
    </div>
  );
}
export default App;
