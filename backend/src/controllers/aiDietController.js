// backend/src/controllers/aiDietController.js
// ============================================
// VERSIÓN CORREGIDA: MINIFICACIÓN + TRADUCCIÓN AUTOMÁTICA
// ============================================

const fetch = require("node-fetch");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY no está configurada");
    throw new Error("GEMINI_API_KEY no configurada");
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 90000);
const MAX_RETRIES = 2;

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function shouldRetry(status) {
    return status === 429 || (status >= 500 && status <= 599);
}

function extractJsonFromText(text) {
    if (!text || typeof text !== "string") return null;
    let t = text.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    return t.substring(firstBrace, lastBrace + 1);
}

function sumTotals(items) {
    return items.reduce(
        (acc, it) => ({
            kcal: acc.kcal + (Number(it.kcal) || 0),
            proteina: acc.proteina + (Number(it.proteina) || 0),
            carbohidratos: acc.carbohidratos + (Number(it.carbohidratos) || 0),
            grasas: acc.grasas + (Number(it.grasas) || 0),
        }),
        { kcal: 0, proteina: 0, carbohidratos: 0, grasas: 0 }
    );
}

function roundTotals(t) {
    return {
        kcal: Number(t.kcal.toFixed(0)),
        proteina: Number(t.proteina.toFixed(1)),
        carbohidratos: Number(t.carbohidratos.toFixed(1)),
        grasas: Number(t.grasas.toFixed(1)),
    };
}

// 🔥 NUEVA FUNCIÓN: Traduce el JSON comprimido a formato completo
// Esto permite que la IA ahorre tokens ("n", "k") pero tu app reciba nombres completos ("recetaNombre")
function expandirMenuBackend(menuMinificado) {
    const menuCompleto = {};

    // Si por alguna razón la IA ya envió formato largo, lo devolvemos tal cual
    try {
        const checkDay = Object.values(menuMinificado)[0];
        const checkMeal = Object.values(checkDay)[0];
        if (checkMeal && checkMeal[0] && checkMeal[0].recetaNombre) return menuMinificado;
    } catch (e) {}

    Object.keys(menuMinificado).forEach(dia => {
        menuCompleto[dia] = {};
        Object.keys(menuMinificado[dia]).forEach(tipoComida => {
            const comidas = Array.isArray(menuMinificado[dia][tipoComida])
                ? menuMinificado[dia][tipoComida]
                : [];

            menuCompleto[dia][tipoComida] = comidas.map(receta => ({
                recetaNombre: receta.n,       // n -> recetaNombre
                tiempoPrep: receta.t,         // t -> tiempoPrep
                ingredientes: (receta.i || []).map(ing => ({
                    alimento: ing.a,          // a -> alimento
                    grams: Number(ing.g),     // g -> grams
                    kcal: Number(ing.k),      // k -> kcal
                    proteina: Number(ing.p),  // p -> proteina
                    carbohidratos: Number(ing.c), // c -> carbohidratos
                    grasas: Number(ing.f)     // f -> grasas
                })),
                instrucciones: receta.ins || [],
                tips: receta.tip || ""
            }));
        });
    });

    return menuCompleto;
}

