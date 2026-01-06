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
        temperature: 0.7, // Bajado para menos repetición aleatoria
        topP: 0.9,
        topK: 50, // Subido para más opciones
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

// OBJETO MEAL_CATEGORIES EXPANDIDO CON MÁS OPCIONES PARA VARIEDAD
const MEAL_CATEGORIES = {
    DESAYUNO: [
        { base: "Harinas/Masas (pan de yuca, empanadas de verde, pancakes de quinoa, bollo de maíz)", protein: "queso fresco, huevo, jamón, chorizo" },
        { base: "Verde/Plátano (bolón mixto, tigrillo con chicharrón, majado de yuca, patacones con huevo)", protein: "huevo, queso, chorizo, longaniza" },
        { base: "Cereales (mote pillo andino, granola con frutas, avena con leche de coco, quinoa cocida con frutas)", protein: "huevo, yogurt, nueces, leche" },
        { base: "Yuca/Camote/Papas (tortillas de yuca, muchines de camote, papas con cuero, yuca frita con queso)", protein: "queso, huevo, longaniza, chicharrón" },
        { base: "Arroz/Maíz (arroz con huevo frito, humitas dulces, tostado con queso, arroz con leche ligera)", protein: "carne molida, salchicha, atún, huevo" },
        { base: "Galápagos (pescado fresco con yuca, ceviche ligero de atún, mariscos con plátano)", protein: "pescado fresco, pollo, mariscos" },
        { base: "Frutas y Lácteos (ensalada de frutas con yogurt, batido de frutas con avena, pan con mermelada y queso)", protein: "yogurt, queso, nueces" },
        { base: "Huevos Variados (huevos revueltos con vegetales, omelette con jamón, huevos pericos con tomate)", protein: "huevo, jamón, queso" },
        { base: "Sierra Tradicional (locro ligero de papa, tortilla de maíz con queso, mote con chicharrón)", protein: "queso, chicharrón, huevo" },
        { base: "Costa Ligera (encebollado sin pescado, arroz con menestra ligera, plátano maduro con queso)", protein: "queso, huevo, pollo desmechado" },
    ],
    MEDIA_MAÑANA: [
        { tipo: "Fruta picada (babaco, taxo, naranjilla) con yogurt natural" },
        { tipo: "Frutos secos (maní, nueces) y una fruta entera (guanábana, maracuyá)" },
        { tipo: "Tostadas de maíz con aguacate y tomate de árbol" },
        { tipo: "Batido verde (con guayaba) o de frutas tropicales" },
        { tipo: "Queso fresco con maduro asado" },
        { tipo: "Yogurt con granola y miel de panela" },
        { tipo: "Empanadita de queso ligera" },
        { tipo: "Fruta con tajadas de queso costeño" },
        { tipo: "Batido de avena con banana y canela" },
        { tipo: "Nueces mixtas con pasas" },
    ],
    ALMUERZO: [
        { base: "Sopas Ecuatorianas (locro de papa sierreño, sancocho costeño, fanesca, yaguarlocro, sopa de bola de verde)", protein: "pollo, carne, habas, queso, chicharrón" },
        { base: "Leguminosas (menestra de fréjol negro, garbanzo con chorizo, habas con cuero, lentejas con arroz)", protein: "carne de res, pollo, cerdo, chorizo" },
        { base: "Arroces compuestos (chaulafán, arroz con menestra, arroz marinero galapagueño, arroz con pollo a la ecuatoriana)", protein: "camarón, pollo, mixta, carne" },
        { base: "Secos y Guisos (seco de chivo andino, guatita costeña, estofado de lengua, tonga de pollo)", protein: "pollo, res, cerdo, chivo" },
        { base: "Platos de Mar (ceviche de concha, encocado de pescado, sudado de trucha, arroz con camarones)", protein: "pescado, mariscos, camarón, trucha" },
        { base: "Vegetariano (cazuela de yuca, tortilla de tilapia, ensalada con quinoa y vegetales, locro vegetariano)", protein: "huevos, queso, legumbres, tofu" },
        { base: "Guisos Sierra (fritada con mote, llapingacho con chorizo, caldo de gallina)", protein: "cerdo, chorizo, gallina" },
        { base: "Platos Costa (viche de pescado, corviche, bolón de mariscos, arroz con concha)", protein: "pescado, mariscos, concha" },
        { base: "Asados (churrasco ecuatoriano, hornado de cerdo, pollo asado con ensalada)", protein: "res, cerdo, pollo" },
        { base: "Galápagos Especial (ceviche de langosta, pescado a la plancha con arroz, mariscos encocados)", protein: "langosta, pescado, mariscos" },
    ],
    MEDIA_TARDE: [
        { tipo: "Humita sierreña o quimbolito con café" },
        { tipo: "Maduro asado con queso costeño" },
        { tipo: "Canguil tostado o maíz mote" },
        { tipo: "Tortilla de maíz con miel de panela" },
        { tipo: "Empanada de viento ligera con aji" },
        { tipo: "Prístiños con café negro" },
        { tipo: "Quesillo con maduro" },
        { tipo: "Tostado de maíz con maní" },
        { tipo: "Batido de frutas con yogurt" },
        { tipo: "Galletas de avena con té" },
    ],
    CENA: [
        { base: "Cremas de vegetales (crema de zapallo andino, de ahuyama costeña, crema de papa con queso)", protein: "pollo desmenuzado, queso, huevo" },
        { base: "Proteína a la plancha (lomo fino, pechuga) con ensalada de palmito" },
        { base: "Tortilla de huevo (omelette) con vegetales y hierbas" },
        { base: "Café con bollo de yuca o pristiños ligeros", protein: "queso fresco" },
        { base: "Sopa ligera de quinoa con verduras", protein: "tofu o huevo" },
        { base: "Ensalada mixta con atún o pollo (ensalada rusa ligera, ceviche vegetariano)", protein: "atún, pollo, queso" },
        { base: "Sopas ligeras (caldo de res desgrasado, sopa de fideo con vegetales)", protein: "res, pollo" },
        { base: "Yuca o plátano con proteína (yuca cocida con huevo, maduro con salchicha ligera)", protein: "huevo, salchicha, queso" },
        { base: "Arroz integral con vegetales y proteína (arroz con zanahoria y pollo, quinoa salteada)", protein: "pollo, res" },
        { base: "Galápagos ligera (pescado al vapor con ensalada, mariscos hervidos)", protein: "pescado, mariscos" },
    ],
};

