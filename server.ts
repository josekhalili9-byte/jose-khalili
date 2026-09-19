import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const SAVE_FILE_PATH = path.join(DATA_DIR, "saved_game.json");

// Asegurar directorio data
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("No se pudo crear el directorio de datos:", err);
  }
}

// Lazy initialization of Gemini API
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Guardar partida en el servidor
  app.post("/api/save", (req, res) => {
    try {
      const data = req.body;
      if (!data || typeof data !== "object") {
        return res.status(400).json({ error: "Datos de guardado inválidos." });
      }
      
      const payload = {
        savedAt: new Date().toISOString(),
        ...data,
      };

      fs.writeFileSync(SAVE_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true, savedAt: payload.savedAt });
    } catch (err: any) {
      console.error("Error al escribir partida en servidor:", err);
      return res.status(500).json({ error: "Error al guardar partida en disco.", details: err.message });
    }
  });

  // Cargar partida desde el servidor
  app.get("/api/save", (_req, res) => {
    try {
      if (!fs.existsSync(SAVE_FILE_PATH)) {
        return res.json({ exists: false, data: null });
      }
      const raw = fs.readFileSync(SAVE_FILE_PATH, "utf-8");
      const data = JSON.parse(raw);
      return res.json({ exists: true, data });
    } catch (err: any) {
      console.error("Error al leer partida del servidor:", err);
      return res.status(500).json({ error: "Error al leer datos guardados.", details: err.message });
    }
  });

  // Reiniciar partida guardada en servidor
  app.post("/api/reset", (_req, res) => {
    try {
      if (fs.existsSync(SAVE_FILE_PATH)) {
        fs.unlinkSync(SAVE_FILE_PATH);
      }
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error al reiniciar partida en servidor:", err);
      return res.status(500).json({ error: "Error al borrar partida.", details: err.message });
    }
  });

  // AI Analyst endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { profile, habits, missions, history, stats } = req.body;

      if (!profile || !stats) {
        return res.status(400).json({ error: "Faltan datos del perfil o estadísticas." });
      }

      const ai = getGeminiClient();

      // If Gemini client is not configured, return deterministic analytical summary based strictly on user data
      if (!ai) {
        const fallbackAnalysis = generateDeterministicAnalysis({ profile, habits, missions, history, stats });
        return res.json({ analysis: fallbackAnalysis, source: "deterministic" });
      }

      const prompt = `Eres el Analista Táctico de Progreso de un videojuego de hábitos RPG personal.
IMPORTANTE:
- NO actúes como un chatbot ni uses saludos conversacionales.
- Basa tu análisis EXCLUSIVAMENTE en los datos reales proporcionados. NO inventes información.
- Si no existen suficientes datos en el historial (ejemplo: menos de 2 o 3 registros), indícalo claramente diciendo que se necesita mayor registro de días para obtener tendencias avanzadas.
- Analiza:
  1. Porcentaje y tendencia de cumplimiento.
  2. Hábitos más constantes vs. hábitos que se están descuidando.
  3. Análisis de XP ganado vs. XP perdido por hábitos malos.
  4. Estado de la racha actual y racha máxima.
  5. De 2 a 3 recomendaciones tácticas, breves y concretas.

Estructura de respuesta esperada en formato JSON con las claves:
- "summary": (resumen ejecutivo de 2 a 3 oraciones concisas y directas)
- "consistencyInsight": (análisis de constancia y hábitos descuidados o destacados)
- "xpRatioInsight": (análisis de XP ganado vs perdido por hábitos negativos)
- "streakInsight": (comentario sobre el estado de la racha)
- "recommendations": (array de 2 a 3 strings con recomendaciones puntuales)
- "dataSufficient": (booleano, true si hay suficiente historial para conclusiones firmes)

Datos del Usuario:
Nivel: ${profile.level}
XP Actual en nivel: ${profile.currentLevelXp} / ${profile.requiredXpForNext}
XP Total Acumulado: ${stats.totalXp}
XP Ganado Histórico: ${stats.xpGained}
XP Perdido por Hábitos Malos: ${stats.xpLost}
Racha Actual: ${profile.streak} días
Racha Máxima: ${stats.maxStreak} días
Hábitos Buenos Completados: ${stats.goodHabitsCompleted}
Hábitos Malos Registrados: ${stats.badHabitsTriggered}
Misiones Completadas: ${stats.missionsCompleted}
Logros Desbloqueados: ${stats.achievementsUnlocked}
Porcentaje de Cumplimiento: ${stats.completionRate}%

Lista de Hábitos:
${JSON.stringify(
  (habits || []).map((h: any) => ({
    title: h.title,
    type: h.type,
    difficulty: h.difficulty,
    timesCompleted: h.timesCompleted || 0,
    timesTriggered: h.timesTriggered || 0,
  })),
  null,
  2
)}

Misiones:
${JSON.stringify(
  (missions || []).map((m: any) => ({
    title: m.title,
    difficulty: m.difficulty,
    completed: m.completed,
  })),
  null,
  2
)}

Últimos registros de historial:
${JSON.stringify((history || []).slice(-15), null, 2)}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error("No se obtuvo respuesta del modelo");
      }

      try {
        const parsed = JSON.parse(responseText);
        return res.json({ analysis: parsed, source: "gemini" });
      } catch {
        return res.json({
          analysis: {
            summary: responseText,
            consistencyInsight: "Revisa tu lista de hábitos para balancear prioridades.",
            xpRatioInsight: `Has ganado ${stats.xpGained} XP y perdido ${stats.xpLost} XP.`,
            streakInsight: `Racha de ${profile.streak} días en curso.`,
            recommendations: ["Mantén el ritmo diario", "Evita hábitos que resten experiencia."],
            dataSufficient: (history || []).length >= 3,
          },
          source: "gemini-raw",
        });
      }
    } catch (err: any) {
      console.error("Error al procesar análisis con Gemini:", err);
      // Fallback gracioso usando análisis determinista con datos reales
      const { profile, habits, missions, history, stats } = req.body;
      const fallbackAnalysis = generateDeterministicAnalysis({ profile, habits, missions, history, stats });
      return res.json({ analysis: fallbackAnalysis, source: "deterministic-fallback", note: err.message });
    }
  });

  // Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RPG Habitos] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

function generateDeterministicAnalysis(data: any) {
  const { profile, habits = [], history = [], stats } = data;
  const historyCount = history.length;
  const isSufficient = historyCount >= 4;

  const goodHabits = habits.filter((h: any) => h.type === "good");
  const badHabits = habits.filter((h: any) => h.type === "bad");

  // Hábito más constante
  const sortedGood = [...goodHabits].sort((a, b) => (b.timesCompleted || 0) - (a.timesCompleted || 0));
  const mostConsistent = sortedGood[0]?.timesCompleted > 0 ? sortedGood[0].title : null;

  // Hábito descuidado
  const neglected = sortedGood.find((h) => (h.timesCompleted || 0) === 0);

  const xpLost = stats?.xpLost || 0;
  const xpGained = stats?.xpGained || 0;
  const streak = profile?.streak || 0;
  const completionRate = stats?.completionRate ?? 0;

  const recommendations: string[] = [];
  if (neglected) {
    recommendations.push(`Prioriza realizar "${neglected.title}" en tu próxima sesión para reactivar su progreso.`);
  } else {
    recommendations.push("Continúa completando tus hábitos de mayor dificultad para acelerar la subida de nivel.");
  }

  if (badHabits.length > 0 && xpLost > 0) {
    recommendations.push(`Identifica el detonante de tus hábitos negativos para proteger tus ${xpGained} XP acumulados.`);
  } else {
    recommendations.push("Mantén tu racha activa completando al menos tus objetivos diarios clave.");
  }

  return {
    summary: isSufficient
      ? `Completaste el ${completionRate}% de tus hábitos activos con un total de ${xpGained} XP ganados.`
      : "Aún se están recopilando datos iniciales. Registra más hábitos en los próximos días para un análisis más profundo.",
    consistencyInsight: mostConsistent
      ? `Tu hábito más constante es "${mostConsistent}" con ${sortedGood[0].timesCompleted} ejecuciones.`
      : "Aún no hay suficiente frecuencia registrada para destacar un hábito constante.",
    xpRatioInsight: xpLost > 0
      ? `Has perdido ${xpLost} XP en penalizaciones por hábitos negativos frente a ${xpGained} XP ganados.`
      : `Excelente disciplina: no has perdido XP por hábitos negativos.`,
    streakInsight: streak > 0
      ? `Tu racha actual es de ${streak} día${streak > 1 ? "s" : ""} consecutivos (récord: ${stats?.maxStreak || streak} días).`
      : "Tu racha está en 0 días. Completa tus hábitos de hoy para encender el multiplicador de constancia.",
    recommendations,
    dataSufficient: isSufficient,
  };
}

startServer();