async function callGemini({ prompt, requestId }) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${API_KEY}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        });

        console.log(`📡 [${requestId}] Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            const err = new Error(`Gemini API Error ${response.status}: ${errorText}`);
            err.httpStatus = response.status;
            throw err;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return { text };
    } catch (err) {
        if (err?.name === "AbortError") {
            const e = new Error(`Timeout: Gemini tardó más de ${GEMINI_TIMEOUT_MS}ms`);
            e.httpStatus = 504;
            throw e;
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

function validateAiMenuShape(menuObj) {
    const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const meals = ["desayuno", "media_manana", "almuerzo", "snack", "cena"];

    for (const d of days) {
        if (!menuObj[d] || typeof menuObj[d] !== "object") return false;
        for (const m of meals) {
            if (!Array.isArray(menuObj[d][m])) return false;
            // Ahora validamos sobre el objeto EXPANDIDO, así que debe tener recetaNombre
            for (const receta of menuObj[d][m]) {
                if (!receta.recetaNombre) return false;
                if (!Array.isArray(receta.ingredientes)) return false;
            }
        }
    }
    return true;
}

function autoScalePortions(menu, targetCalories) {
    console.log("🔧 Auto-escalado de porciones...");
    const scaledMenu = JSON.parse(JSON.stringify(menu));
    const scaledTotals = {};

    for (const day of Object.keys(menu)) {
        let dayKcal = 0;
        // Calculamos calorías totales del día
        for (const mealKey of Object.keys(menu[day])) {
            for (const receta of menu[day][mealKey]) {
                for (const ing of receta.ingredientes) {
                    dayKcal += Number(ing.kcal) || 0;
                }
            }
        }

        const scaleFactor = dayKcal > 0 ? targetCalories / dayKcal : 1.0;

        if (dayKcal > 0 && Math.abs(scaleFactor - 1.0) > 0.1) {
            console.log(`📊 ${day}: ${scaleFactor.toFixed(2)}x (${dayKcal.toFixed(0)} → ${targetCalories} kcal)`);

            for (const mealKey of Object.keys(scaledMenu[day])) {
                for (const receta of scaledMenu[day][mealKey]) {
                    for (const ing of receta.ingredientes) {
                        ing.grams = Math.round(ing.grams * scaleFactor);
                        ing.kcal = Number((ing.kcal * scaleFactor).toFixed(1));
                        ing.proteina = Number((ing.proteina * scaleFactor).toFixed(1));
                        ing.carbohidratos = Number((ing.carbohidratos * scaleFactor).toFixed(1));
                        ing.grasas = Number((ing.grasas * scaleFactor).toFixed(1));
                    }
                }
            }
        }

        scaledTotals[day] = {};
        for (const mealKey of Object.keys(scaledMenu[day])) {
            const mealItems = [];
            for (const receta of scaledMenu[day][mealKey]) {
                mealItems.push(...receta.ingredientes);
            }
            scaledTotals[day][mealKey] = roundTotals(sumTotals(mealItems));
        }
    }
    return { scaledMenu, scaledTotals };
}

exports.generateWeeklyDiet = async (req, res) => {
    const requestId = crypto.randomUUID();
    const { patientName, targetCalories, restrictions, proteinGoal, carbsGoal, fatGoal } = req.body || {};

    console.log(`🔵 [${requestId}] Generando dieta para: ${patientName} (${targetCalories} kcal)`);

    if (!patientName || !targetCalories) {
        return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    // 1. PROMPT MINIFICADO (Actualizado para 5 comidas)
    const prompt = `Eres un nutricionista experto. Genera un menú semanal completo en JSON MINIFICADO.

PACIENTE: ${patientName}
META: ${targetCalories} kcal/día
MACROS: P:${proteinGoal}g | C:${carbsGoal}g | G:${fatGoal}g
RESTRICCIONES: ${restrictions || 'Ninguna'}

REGLAS OBLIGATORIAS:
1. Calcula macros para llegar a ${targetCalories} kcal (±50).
2. Usa productos ecuatorianos.
3. CRÍTICO: Usa SOLO las claves cortas para ahorrar espacio.
4. OBLIGATORIO: Debes llenar las 5 COMIDAS diarias: desayuno, media_manana, almuerzo, snack (media tarde) y cena. NO dejes arrays vacíos.

LEYENDA CLAVES:
- "n": Nombre receta
- "t": Tiempo
- "i": Ingredientes (Array)
- "a": Alimento
- "g": Gramos
- "k": Kcal
- "p": Proteína
- "c": Carbohidratos
- "f": Grasas
- "ins": Instrucciones
- "tip": Tip

ESTRUCTURA EXACTA (Minificada y Completa):
{
  "lunes": {
    "desayuno": [{ "n": "Bolón", "t": "20m", "i": [{"a": "Verde", "g": 100, "k": 120, "p": 1, "c": 30, "f": 0.5}], "ins": ["Cocinar"], "tip": "Caliente" }],
    "media_manana": [{ "n": "Fruta", "t": "5m", "i": [{"a": "Manzana", "g": 150, "k": 80, "p": 0, "c": 20, "f": 0}], "ins": ["Lavar"], "tip": "Con cáscara" }],
    "almuerzo": [{ "n": "Locro", "t": "30m", "i": [{"a": "Papa", "g": 200, "k": 150, "p": 4, "c": 35, "f": 0}], "ins": ["Hervir"], "tip": "Con aguacate" }],
    "snack": [{ "n": "Yogur", "t": "1m", "i": [{"a": "Yogur", "g": 200, "k": 120, "p": 8, "c": 15, "f": 3}], "ins": ["Servir"], "tip": "Natural" }],
    "cena": [{ "n": "Pollo", "t": "20m", "i": [{"a": "Pollo", "g": 150, "k": 160, "p": 30, "c": 0, "f": 5}], "ins": ["Asar"], "tip": "Ligero" }]
  },
  "martes": {}, "miercoles": {}, "jueves": {}, "viernes": {}, "sabado": {}, "domingo": {}
}
Devuelve SOLO JSON minificado.`;

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`🤖 [${requestId}] Intento ${attempt}/${MAX_RETRIES}...`);
            const { text } = await callGemini({ prompt, requestId });

            const jsonText = extractJsonFromText(text);
            if (!jsonText) throw new Error("No se extrajo JSON");

            // 2. PARSEO DEL JSON MINIFICADO
            let minifiedMenu;
            try {
                minifiedMenu = JSON.parse(jsonText);
            } catch (e) {
                console.error(`🔴 JSON Error:`, e.message);
                throw new Error("JSON inválido recibido de IA");
            }

            // 3. 🔥 EXPANSIÓN MÁGICA (Convertimos n->recetaNombre AQUÍ)
            // Esto soluciona tu problema de validación
            const fullMenu = expandirMenuBackend(minifiedMenu);

            // 4. VALIDACIÓN (Ahora sí pasa porque fullMenu tiene "recetaNombre")
            if (!validateAiMenuShape(fullMenu)) {
                console.error("Estructura inválida después de expandir");
                throw new Error("Estructura de menú incorrecta");
            }

            console.log(`✅ [${requestId}] Menú generado y expandido correctamente`);

            // 5. ESCALADO (Funciona perfecto con fullMenu)
            const { scaledMenu, scaledTotals } = autoScalePortions(fullMenu, targetCalories);

            return res.json({
                ok: true,
                requestId,
                menu: scaledMenu, // Enviamos el menú COMPLETO al frontend
                totals: scaledTotals,
            });

        } catch (err) {
            lastError = err;
            console.error(`🔴 [${requestId}] Error:`, err.message);
            if (attempt < MAX_RETRIES) await sleep(2000);
        }
    }

    return res.status(500).json({
        ok: false,
        message: "No se pudo generar el menú. Intenta de nuevo.",
        error: lastError?.message
    });
};

exports.validateGeminiConfig = async (req, res) => {
    try {
        await callGemini({ prompt: "Hola", requestId: "test" });
        res.json({ ok: true, message: "Gemini Configurado" });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};