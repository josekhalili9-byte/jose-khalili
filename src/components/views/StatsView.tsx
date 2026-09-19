import React, { useState } from 'react';
import { UserProfile, UserStats, Habit, Mission, HistoryEvent, AIAnalysisResult } from '../../types';
import {
  BarChart3,
  Bot,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  Award,
  Swords,
  Layers,
} from 'lucide-react';

interface StatsViewProps {
  profile: UserProfile;
  stats: UserStats;
  habits: Habit[];
  missions: Mission[];
  history: HistoryEvent[];
  onExportData: () => void;
  onImportData: (jsonData: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  profile,
  stats,
  habits,
  missions,
  history,
  onExportData,
  onImportData,
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Llamada al endpoint de análisis server-side
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          stats,
          habits,
          missions,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('No se recibió estructura de análisis válida');
      }
    } catch (err: any) {
      console.error('Error al analizar:', err);
      setAnalysisError('No se pudo conectar con el servicio de IA. Generando análisis local...');
      // Fallback local determinista con datos 100% reales
      const goodCount = stats.goodHabitsCompleted;
      const badCount = stats.badHabitsTriggered;
      const rate = stats.completionRate;
      setAnalysis({
        summary: `Has completado ${goodCount} hábitos positivos y registrado ${badCount} hábitos negativos con un ratio de éxito del ${rate}%.`,
        consistencyInsight: habits.length > 0 ? `Cuentas con ${habits.length} hábitos en tu registro activo.` : 'No hay suficientes hábitos registrados.',
        xpRatioInsight: `XP Ganado: ${stats.xpGained} vs XP Perdido: ${stats.xpLost}.`,
        streakInsight: `Tu racha actual es de ${profile.streak} días (Récord: ${stats.maxStreak} días).`,
        recommendations: [
          'Mantén hábitos positivos de nivel Difícil o superior para acelerar la ganancia de XP.',
          'Protege tu racha diaria completando al menos 1 objetivo clave.',
        ],
        dataSufficient: history.length >= 3,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        onImportData(content);
      } catch (err: any) {
        setImportError('El archivo no tiene un formato de respaldo válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Cálculo de puntos para gráfico de tendencia de XP
  const historyXpEvents = history.filter((h) => h.xpChange !== 0);
  let runningXp = 0;
  const trendPoints = historyXpEvents.slice(-10).map((h, i) => {
    runningXp = Math.max(0, runningXp + h.xpChange);
    return {
      step: i + 1,
      xp: runningXp,
      title: h.title,
    };
  });

  const maxPointXp = Math.max(100, ...trendPoints.map((p) => p.xp));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-serif tracking-wide">
              Estadísticas y Análisis Táctico
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de rendimiento, tendencias de XP y recomendaciones automáticas de IA.
          </p>
        </div>

        {/* Botones de Importar / Exportar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold shadow transition-all cursor-pointer"
            title="Descargar archivo JSON de respaldo"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Exportar Progreso
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold shadow transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-sky-400" />
            Importar Progreso
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importError && (
        <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 text-xs rounded-xl">
          {importError}
        </div>
      )}

      {/* 13. ESTADÍSTICAS PRINCIPALES: TODAS LAS REQUERIDAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* XP Total */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>XP Total</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.totalXp.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Experiencia acumulada</div>
        </div>

        {/* Nivel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Nivel Actual</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {profile.level}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {profile.currentLevelXp} / {profile.requiredXpForNext} XP
          </div>
        </div>

        {/* Racha Actual */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Racha Actual</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {profile.streak} <span className="text-xs font-sans text-slate-400">días</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Días consecutivos</div>
        </div>

        {/* Racha Máxima */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Racha Máxima</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.maxStreak} <span className="text-xs font-sans text-slate-400">días</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Récord histórico</div>
        </div>

        {/* Hábitos Completados */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hábitos Totales</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.goodHabitsCompleted}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Veces cumplidos</div>
        </div>

        {/* Hábitos Malos Registrados */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hábitos Malos</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">
            {stats.badHabitsTriggered}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Infracciones registradas</div>
        </div>

        {/* Misiones Completadas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Misiones Cumplidas</span>
            <Swords className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.missionsCompleted}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Desafíos logrados</div>
        </div>

        {/* Logros Desbloqueados */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Logros</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            {stats.achievementsUnlocked}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Hitos alcanzados</div>
        </div>

        {/* XP Ganado */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>XP Ganado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            +{stats.xpGained.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Por hábitos y misiones</div>
        </div>

        {/* XP Perdido */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>XP Perdido</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">
            -{stats.xpLost.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Penalizaciones</div>
        </div>

        {/* Porcentaje de Cumplimiento */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Porcentaje de Cumplimiento</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-black text-white font-mono">
              {stats.completionRate}%
            </span>
            <span className="text-xs text-slate-400">
              {stats.completionRate >= 80
                ? 'Rendimiento Impecable'
                : stats.completionRate >= 50
                ? 'Rendimiento Estable'
                : 'En Fase de Ajuste'}
            </span>
          </div>
          {/* Barra visual de cumplimiento */}
          <div className="h-2 w-full bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${stats.completionRate}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* GRÁFICAS SENCILLAS, ELEGANTES Y FÁCILES DE ENTENDER (NO CALENDARIO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico 1: Tendencia de Acumulación de XP */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Tendencia de XP en Recientes Acciones
            </h3>
            <span className="text-[10px] text-slate-500">Últimos eventos</span>
          </div>

          <div className="h-44 w-full bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 flex flex-col justify-between relative overflow-hidden">
            {trendPoints.length > 1 ? (
              <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Área bajo la curva */}
                {(() => {
                  const points = trendPoints
                    .map((p, i) => {
                      const x = (i / (trendPoints.length - 1)) * 280 + 10;
                      const y = 110 - (p.xp / maxPointXp) * 90;
                      return `${x},${y}`;
                    })
                    .join(' ');
                  const firstX = 10;
                  const lastX = 290;
                  return (
                    <polygon
                      points={`${firstX},115 ${points} ${lastX},115`}
                      fill="url(#areaGradient)"
                    />
                  );
                })()}

                {/* Línea principal */}
                <polyline
                  points={trendPoints
                    .map((p, i) => {
                      const x = (i / (trendPoints.length - 1)) * 280 + 10;
                      const y = 110 - (p.xp / maxPointXp) * 90;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Puntos clave */}
                {trendPoints.map((p, i) => {
                  const x = (i / (trendPoints.length - 1)) * 280 + 10;
                  const y = 110 - (p.xp / maxPointXp) * 90;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#fef08a"
                      stroke="#78350f"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Registra hábitos o misiones para visualizar la curva de experiencia.
              </div>
            )}

            <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
              <span>Inicio de sesión</span>
              <span className="font-mono text-amber-400/90 font-semibold">
                Máximo: {maxPointXp} XP
              </span>
              <span>Actual</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Balance de Hábitos Buenos vs Malos */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Proporción de Disciplina
            </h3>
            <span className="text-[10px] text-slate-500">Buenos vs Infracciones</span>
          </div>

          <div className="h-44 w-full bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-center gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">Hábitos Buenos Cumplidos</span>
                <span className="font-mono text-slate-200">{stats.goodHabitsCompleted}</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      stats.goodHabitsCompleted + stats.badHabitsTriggered > 0
                        ? (stats.goodHabitsCompleted /
                            (stats.goodHabitsCompleted + stats.badHabitsTriggered)) *
                          100
                        : 50
                    }%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-red-400">Hábitos Malos Registrados</span>
                <span className="font-mono text-slate-200">{stats.badHabitsTriggered}</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      stats.goodHabitsCompleted + stats.badHabitsTriggered > 0
                        ? (stats.badHabitsTriggered /
                            (stats.goodHabitsCompleted + stats.badHabitsTriggered)) *
                          100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-900">
              Ratio de victorias: <span className="font-bold text-amber-300">{stats.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 14. IA DE ANÁLISIS (NO UN CHAT) */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif tracking-wide">
                Analista Táctico de IA
              </h3>
              <p className="text-xs text-slate-400">
                Análisis automático de tendencias, constancia y recomendaciones basadas exclusivamente en tus datos.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analizando Historial...' : 'Generar Análisis Táctico'}
          </button>
        </div>

        {analysisError && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
            {analysisError}
          </div>
        )}

        {analysis ? (
          <div className="space-y-4 pt-2">
            {!analysis.dataSufficient && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Aviso de datos:</strong> Aún se están recopilando datos iniciales. Continúa registrando hábitos en los próximos días para detectar patrones avanzados de fin de semana y consistencia semanal.
                </span>
              </div>
            )}

            {/* Resumen ejecutivo */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Resumen de Rendimiento
              </span>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>

            {/* Cuadrícula de Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Constancia & Hábitos Clave
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {analysis.consistencyInsight}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Impacto de Hábitos Malos
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {analysis.xpRatioInsight}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Estado de la Racha
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {analysis.streakInsight}
                </p>
              </div>
            </div>

            {/* Recomendaciones puntuales */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Recomendaciones Tácticas
                </span>
                <ul className="mt-2 space-y-1.5">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800/80 text-slate-500 text-xs">
            Pulsa el botón superior para que el motor de IA evalúe tu progreso acumulado y detecte tus puntos fuertes y oportunidades de mejora.
          </div>
        )}
      </div>
    </div>
  );
};
