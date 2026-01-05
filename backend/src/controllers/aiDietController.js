/**
 * ============================================================================
 * aiDietController.js
 * ============================================================================
 * - Generación robusta por líneas (no dependemos de JSON perfecto)
 * - Job en memoria para poder "pintar mientras genera"
 * - NUEVO: generar por DÍA (5 comidas) con polling
 * ============================================================================
 */

const crypto = require("crypto");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================================
// CONFIG MODELO
// ============================================================================
const MODEL_CONFIG = {
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.85,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4000,
    },
};

const STRICT_MODEL_CONFIG = {
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 700,
    },
};

// ============================================================================
// DISTRIBUCIÓN POR COMIDA
// ============================================================================
const MEAL_DISTRIBUTION = {
    DESAYUNO: 0.25,
    "MEDIA_MAÑANA": 0.10,
    ALMUERZO: 0.35,
    "MEDIA_TARDE": 0.10,
    CENA: 0.20,
};

const MEAL_NAMES = {
    DESAYUNO: "Desayuno",
    "MEDIA_MAÑANA": "Media mañana",
    ALMUERZO: "Almuerzo",
    "MEDIA_TARDE": "Media tarde",
    CENA: "Cena",
};

// REEMPLAZA TODO EL OBJETO MEAL_CATEGORIES CON ESTE:
const MEAL_CATEGORIES = {
    DESAYUNO: [
        { base: "Harinas/Masas (pan, empanadas de viento, pancakes de avena)", protein: "queso, huevo" },
        { base: "Verde/Plátano (bolón, tigrillo, majado, patacones)", protein: "huevo, queso, chicharrón" }, // Movido a segunda opción
        { base: "Cereales (mote pillo, granola, avena, quinoa)", protein: "huevo, leche" },
        { base: "Yuca/Camote (muchines, tortillas de yuca, yuca cocida)", protein: "queso, huevo" },
        { base: "Arroz (calentado, arroz con huevo)", protein: "carne, salchicha" },
    ],
    MEDIA_MAÑANA: [
        { tipo: "Fruta picada con yogurt" },
        { tipo: "Frutos secos y una fruta entera" },
        { tipo: "Tostadas ligeras con aguacate" },
        { tipo: "Batido verde o de frutas" },
    ],
    ALMUERZO: [
        { base: "Sopas Ecuatorianas (locro, sancocho, bola de verde, fideo)", protein: "pollo, carne, queso" },
        { base: "Leguminosas (menestra de lenteja, fréjol, garbanzo)", protein: "carne, pollo, chuleta" },
        { base: "Arroces compuestos (arroz relleno, marinero, con pollo)", protein: "mixta" },
        { base: "Secos y Guisos (seco de pollo, estofado, carne jugo)", protein: "pollo, res" },
        { base: "Platos de Mar (sudado, encocado, ceviche)", protein: "pescado, camarón" }, // Bajamos prioridad al pescado diario
    ],
    MEDIA_TARDE: [
        { tipo: "Humita o Quimbolito" },
        { tipo: "Maduro con queso" },
        { tipo: "Canguil o Tostado" },
        { tipo: "Tortilla de maiz o trigo" },
    ],
    CENA: [
        { base: "Cremas de vegetales", protein: "pollo desmechado" },
        { base: "Proteína a la plancha con ensalada", protein: "pollo, lomo" },
        { base: "Tortilla de huevo (Omelette) con vegetales", protein: "huevo" },
        { base: "Café con humita o bollo (ligero)", protein: "queso" },
    ],
};

function selectCategory(mealType, usedRecipeNames) {
    const categories = MEAL_CATEGORIES[mealType] || [];
    if (!categories.length) return null;

    // Detectar qué bases ya se usaron
    const usedBases = usedRecipeNames
        .map(n => n.toLowerCase())
        .join(" ");

    // Encontrar categoría menos usada
    const scores = categories.map(cat => {
        const baseText = JSON.stringify(cat).toLowerCase();
        let count = 0;
        ["verde", "bolón", "tigrillo", "arroz", "pan", "avena", "humita"].forEach(word => {
            if (baseText.includes(word) && usedBases.includes(word)) count += 10;
        });
        return { cat, count };
    });

    scores.sort((a, b) => a.count - b.count);
    return scores[0].cat;
}

