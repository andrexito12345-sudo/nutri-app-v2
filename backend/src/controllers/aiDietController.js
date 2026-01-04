// backend/src/controllers/aiDietController.js
// ============================================
// VERSIÓN STREAMING: EVITA TIMEOUTS EN RENDER
// ============================================

const fetch = require("node-fetch");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;
// Usamos gemini-1.5-flash por velocidad y estabilidad
const GEMINI_MODEL = "gemini-2.5-pro";

function extractJsonFromText(text) {
    if (!text) return null;
    let t = text.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
    // Limpieza extra por si quedan comillas sueltas al inicio/final
    t = t.replace(/^`+|`+$/g, "");

    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;
    return t.substring(firstBrace, lastBrace + 1);
}

// Función para expandir claves cortas
function expandirMenuBackend(menuMinificado) {
    const menuCompleto = {};
    try {
        const primerDia = Object.values(menuMinificado)[0];
        if (primerDia && Object.values(primerDia)[0]?.[0]?.recetaNombre) return menuMinificado;
    } catch (e) {}

    Object.keys(menuMinificado).forEach(dia => {
        menuCompleto[dia] = {};
        Object.keys(menuMinificado[dia]).forEach(tipoComida => {
            const comidas = Array.isArray(menuMinificado[dia][tipoComida]) ? menuMinificado[dia][tipoComida] : [];
            menuCompleto[dia][tipoComida] = comidas.map(receta => ({
                recetaNombre: receta.n || "Receta",
                tiempoPrep: receta.t || "15m",
                ingredientes: (receta.i || []).map(ing => ({
                    alimento: ing.a || "Ingrediente",
                    grams: Number(ing.g) || 0,
                    kcal: Number(ing.k) || 0,
                    proteina: Number(ing.p) || 0,
                    carbohidratos: Number(ing.c) || 0,
                    grasas: Number(ing.f) || 0
                })),
                instrucciones: receta.ins || [],
                tips: receta.tip || ""
            }));
        });
    });
    return menuCompleto;
}

function autoScalePortions(menu, targetCalories) {
    const scaledMenu = JSON.parse(JSON.stringify(menu));
    const totals = {};

    for (const day of Object.keys(menu)) {
        let dayKcal = 0;
        Object.values(menu[day]).forEach(comidas => {
            comidas.forEach(r => r.ingredientes.forEach(i => dayKcal += Number(i.kcal) || 0));
        });

        const scaleFactor = dayKcal > 0 ? targetCalories / dayKcal : 1.0;

        if (dayKcal > 0 && Math.abs(scaleFactor - 1.0) > 0.1) {
            Object.values(scaledMenu[day]).forEach(comidas => {
                comidas.forEach(r => {
                    r.ingredientes.forEach(ing => {
                        ing.grams = Math.round(ing.grams * scaleFactor);
                        ing.kcal = Number((ing.kcal * scaleFactor).toFixed(1));
                        ing.proteina = Number((ing.proteina * scaleFactor).toFixed(1));
                        ing.carbohidratos = Number((ing.carbohidratos * scaleFactor).toFixed(1));
                        ing.grasas = Number((ing.grasas * scaleFactor).toFixed(1));
                    });
                });
            });
        }

        totals[day] = { kcal: 0, proteina: 0, carbohidratos: 0, grasas: 0 };
        Object.values(scaledMenu[day]).forEach(comidas => {
            comidas.forEach(r => r.ingredientes.forEach(i => {
                totals[day].kcal += i.kcal;
                totals[day].proteina += i.proteina;
                totals[day].carbohidratos += i.carbohidratos;
                totals[day].grasas += i.grasas;
            }));
        });
        totals[day].kcal = Math.round(totals[day].kcal);
        totals[day].proteina = Number(totals[day].proteina.toFixed(1));
        totals[day].carbohidratos = Number(totals[day].carbohidratos.toFixed(1));
        totals[day].grasas = Number(totals[day].grasas.toFixed(1));
    }
    return { scaledMenu, scaledTotals: totals };
}

