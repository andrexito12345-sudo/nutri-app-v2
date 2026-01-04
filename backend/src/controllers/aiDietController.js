// backend/src/controllers/aiDietController.js
// ============================================
// VERSIÓN FINAL: API V1 + GEMINI 2.5 FLASH + SIN ERRORES 400
// ============================================

const fetch = require("node-fetch");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;

// ✅ USAMOS EL MODELO QUE CONFIRMASTE QUE TIENES EN V1
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 120000; // 2 minutos

function extractJsonFromText(text) {
    if (!text) return null;
    // Limpieza agresiva para encontrar el JSON entre el texto
    let t = text.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;
    return t.substring(firstBrace, lastBrace + 1);
}

// Función para asegurar que las claves cortas (n, i, t) se conviertan en largas (recetaNombre...)
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

// Ajuste automático de porciones si la IA no le atina a las calorías exactas
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
    // ✅ URL CORREGIDA A V1 (NO BETA)
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192, // Mantenemos tokens altos para que no se corte
                // ❌ ELIMINADO responseMimeType PORQUE V1 NO LO SOPORTA
            }
        })
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${txt}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

exports.generateWeeklyDiet = async (req, res) => {
    const { patientName, targetCalories, restrictions, proteinGoal, carbsGoal, fatGoal } = req.body || {};

    if (!patientName || !targetCalories) return res.status(400).json({ message: "Faltan datos" });

    // Prompt estricto para asegurar que la IA devuelva JSON aunque no usemos responseMimeType
    const prompt = `Genera un menú semanal JSON para ${patientName}. Meta: ${targetCalories} kcal.
Macros: P ${proteinGoal}g, C ${carbsGoal}g, G ${fatGoal}g.
Restricciones: ${restrictions || "Ninguna"}.

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. No uses Markdown. No pongas texto antes ni después.

REGLAS DE FORMATO (JSON MINIFICADO):
1. Usa claves de una letra: n=nombre, t=tiempo, i=ingredientes, a=alimento, g=gramos, k=kcal, p=prot, c=carb, f=grasa, ins=instrucciones, tip=tip.
2. Instrucciones: MAXIMO 2 PASOS CORTOS. Ej: "Mezclar. Cocinar".
3. Tips: MAXIMO 4 palabras.
4. OBLIGATORIO: Llena las 5 comidas (desayuno, media_manana, almuerzo, snack, cena) para los 7 días.

Ejemplo estructura:
{
  "lunes": {
    "desayuno": [{ "n": "Avena", "t": "10m", "i": [{"a": "Avena", "g": 50, "k": 180, "p": 6, "c": 30, "f": 3}], "ins": ["Hervir agua", "Mezclar"], "tip": "Con canela" }],
    "media_manana": [], "almuerzo": [], "snack": [], "cena": []
  },
  "martes": {} ...
}
`;

    try {
        console.log(`🔵 Generando dieta para ${patientName} con ${GEMINI_MODEL} (API v1)...`);

        const text = await callGemini(prompt);
        const jsonText = extractJsonFromText(text);

        if (!jsonText) throw new Error("La IA no devolvió un JSON válido. Intenta de nuevo.");

        const minifiedMenu = JSON.parse(jsonText);
        const fullMenu = expandirMenuBackend(minifiedMenu);
        const { scaledMenu, scaledTotals } = autoScalePortions(fullMenu, targetCalories);

        res.json({ ok: true, menu: scaledMenu, totals: scaledTotals });

    } catch (error) {
        console.error("🔴 Error generando dieta:", error.message);
        res.status(500).json({
            ok: false,
            message: "Error al generar el menú. Intenta de nuevo.",
            error: error.message
        });
    }
};

exports.validateGeminiConfig = async (req, res) => {
    res.json({ ok: true, message: "Endpoint activo" });
};