const DAY_NAMES = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
};

// ============================================================================
// UTILS
// ============================================================================
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(s) {
    return String(s || "").replace(/```[a-z]*\s*/gi, "").replace(/```\s*/g, "").trim();
}

function toNumberStrict(v) {
    const n = Number(String(v).replace(",", ".").trim());
    if (!Number.isFinite(n)) return null;
    return n;
}

function clampInt(n, fallback = 0) {
    const x = Number.isFinite(n) ? n : fallback;
    return Math.round(x);
}

// ============================================================================
// JOB STORE (memoria)
// ============================================================================
const jobs = new Map();

function createJob(payloadMeta) {
    const id = crypto.randomUUID();
    const job = {
        id,
        status: "running",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: { done: 0, total: 0, day: null, mealType: null },
        weeklyPlan: {
            lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, sabado: {}, domingo: {},
        },
        dayKey: null,
        metadata: payloadMeta || {},
        error: null,
    };
    jobs.set(id, job);
    return job;
}

function updateJob(id, patch) {
    const job = jobs.get(id);
    if (!job) return null;
    Object.assign(job, patch);
    job.updatedAt = new Date().toISOString();
    jobs.set(id, job);
    return job;
}

function getJob(id) {
    return jobs.get(id) || null;
}

// limpiar jobs viejos
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
        const age = now - new Date(job.createdAt).getTime();
        if (age > 1000 * 60 * 60) jobs.delete(id);
    }
}, 60_000);

// ============================================================================
// PROMPTS (por líneas)
// ============================================================================
function generateMealPromptLines(mealType, dayKey, targetData, patientContext, usedRecipeNames = []) {
    const { targetKcal, targetProtein, targetCarbs, targetFats } = targetData;
    const {
        patientName, age, gender, weight, restrictions
    } = patientContext;

    const dailyKcal = clampInt(toNumberStrict(targetKcal), 0);
    const dailyProtein = clampInt(toNumberStrict(targetProtein), 0);
    const dailyCarbs = clampInt(toNumberStrict(targetCarbs), 0);
    const dailyFats = clampInt(toNumberStrict(targetFats), 0);

    const ratio = MEAL_DISTRIBUTION[mealType] ?? 0.2;
    const mealKcal = clampInt(dailyKcal * ratio, 0);
    const mealProtein = clampInt(dailyProtein * ratio, 0);
    const mealCarbs = clampInt(dailyCarbs * ratio, 0);
    const mealFats = clampInt(dailyFats * ratio, 0);

    const dayName = DAY_NAMES[dayKey] || String(dayKey || "Día");
    const mealName = MEAL_NAMES[mealType] || String(mealType);

    // LOGICA ANTI-REPETICIÓN DE INGREDIENTES
    // Analizamos los nombres usados para encontrar patrones repetitivos
    const usedString = usedRecipeNames.join(" ").toLowerCase();
    const bannedIngredients = [];

    if (usedString.includes("verde") || usedString.includes("bolón") || usedString.includes("patacón")) bannedIngredients.push("PLÁTANO VERDE", "BOLÓN");
    if (usedString.includes("pescado") || usedString.includes("atún") || usedString.includes("tilapia")) bannedIngredients.push("PESCADO", "ATÚN");
    if (usedString.includes("lenteja") || usedString.includes("menestra")) bannedIngredients.push("LENTEJA");

    // Seleccionamos solo los ultimos 5 prohibidos para no bloquear todo, pero sí lo reciente
    const strictBanList = bannedIngredients.slice(-3).join(", ");

    // LOGICA REGIONAL ALEATORIA
    // En lugar de fijo 75% Costa, rotamos según el día para forzar variedad
    const isSierraDay = ["martes", "jueves", "sabado"].includes(dayKey);
    const regionPrompt = isSierraDay
        ? "REGIÓN: Enfócate en Sierra (Mote, papas, maíz, sopas, locros, quinoa)."
        : "REGIÓN: Enfócate en Costa (Pero VARIA: no siempre verde. Usa yuca, arroz, menestras).";

    const suggestedCategory = selectCategory(mealType, usedRecipeNames);
    const categoryHint = suggestedCategory
        ? `\n\nSUGERENCIA OBLIGATORIA DE CATEGORÍA: Intenta usar ingredientes basados en: ${JSON.stringify(suggestedCategory)}`
        : "";

    return `
ERES UN NUTRICIONISTA ECUATORIANO EXPERTO Y CREATIVO.
Tu objetivo es crear un menú que NO ABURRA al paciente. La variedad es clave.

INSTRUCCIÓN CRÍTICA:
1. Si ayer comió Verde, hoy NO PUEDE comer Verde.
2. Si ayer comió Pescado, hoy debe comer Pollo o Res.
3. Responde SOLO con el formato exacto.

CONTEXTO:
Paciente: ${patientName}, ${age} años, ${gender}
Comida: ${mealName} del ${dayName}
Objetivos: ${mealKcal} kcal | P: ${mealProtein}g | C: ${mealCarbs}g | G: ${mealFats}g
Restricciones médicas: ${restrictions || "Ninguna"}

⛔ PROHIBIDO USAR EN ESTA RECETA (Ya se comió recientemente):
${strictBanList ? strictBanList : "Ninguno específico, pero evita repetir lo de ayer."}

${regionPrompt}
${categoryHint}

FORMATO OBLIGATORIO (Empieza directo con NOMBRE=):
NOMBRE=Nombre del plato (Sé creativo, ej: "Mote Pillo", "Tortilla de Yuca", "Sanduche de Pollo")
TIEMPO=20 minutos
ING=Ingrediente Principal|cantidad|unidad|gramos
ING=Ingrediente Secundario|cantidad|unidad|gramos
ING=Vegetal/Fruta|cantidad|unidad|gramos
ING=Grasa/Adicional|cantidad|unidad|gramos
PREP=Paso 1 corto
PREP=Paso 2 corto
PREP=Paso 3 corto
NUT=${mealKcal}|${mealProtein}|${mealCarbs}|${mealFats}
`.trim();
}

