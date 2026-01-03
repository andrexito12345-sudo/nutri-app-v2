// backend/src/controllers/aiDietController.js
// ============================================
// Gemini (v1) - Fetch directo + 3 reintentos + timeout + parse robusto
// SIN responseMimeType (evita 400 en v1)
// ============================================

const fetch = require("node-fetch");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY no está configurada");
    throw new Error("GEMINI_API_KEY no configurada");
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30000);
const MAX_RETRIES = 3;

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function shouldRetry(status) {
    return status === 429 || (status >= 500 && status <= 599);
}

function extractJsonFromText(text) {
    if (!text || typeof text !== "string") return null;

    let t = text
        .trim()
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

    return t.substring(firstBrace, lastBrace + 1);
}

function normalizeNumber(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

// Soporta payload antiguo (proteinGoal/carbsGoal/fatGoal) y tu payload actual (macros: {p,c,f})
function readMacro(reqBody) {
    const macros = reqBody?.macros || {};
    const protein =
        reqBody?.proteinGoal ?? reqBody?.protein_prescribed ?? macros?.p ?? macros?.protein ?? null;
    const carbs =
        reqBody?.carbsGoal ?? reqBody?.carbs_prescribed ?? macros?.c ?? macros?.carbs ?? null;
    const fats =
        reqBody?.fatGoal ?? reqBody?.fats_prescribed ?? reqBody?.fat_prescribed ?? macros?.f ?? macros?.fats ?? null;

    return {
        proteinGoal: normalizeNumber(protein),
        carbsGoal: normalizeNumber(carbs),
        fatGoal: normalizeNumber(fats),
    };
}

async function callGemini({ prompt, requestId }) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
        GEMINI_MODEL
    )}:generateContent?key=${API_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
                // Importante: NO enviar generation_config / responseMimeType aquí en v1
            }),
        });

        const status = response.status;
        const statusText = response.statusText;

        console.log(`📡 [${requestId}] Status: ${status} ${statusText}`);

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            const err = new Error(`Gemini API Error ${status}: ${errorText}`);
            err.httpStatus = status;
            throw err;
        }

        const data = await response.json();

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        if (!text) {
            const err = new Error("Gemini respondió sin texto (candidates vacío o parts vacío).");
            err.httpStatus = 502;
            throw err;
        }

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

exports.generateWeeklyDiet = async (req, res) => {
    console.log("✅ aiDietController activo:", __filename);

    const requestId = crypto.randomUUID();

    const body = req.body || {};
    const patientName = (body.patientName || "").toString().trim();
    const targetCalories = normalizeNumber(body.targetCalories);

    const { proteinGoal, carbsGoal, fatGoal } = readMacro(body);

    const restrictions = (body.restrictions || "").toString().trim();
    const preferences = (body.preferences || "").toString().trim();

    console.log(`🔵 [${requestId}] Procesando solicitud dieta IA para: ${patientName || "(sin nombre)"}`);

    // Validación mínima
    if (!patientName || !targetCalories) {
        return res.status(400).json({
            ok: false,
            requestId,
            message: "Faltan campos obligatorios: patientName y targetCalories",
        });
    }

    const prompt = `
Actúa como una API. Devuelve SOLO JSON válido (sin markdown, sin texto extra).

Crea un MENÚ SEMANAL (lunes a domingo) con comida típica ecuatoriana saludable.

PACIENTE: ${patientName}
CALORÍAS DIARIAS: ${targetCalories} kcal
MACROS (si aplica):
- Proteína: ${proteinGoal ?? "No especificada"} g
- Carbohidratos: ${carbsGoal ?? "No especificado"} g
- Grasas: ${fatGoal ?? "No especificado"} g

RESTRICCIONES: ${restrictions || "Ninguna"}
PREFERENCIAS: ${preferences || "Ninguna"}

Reglas:
1) Usa platos y alimentos ecuatorianos (guineo, plátano, yuca, choclo, quinoa, pescado, pollo criollo, etc.)
2) 5 comidas: desayuno, media_manana, almuerzo, snack, cena
3) Cada comida debe incluir descripción completa y calorías estimadas
4) Responde EXACTAMENTE con este formato:

{
  "lunes": {
    "desayuno": { "comida": "Descripción", "calorias": 400 },
    "media_manana": { "comida": "Descripción", "calorias": 150 },
    "almuerzo": { "comida": "Descripción", "calorias": 600 },
    "snack": { "comida": "Descripción", "calorias": 150 },
    "cena": { "comida": "Descripción", "calorias": 500 }
  },
  "martes": { "...": "..." },
  "miercoles": { "...": "..." },
  "jueves": { "...": "..." },
  "viernes": { "...": "..." },
  "sabado": { "...": "..." },
  "domingo": { "...": "..." }
}
`.trim();

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`🤖 [${requestId}] Gemini attempt ${attempt}/${MAX_RETRIES} -> ${GEMINI_MODEL}`);

            const { text } = await callGemini({ prompt, requestId });

            const jsonText = extractJsonFromText(text);
            if (!jsonText) {
                throw new Error("La IA respondió pero no se pudo extraer un JSON (no llaves {}).");
            }

            let dietPlan;
            try {
                dietPlan = JSON.parse(jsonText);
            } catch (e) {
                throw new Error(`JSON inválido (parse falló): ${e.message}`);
            }

            console.log(`✅ [${requestId}] ÉXITO: Menú semanal generado correctamente`);

            return res.json({
                ok: true,
                requestId,
                menu: dietPlan,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    targetCalories,
                    patientName,
                    model: `${GEMINI_MODEL} (v1 API)`,
                    attempts: attempt,
                },
            });
        } catch (err) {
            lastError = err;
            const status = err?.httpStatus;

            console.error(`🔴 [${requestId}] Error attempt ${attempt}: ${err.message}`);

            // Si es 400/401/403 normalmente NO conviene reintentar
            if (status && !shouldRetry(status)) break;

            if (attempt < MAX_RETRIES) {
                await sleep(1000 * attempt);
            }
        }
    }

    return res.status(500).json({
        ok: false,
        requestId,
        message: "Error al generar dieta con IA",
        error: lastError?.message || "Error desconocido",
    });
};

// Endpoint para probar rápido
exports.validateGeminiConfig = async (req, res) => {
    const requestId = crypto.randomUUID();

    try {
        const prompt = "Responde solo con: OK";
        const { text } = await callGemini({ prompt, requestId });

        return res.json({
            ok: true,
            requestId,
            message: "Gemini configurado correctamente",
            response: (text || "").trim(),
            model: `${GEMINI_MODEL} (v1 API)`,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            requestId,
            message: "Error de configuración de Gemini",
            error: error?.message || "Error desconocido",
        });
    }
};