function selectCategory(mealType, usedRecipeNames) {
    const categories = MEAL_CATEGORIES[mealType] || [];
    if (!categories.length) return null;

    const usedBases = usedRecipeNames
        .map(n => String(n || "").toLowerCase())
        .join(" ");

    const scores = categories.map(cat => {
        const baseText = JSON.stringify(cat).toLowerCase();
        let count = 0;
        ["verde", "bolón", "tigrillo", "arroz", "pan", "avena", "humita"].forEach(word => {
            if (baseText.includes(word) && usedBases.includes(word)) count += 10;
        });
        return { cat, count };
    });

    scores.sort((a, b) => a.count - b.count || Math.random() - 0.5);
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

/**
 * ✅ DEDUPE robusto para nombres de recetas (evita duplicados por mayúsculas/espacios)
 * - Mantiene orden
 * - Limita tamaño para que no explote el prompt
 */
function dedupeNamesPreserveOrder(input, limit = 200) {
    if (!Array.isArray(input)) return [];
    const seen = new Set();
    const out = [];

    for (const raw of input) {
        if (raw == null) continue;
        const original = String(raw).trim();
        if (!original) continue;

        const key = original.toLowerCase().replace(/\s+/g, " ").trim();
        if (!key || seen.has(key)) continue;

        seen.add(key);
        out.push(original);
        if (out.length >= limit) break;
    }

    return out;
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
function generateMealPromptLines(mealType, dayKey, targetData, patientContext, usedRecipeNames = [], isRegen = false) {
    const { targetKcal, targetProtein, targetCarbs, targetFats } = targetData;
    const { patientName, age, gender, restrictions, pathologies } = patientContext;

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

    const usedString = usedRecipeNames.join(" ").toLowerCase();
    const commonIngredients = ["verde", "bolón", "tigrillo", "pescado", "atún", "tilapia", "lenteja", "fréjol", "arroz", "yuca", "mote", "quinoa", "pollo", "res", "huevo", "queso", "camote", "papas"];
    const occurrences = commonIngredients.reduce((acc, word) => {
        acc[word] = (usedString.match(new RegExp(word, "gi")) || []).length;
        return acc;
    }, {});
    const banned = Object.entries(occurrences).filter(([_, count]) => count > 1).map(([word]) => word.toUpperCase());
    const strictBanList = banned.slice(-5).join(", ");

    const regionPrompt =
        "REGIÓN: Todo Ecuador. Integra ingredientes de Sierra (mote, papas, quinoa, habas), Costa (plátano, yuca, arroz, menestras, mariscos), Galápagos (pescados frescos, langosta). PRIORIZA VARIEDAD: No repitas regiones consecutivas, mezcla para no aburrir.";

    const suggestedCategory = selectCategory(mealType, usedRecipeNames);
    const categoryHint = suggestedCategory
        ? `\n\nSUGERENCIA OBLIGATORIA DE CATEGORÍA: Intenta usar ingredientes basados en: ${JSON.stringify(suggestedCategory)}`
        : "";

    const regenPrompt = isRegen
        ? "\n\nESTO ES UNA REGENERACIÓN: Genera un plato COMPLETAMENTE DIFERENTE al anterior. No uses ingredientes similares ni el mismo base."
        : "";

    return `
ERES UN NUTRICIONISTA ECUATORIANO EXPERTO Y CREATIVO.
Tu objetivo es crear un menú que NO ABURRA al paciente. La variedad es clave.

INSTRUCCIÓN CRÍTICA:
1. NO REPETIR NINGÚN PLATO de la lista prohibida. Sé creativo y usa combinaciones nuevas.
2. Si un día tuvo un plato con plátano, evita plátano en los próximos 2-3 platos.
3. Ajusta estrictamente a restricciones del paciente: ${restrictions}. Como experto en nutrición ecuatoriana, prioriza balance y salud (e.g., bajo sodio si hipertensión).
4. Adapta a patologías: ${pathologies || "Ninguna"}. E.g., si diabetes, usa bajos carbohidratos simples; si hipertensión, reduce sal.
5. Responde SOLO con el formato exacto.
6. La sección PREPARACIÓN es OBLIGATORIA: escribe entre 3 y 6 líneas PREP= con pasos concretos (lavar, picar, saltear, hervir, hornear, licuar, etc.). No uses textos genéricos como "En", "igual que antes" o "Preparar según indicaciones del plato".

CONTEXTO:
Paciente: ${patientName}, ${age} años, ${gender}
Comida: ${mealName} del ${dayName}
Objetivos: ${mealKcal} kcal | P: ${mealProtein}g | C: ${mealCarbs}g | G: ${mealFats}g
Restricciones médicas: ${restrictions || "Ninguna"}
Patologías: ${pathologies || "Ninguna"}

⛔ PROHIBIDO USAR EN ESTA RECETA (Ya se comió recientemente):
${strictBanList ? strictBanList : "Ninguno específico, pero evita repetir lo de ayer."}

⛔ PLATOS PROHIBIDOS (Ya usados en la semana): ${usedRecipeNames.join(", ") || "Ninguno aún, pero mantén variedad."}

${regionPrompt}
${categoryHint}
${regenPrompt}

REGLAS PARA EL NOMBRE (NOMBRE=) - OBLIGATORIO:
- Usa nombres COMUNES en Ecuador. No uses palabras “raras” o inventadas para la zona.
- Evita estos términos en el nombre: ANDINO, TROPICAL, ATACAMEÑA, FIT, GOURMET.
- Si el plato es una BEBIDA: el nombre debe ser "Batido de <fruta>" o "Jugo de <fruta>".
  Ejemplos válidos: "Batido de mora", "Batido de banana con avena", "Jugo de naranja".
- PROHIBIDO: "Batido de chocho". El chocho NO se usa como batido.



FORMATO OBLIGATORIO (Empieza directo con NOMBRE=):
NOMBRE=Nombre del plato original sin inventar nombres
TIEMPO=tiempo estimado en minutos (ej: "20 minutos")
ING=Ingrediente Principal|cantidad|unidad|gramos
ING=Ingrediente Secundario|cantidad|unidad|gramos
ING=Vegetal/Fruta|cantidad|unidad|gramos
ING=Grasa/Adicional|cantidad|unidad|gramos
PREP=Paso 1 corto, claro y accionable (ej: "Lava y corta las verduras en trozos pequeños.")
PREP=Paso 2 corto, claro y accionable (ej: "Saltea la proteína en una sartén con poco aceite.")
PREP=Paso 3 corto, claro y accionable (ej: "Agrega los vegetales y cocina hasta que queden al dente.")
PREP=Paso 4 corto y concreto si es necesario (ej: "Sirve en un plato hondo y agrega los acompañantes.")
PREP=Paso 5 opcional solo si aporta información útil
NUT=${mealKcal}|${mealProtein}|${mealCarbs}|${mealFats}
`.trim();
}

function generateStrictPromptLines(mealType, dayKey, targetData, patientContext) {
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
    
REGLAS PARA EL NOMBRE (NOMBRE=) - OBLIGATORIO:
- Nombre común en Ecuador. Sin "Andino", "Tropical", "Atacameña", "Detox", "Fit".
- Prohibido: "Batido de chocho".
- Sin palabras en inglés (bowl, wrap, smoothie, etc.).
    
RESPONDE EXACTAMENTE ESTE FORMATO (sin texto extra):

NOMBRE=Plato ecuatoriano típico sin inventar nombres 
TIEMPO=20 minutos
ING=ingrediente|cantidad|unidad|gramos
ING=ingrediente|cantidad|unidad|gramos
ING=ingrediente|cantidad|unidad|gramos
ING=ingrediente|cantidad|unidad|gramos
PREP=paso corto de preparación, concreto (ej: "Lava y pica las verduras")
PREP=paso corto de preparación, concreto (ej: "Cocina la proteína a la plancha o al horno")
PREP=paso corto de preparación, concreto (ej: "Mezcla todo y sirve en porciones individuales")
PREP=paso corto adicional si es necesario (ej: "Decora con hierbas frescas antes de servir")
NUT=${mealKcal}|${mealProtein}|${mealCarbs}|${mealFats}

Comida: ${mealName} del ${dayName}
Región: Todo Ecuador con variedad
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

function parseMealLinesToJson(text, dayKey, mealType, targetData) {
    const dayName = DAY_NAMES[dayKey] || String(dayKey || "Día");
    const mealName = MEAL_NAMES[mealType] || String(mealType);

    const cleaned = cleanText(text);
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

    let finalPreparacion = preparacion
        .map((p) => String(p || "").trim())
        .filter((p) => p.length >= 5);

    if (finalPreparacion.length === 0) {
        finalPreparacion = [
            "Reúne todos los ingredientes indicados y realiza la mise en place (lavar, pelar y cortar según corresponda).",
            "Aplica la técnica de cocción principal (hervir, saltear, hornear, licuar o mezclar en frío) respetando tiempos y texturas de cada alimento.",
            "Ajusta condimentos al gusto del paciente y sirve en porciones individuales, respetando las cantidades sugeridas en la receta.",
        ];
    }

    if (!nombre || !tiempo || ingredientes.length < 2) {
        throw new Error(`Formato inválido de IA: faltan NOMBRE/TIEMPO o ingredientes insuficientes (ING=${ingredientes.length})`);
    }

    return {
        recetas: [
            {
                dia: dayName,
                tipo: mealName,
                receta: { nombre, tiempoPreparacion: tiempo, ingredientes, preparacion: finalPreparacion, nutricion },
            },
        ],
        totales: { ...nutricion },
        _fallback: false,
    };
}

// ============================================================================
// Generar 1 comida (con reintentos + fallback strict real)
// ============================================================================
async function generateSingleMeal(mealType, dayKey, targetData, patientContext, usedRecipeNames = [], maxRetries = 2, isRegen = false) {
    const model = genAI.getGenerativeModel(MODEL_CONFIG);
    const strictModel = genAI.getGenerativeModel(STRICT_MODEL_CONFIG);

    // Para comparar sin romper por mayúsculas
    const usedLower = dedupeNamesPreserveOrder(usedRecipeNames)
        .map(n => n.toLowerCase().replace(/\s+/g, " ").trim());

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = generateMealPromptLines(mealType, dayKey, targetData, patientContext, usedRecipeNames, isRegen);
            const result = await model.generateContent(prompt);
            const rawText = result?.response?.text?.() ?? "";

            let parsed;

            // 1) Intento normal parse
            try {
                parsed = parseMealLinesToJson(rawText, dayKey, mealType, targetData);
            } catch (parseErr) {
                // 2) Fallback strict
                const strictPrompt = generateStrictPromptLines(mealType, dayKey, targetData, patientContext);
                const strictResult = await strictModel.generateContent(strictPrompt);
                const strictText = strictResult?.response?.text?.() ?? "";
                parsed = parseMealLinesToJson(strictText, dayKey, mealType, targetData);
                parsed._fallback = true;
            }

            // Validar no repetición por NOMBRE
            const newName = String(parsed?.recetas?.[0]?.receta?.nombre || "").toLowerCase().replace(/\s+/g, " ").trim();
            if (newName && usedLower.includes(newName)) {
                throw new Error("Receta repetida, reintentando");
            }

            return parsed;
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
        const { day, mealType, targetKcal, targetProtein, targetCarbs, targetFats, patientContext, previousRecipeName } = req.body;

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

        const usedNamesRaw = req.body.usedRecipeNames || [];
        const usedNames = dedupeNamesPreserveOrder(usedNamesRaw);

        if (previousRecipeName) usedNames.push(String(previousRecipeName).trim());

        const mealData = await generateSingleMeal(mealType, day, targetData, ctx, usedNames, 2, true);

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
    const daysArray = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].slice(0, daysToGenerate);

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

            // ✅ NUEVO: nombres ya usados en la semana (desde frontend)
            usedRecipeNames: usedRecipeNamesIn,
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

        // ✅ Sanitizar y deduplicar
        const usedRecipeNames = dedupeNamesPreserveOrder(usedRecipeNamesIn);

        const job = createJob({ dayKey });
        updateJob(job.id, {
            dayKey,
            progress: { ...job.progress, total: 5 },
            metadata: { ...(job.metadata || {}), usedRecipeNamesCount: usedRecipeNames.length },
        });

        runDailyDietJob(job.id, { dayKey, targetData, patientContext, usedRecipeNames }).catch((err) => {
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

async function runDailyDietJob(jobId, { dayKey, targetData, patientContext, usedRecipeNames = [] }) {
    const mealTypes = ["DESAYUNO", "MEDIA_MAÑANA", "ALMUERZO", "MEDIA_TARDE", "CENA"];
    let done = 0;

    // ✅ Copia local para no mutar lo recibido
    const used = dedupeNamesPreserveOrder(usedRecipeNames);

    for (const mealType of mealTypes) {
        updateJob(jobId, { progress: { ...getJob(jobId).progress, day: dayKey, mealType, done } });

        const mealData = await generateSingleMeal(mealType, dayKey, targetData, patientContext, used, 2);

        const job = getJob(jobId);
        job.weeklyPlan[dayKey][mealType] = mealData.recetas || [];
        updateJob(jobId, { weeklyPlan: job.weeklyPlan });

        // ✅ Agregar nombres generados para que las siguientes comidas NO repitan
        for (const r of mealData.recetas || []) {
            const name = r?.receta?.nombre;
            if (name) used.push(String(name).trim());
        }

        // ✅ dedupe ocasional por seguridad
        if (used.length > 40) {
            const d = dedupeNamesPreserveOrder(used);
            used.length = 0;
            used.push(...d);
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