// REEMPLAZA la función generateStrictPromptLines (línea 189)

function generateStrictPromptLines(mealType, dayKey, targetData, patientContext, usedRecipeNames = []) {
    const ratio = MEAL_DISTRIBUTION[mealType] ?? 0.2;

    const dailyKcal = clampInt(toNumberStrict(targetData.targetKcal), 0);
    const dailyProtein = clampInt(toNumberStrict(targetData.targetProtein), 0);
    const dailyCarbs = clampInt(toNumberStrict(targetData.targetCarbs), 0);
    const dailyFats = clampInt(toNumberStrict(targetData.targetFats), 0);

    const mealKcal = clampInt(dailyKcal * ratio, 0);
    const mealProtein = clampInt(dailyProtein * ratio, 0);
    const mealCarbs = clampInt(dailyCarbs * ratio, 0);
    const mealFats = clampInt(dailyFats * ratio, 0);

    const dayName = DAY_NAMES[dayKey] || String(dayKey || "Día");
    const mealName = MEAL_NAMES[mealType] || String(mealType);

    return `
RESPONDE EXACTAMENTE ESTE FORMATO (sin texto extra):

NOMBRE=Plato ecuatoriano típico
TIEMPO=20 minutos
ING=ingrediente|cantidad|unidad|gramos
ING=ingrediente|cantidad|unidad|gramos
ING=ingrediente|cantidad|unidad|gramos
ING=ingrediente|cantidad|unidad|gramos
PREP=paso corto de preparación
PREP=paso corto de preparación
PREP=paso corto de preparación
NUT=${mealKcal}|${mealProtein}|${mealCarbs}|${mealFats}

Comida: ${mealName} del ${dayName}
Región: Costa ecuatoriana preferentemente
EMPIEZA CON: NOMBRE=
`.trim();
}