async function callGemini(prompt) {
    // Usamos el endpoint normal pero aumentamos el timeout del fetch
    // Y pedimos JSON nativo si el modelo lo soporta (1.5 flash lo soporta)
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    // Configuración de controlador de aborto con tiempo extendido (3 minutos)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.5, // Más bajo = más estable y rápido
                    maxOutputTokens: 8192,
                    // response_mime_type: "application/json" // Ojo: V1 a veces falla con esto, mejor lo quitamos y confiamos en el prompt
                }
            })
        });

        clearTimeout(timeout); // Limpiamos el timeout si responde antes

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Gemini API Error ${response.status}: ${txt}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Verificación de seguridad
        if (!text && data.candidates?.[0]?.finishReason) {
            throw new Error(`Gemini terminó con razón: ${data.candidates[0].finishReason}`);
        }

        return text;

    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error("Timeout: La IA tardó demasiado en responder (más de 3 min).");
        }
        throw error;
    }
}

exports.generateWeeklyDiet = async (req, res) => {
    const { patientName, targetCalories, restrictions, proteinGoal, carbsGoal, fatGoal } = req.body || {};

    if (!patientName || !targetCalories) return res.status(400).json({ message: "Faltan datos" });

    // PROMPT OPTIMIZADO: Pedimos JSON explícito desde el inicio
    const prompt = `
    Eres un API generador de dietas. Tu única salida es JSON.
    Genera dieta semanal para ${patientName}. Meta: ${targetCalories} kcal.
    Macros: P ${proteinGoal}g, C ${carbsGoal}g, G ${fatGoal}g.
    Restricciones: ${restrictions || "Ninguna"}.

    REGLAS:
    1. Responde SOLO JSON válido minificado. Sin markdown.
    2. Usa claves de 1 letra para reducir tamaño: n=nombre, t=tiempo, i=ingredientes, a=alimento, g=gramos, k=kcal, p=prot, c=carb, f=grasa, ins=instrucciones, tip=tip.
    3. Llena las 5 comidas (desayuno, media_manana, almuerzo, snack, cena) de Lunes a Domingo.
    4. Instrucciones: MAXIMO 3 PASOS.

    Ejemplo salida:
    {"lunes":{"desayuno":[{"n":"A","t":"5m","i":[{"a":"B","g":1,"k":1,"p":1,"c":1,"f":1}],"ins":["C"],"tip":"D"}],"media_manana":[],"almuerzo":[],"snack":[],"cena":[]},"martes":{}}
    `;

    try {
        console.log(`🔵 [Render] Generando dieta para ${patientName}...`);

        const text = await callGemini(prompt);

        // Logs de depuración mejorados
        console.log(`📡 Respuesta recibida. Longitud: ${text.length} caracteres.`);
        if (text.length < 100) {
            console.error("❌ Respuesta sospechosamente corta:", text);
        }

        const jsonText = extractJsonFromText(text);

        if (!jsonText) {
            throw new Error("La respuesta no contiene JSON válido.");
        }

        let minifiedMenu;
        try {
            minifiedMenu = JSON.parse(jsonText);
        } catch (e) {
            // Intento desesperado de arreglar JSON cortado (si faltan llaves al final)
            console.warn("⚠️ JSON inválido, intentando reparar cierre...");
            try {
                // Si se cortó, probablemente falten llaves de cierre
                const repairedText = jsonText + "}}}";
                minifiedMenu = JSON.parse(repairedText);
            } catch (e2) {
                console.error(`🔴 Fallo total parsing JSON:`, e.message);
                throw new Error("JSON cortado o inválido incluso tras intento de reparación.");
            }
        }

        const fullMenu = expandirMenuBackend(minifiedMenu);
        const { scaledMenu, scaledTotals } = autoScalePortions(fullMenu, targetCalories);

        res.json({ ok: true, menu: scaledMenu, totals: scaledTotals });

    } catch (error) {
        console.error("🔴 Error FINAL:", error.message);
        res.status(500).json({
            ok: false,
            message: "Error al generar el menú. " + error.message
        });
    }
};

exports.validateGeminiConfig = async (req, res) => {
    res.json({ ok: true, message: "Endpoint activo" });
};