// ============================================================================
// PARSER
// ============================================================================
function normalizeKey(rawKey) {
    const k = String(rawKey || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_")
        .replace(/[ÁÀ]/g, "A")
        .replace(/[ÉÈ]/g, "E")
        .replace(/[ÍÌ]/g, "I")
        .replace(/[ÓÒ]/g, "O")
        .replace(/[ÚÙÜ]/g, "U")
        .replace(/[Ñ]/g, "N");

    const map = {
        NOMBRE: "NOMBRE",
        TIEMPO: "TIEMPO",
        TIEMPO_PREPARACION: "TIEMPO",
        ING: "ING",
        INGREDIENTES: "ING",
        PREP: "PREP",
        PREPARACION: "PREP",
        NUT: "NUT",
        NUTRICION: "NUT",
    };
    return map[k] || k;
}

function normalizeLine(line) {
    let l = String(line || "").trim();
    if (!l) return null;

    l = l.replace(/^[\-\*\u2022•]+\s*/g, "");

    const m = l.match(/^([A-Za-zÁÉÍÓÚÜÑñ _]+)\s*[:=]\s*(.+)$/);
    if (m) return { key: normalizeKey(m[1]), val: String(m[2] || "").trim() };

    return { key: "__RAW__", val: l };
}

function parseIngredientLine(val) {
    const parts = String(val || "").split("|").map((p) => p.trim());
    if (parts.length < 2) return null;

    const alimento = parts[0] || null;
    const cantidad = parts[1] || null;
    const unidad = parts[2] || "gramos";
    const gramosStr = parts[3] ?? parts[1];

    const gramosNum = toNumberStrict(gramosStr);
    const gramos = gramosNum !== null ? gramosNum : 0;

    if (!alimento || !cantidad) return null;

    return { alimento: String(alimento), cantidad: String(cantidad), unidad: String(unidad), gramos };
}

function parseNutLine(val) {
    const s = String(val || "").trim();
    const nums = (s.match(/-?\d+(?:[.,]\d+)?/g) || [])
        .map((x) => toNumberStrict(x))
        .filter((n) => n !== null);

    if (nums.length >= 4) {
        return { calorias: nums[0], proteinas: nums[1], carbohidratos: nums[2], grasas: nums[3] };
    }
    return null;
}

function computeMealTargets(mealType, targetData) {
    const ratio = MEAL_DISTRIBUTION[mealType] ?? 0.2;
    const dailyKcal = clampInt(toNumberStrict(targetData.targetKcal), 0);
    const dailyProtein = clampInt(toNumberStrict(targetData.targetProtein), 0);
    const dailyCarbs = clampInt(toNumberStrict(targetData.targetCarbs), 0);
    const dailyFats = clampInt(toNumberStrict(targetData.targetFats), 0);

    return {
        calorias: clampInt(dailyKcal * ratio, 0),
        proteinas: clampInt(dailyProtein * ratio, 0),
        carbohidratos: clampInt(dailyCarbs * ratio, 0),
        grasas: clampInt(dailyFats * ratio, 0),
    };
}

function parseMealLinesToJson(text, dayKey, mealType, targetData, usedRecipeNames = []) {
    const dayName = DAY_NAMES[dayKey] || String(dayKey || "Día");
    const mealName = MEAL_NAMES[mealType] || String(mealType);

    const cleaned = cleanText(text);

    // AGREGAR ESTO PARA DEBUGGEAR:
    console.log("=== RESPUESTA DE IA ===");
    console.log(cleaned);
    console.log("======================");

    const rawLines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let nombre = null;
    let tiempo = null;
    const ingredientes = [];
    const preparacion = [];
    let nutricion = null;

    for (const ln of rawLines) {
        const norm = normalizeLine(ln);
        if (!norm) continue;

        if (norm.key === "NOMBRE" && !nombre) nombre = norm.val;
        else if (norm.key === "TIEMPO" && !tiempo) tiempo = norm.val;
        else if (norm.key === "ING") {
            const ing = parseIngredientLine(norm.val);
            if (ing) ingredientes.push(ing);
        } else if (norm.key === "PREP") {
            if (norm.val) preparacion.push(norm.val);
        } else if (norm.key === "NUT") {
            const n = parseNutLine(norm.val);
            if (n) nutricion = n;
        }
    }

    const targets = computeMealTargets(mealType, targetData);
    if (!nutricion) nutricion = { ...targets };

    // AGREGAR ESTO:
    console.log("Ingredientes parseados:", ingredientes.length);
    console.log("Preparación parseada:", preparacion.length);
    console.log("Preparación:", preparacion);

    // Fallback TEMPORAL si no hay preparación
    if (preparacion.length === 0) {
        console.warn("⚠️ IA no envió PREP, usando fallback temporal");
        preparacion.push("Preparar según indicaciones del plato.");
    }

    if (!nombre || !tiempo || ingredientes.length < 2) {
        throw new Error(`Formato inválido de IA: faltan NOMBRE/TIEMPO o ingredientes insuficientes (ING=${ingredientes.length})`);
    }

    return {
        recetas: [
            {
                dia: dayName,
                tipo: mealName,
                receta: { nombre, tiempoPreparacion: tiempo, ingredientes, preparacion, nutricion },
            },
        ],
        totales: { ...nutricion },
        _fallback: false,
    };
}

// ============================================================================
// Generar 1 comida (con reintentos)
// ============================================================================
async function generateSingleMeal(mealType, dayKey, targetData, patientContext, usedRecipeNames = [], maxRetries = 2) {
    const model = genAI.getGenerativeModel(MODEL_CONFIG);
    const strictModel = genAI.getGenerativeModel(STRICT_MODEL_CONFIG);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = generateMealPromptLines(mealType, dayKey, targetData, patientContext, usedRecipeNames);
            const result = await model.generateContent(prompt);
            const rawText = result?.response?.text?.() ?? "";

            try {
                return parseMealLinesToJson(rawText, dayKey, mealType, targetData, usedRecipeNames);
            } catch {
                const strictPrompt = generateStrictPromptLines(mealType, dayKey, targetData, patientContext, usedRecipeNames);
                const strictResult = await strictModel.generateContent(strictPrompt);
                const strictText = strictResult?.response?.text?.() ?? "";
                return parseMealLinesToJson(strictText, dayKey, mealType, targetData, usedRecipeNames);
            }
        } catch (error) {
            if (attempt === maxRetries) {
                throw new Error(`IA falló después de ${maxRetries} intentos: ${error.message}`);
            }
            await sleep(900 * attempt);
        }
    }

    throw new Error("No se pudieron generar recetas");
}

// ============================================================================
// (LEGACY) Generar semana (sync)
// ============================================================================
async function generateWeeklyDiet(req, res) {
    try {
        const {
            targetKcal, targetProtein, targetCarbs, targetFats,
            targetCalories, proteinGoal, carbsGoal, fatGoal,
            patientName, age, gender, weight, activityLevel,
            pathologies, restrictions, preferences,
            daysToGenerate = 7,
        } = req.body;

        const kcal = targetKcal || targetCalories;
        const protein = targetProtein || proteinGoal;
        const carbs = targetCarbs || carbsGoal;
        const fats = targetFats || fatGoal;

        if (!kcal || !protein || !carbs || !fats) {
            return res.status(400).json({ success: false, error: "Faltan datos nutricionales requeridos" });
        }

        const patientContext = {
            patientName: patientName || "Paciente",
            age: age || 30,
            gender: gender || "Masculino",
            weight: weight || 70,
            activityLevel: activityLevel || "Moderada",
            pathologies: pathologies || "Ninguna",
            restrictions: restrictions || "Ninguna",
            preferences: preferences || "Comida ecuatoriana variada y saludable",
        };

        const targetData = { targetKcal: kcal, targetProtein: protein, targetCarbs: carbs, targetFats: fats };

        const weeklyPlan = { lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, sabado: {}, domingo: {} };
        const daysArray = Object.keys(weeklyPlan).slice(0, Number(daysToGenerate) || 7);
        const mealTypes = ["DESAYUNO", "MEDIA_MAÑANA", "ALMUERZO", "MEDIA_TARDE", "CENA"];

        const usedRecipeNames = [];

        for (const day of daysArray) {
            for (const mealType of mealTypes) {
                const mealData = await generateSingleMeal(mealType, day, targetData, patientContext, usedRecipeNames, 2);
                weeklyPlan[day][mealType] = mealData.recetas || [];
                for (const r of mealData.recetas || []) {
                    const name = r?.receta?.nombre;
                    if (name) usedRecipeNames.push(String(name).trim());
                }
                await sleep(250);
            }
        }

        return res.json({ success: true, weeklyPlan });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error al generar el plan", details: error.message });
    }
}

// ============================================================================
// REGENERAR 1 COMIDA (sync)
// ============================================================================
async function regenerateSingleMeal(req, res) {
    try {
        const { day, mealType, targetKcal, targetProtein, targetCarbs, targetFats, patientContext } = req.body;

        if (!day || !mealType) {
            return res.status(400).json({ success: false, error: "Faltan parámetros: day y mealType" });
        }

        const targetData = { targetKcal, targetProtein, targetCarbs, targetFats };
        const ctx = patientContext || {
            patientName: "Paciente",
            age: 30,
            gender: "Masculino",
            weight: 70,
            activityLevel: "Moderada",
            pathologies: "Ninguna",
            restrictions: "Ninguna",
            preferences: "Comida ecuatoriana variada y saludable",
        };

        const usedNames = req.body.usedRecipeNames || [];
        const mealData = await generateSingleMeal(mealType, day, targetData, ctx, usedNames, 2);

        return res.json({
            success: true,
            recipes: mealData.recetas || [],
            totals: mealData.totales || null,
            fallbackUsed: !!mealData._fallback,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error al regenerar", details: error.message });
    }
}

// ============================================================================
// JOB: SEMANA (si aún lo usas)
// ============================================================================
async function startWeeklyDietJob(req, res) {
    try {
        const {
            targetKcal, targetProtein, targetCarbs, targetFats,
            targetCalories, proteinGoal, carbsGoal, fatGoal,
            patientName, age, gender, weight, activityLevel,
            pathologies, restrictions, preferences,
            daysToGenerate = 7,
        } = req.body;

        const kcal = targetKcal || targetCalories;
        const protein = targetProtein || proteinGoal;
        const carbs = targetCarbs || carbsGoal;
        const fats = targetFats || fatGoal;

        if (!kcal || !protein || !carbs || !fats) {
            return res.status(400).json({ success: false, error: "Faltan datos nutricionales requeridos" });
        }

        const patientContext = {
            patientName: patientName || "Paciente",
            age: age || 30,
            gender: gender || "Masculino",
            weight: weight || 70,
            activityLevel: activityLevel || "Moderada",
            pathologies: pathologies || "Ninguna",
            restrictions: restrictions || "Ninguna",
            preferences: preferences || "Comida ecuatoriana variada y saludable",
        };

        const targetData = { targetKcal: kcal, targetProtein: protein, targetCarbs: carbs, targetFats: fats };

        const job = createJob({ daysToGenerate: Number(daysToGenerate) || 7 });
        updateJob(job.id, { progress: { ...job.progress, total: (Number(daysToGenerate) || 7) * 5 } });

        runWeeklyDietJob(job.id, { targetData, patientContext, daysToGenerate: Number(daysToGenerate) || 7 }).catch((err) => {
            updateJob(job.id, { status: "error", error: err?.message || String(err) });
        });

        return res.json({ success: true, jobId: job.id });
    } catch (e) {
        return res.status(500).json({ success: false, error: "Error al iniciar job semana", details: e.message });
    }
}

function getWeeklyDietJobStatus(req, res) {
    const { id } = req.params;
    const job = getJob(id);
    if (!job) return res.status(404).json({ success: false, error: "Job no encontrado" });
    return res.json({ success: true, job });
}

async function runWeeklyDietJob(jobId, { targetData, patientContext, daysToGenerate }) {
    const mealTypes = ["DESAYUNO", "MEDIA_MAÑANA", "ALMUERZO", "MEDIA_TARDE", "CENA"];
    const daysArray = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"].slice(0, daysToGenerate);

    let done = 0;
    const usedRecipeNames = [];

    for (const day of daysArray) {
        for (const mealType of mealTypes) {
            updateJob(jobId, { progress: { ...getJob(jobId).progress, day, mealType, done } });

            const mealData = await generateSingleMeal(mealType, day, targetData, patientContext, usedRecipeNames, 2);

            const job = getJob(jobId);
            job.weeklyPlan[day][mealType] = mealData.recetas || [];
            updateJob(jobId, { weeklyPlan: job.weeklyPlan });

            for (const r of mealData.recetas || []) {
                const name = r?.receta?.nombre;
                if (name) usedRecipeNames.push(String(name).trim());
            }

            done++;
            updateJob(jobId, { progress: { ...getJob(jobId).progress, done } });
            await sleep(200);
        }
    }

    updateJob(jobId, { status: "done" });
}

// ============================================================================
// JOB: DÍA (NUEVO)
// ============================================================================
async function startDailyDietJob(req, res) {
    try {
        const {
            dayKey,
            targetKcal, targetProtein, targetCarbs, targetFats,
            targetCalories, proteinGoal, carbsGoal, fatGoal,
            patientName, age, gender, weight, activityLevel,
            pathologies, restrictions, preferences,
        } = req.body;

        if (!dayKey || !DAY_NAMES[dayKey]) {
            return res.status(400).json({ success: false, error: "dayKey inválido (lunes..domingo)" });
        }

        const kcal = targetKcal || targetCalories;
        const protein = targetProtein || proteinGoal;
        const carbs = targetCarbs || carbsGoal;
        const fats = targetFats || fatGoal;

        if (!kcal || !protein || !carbs || !fats) {
            return res.status(400).json({ success: false, error: "Faltan datos nutricionales requeridos" });
        }

        const patientContext = {
            patientName: patientName || "Paciente",
            age: age || 30,
            gender: gender || "Masculino",
            weight: weight || 70,
            activityLevel: activityLevel || "Moderada",
            pathologies: pathologies || "Ninguna",
            restrictions: restrictions || "Ninguna",
            preferences: preferences || "Comida ecuatoriana variada y saludable",
        };

        const targetData = { targetKcal: kcal, targetProtein: protein, targetCarbs: carbs, targetFats: fats };

        const job = createJob({ dayKey });
        updateJob(job.id, { dayKey, progress: { ...job.progress, total: 5 } });

        runDailyDietJob(job.id, { dayKey, targetData, patientContext }).catch((err) => {
            updateJob(job.id, { status: "error", error: err?.message || String(err) });
        });

        return res.json({ success: true, jobId: job.id });
    } catch (e) {
        return res.status(500).json({ success: false, error: "Error al iniciar job día", details: e.message });
    }
}

function getDailyDietJobStatus(req, res) {
    const { id } = req.params;
    const job = getJob(id);
    if (!job) return res.status(404).json({ success: false, error: "Job no encontrado" });
    return res.json({ success: true, job });
}

async function runDailyDietJob(jobId, { dayKey, targetData, patientContext }) {
    const mealTypes = ["DESAYUNO", "MEDIA_MAÑANA", "ALMUERZO", "MEDIA_TARDE", "CENA"];
    let done = 0;
    const usedRecipeNames = [];

    for (const mealType of mealTypes) {
        updateJob(jobId, { progress: { ...getJob(jobId).progress, day: dayKey, mealType, done } });

        const mealData = await generateSingleMeal(mealType, dayKey, targetData, patientContext, usedRecipeNames, 2);

        const job = getJob(jobId);
        job.weeklyPlan[dayKey][mealType] = mealData.recetas || [];
        updateJob(jobId, { weeklyPlan: job.weeklyPlan });

        for (const r of mealData.recetas || []) {
            const name = r?.receta?.nombre;
            if (name) usedRecipeNames.push(String(name).trim());
        }

        done++;
        updateJob(jobId, { progress: { ...getJob(jobId).progress, done } });
        await sleep(200);
    }

    updateJob(jobId, { status: "done" });
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
    generateWeeklyDiet,
    regenerateSingleMeal,

    startWeeklyDietJob,
    getWeeklyDietJobStatus,

    startDailyDietJob,
    getDailyDietJobStatus,
};
