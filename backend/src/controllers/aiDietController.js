// backend/src/controllers/aiDietController.js
// ============================================
// VERSIÓN BLINDADA: SAFETY SETTINGS + LOGS DE ERROR
// ============================================

const fetch = require("node-fetch");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;
// Usamos gemini-1.5-flash por ser el más estable para respuestas largas en V1
const GEMINI_MODEL = "gemini-2.5-pro";
const GEMINI_TIMEOUT_MS = 120000; // 2 minutos

function extractJsonFromText(text) {
    if (!text) return null;
    // Limpieza agresiva de bloques de código markdown ```json ... ```
    let t = text.trim();
    // Eliminar marcadores de markdown si existen
    t = t.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");

    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) return null;

    return t.substring(firstBrace, lastBrace + 1);
}

// Función para expandir claves cortas (IA) a largas (Frontend)
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
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            // 🔥 SAFETY SETTINGS: Permite que la IA escriba recetas sin censura accidental
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
            }
        })
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${txt}`);
    }

    const data = await response.json();
    // Validamos que haya respuesta
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Gemini no devolvió candidatos (Respuesta vacía)");
    }

    // Validamos si se detuvo por seguridad
    if (data.candidates[0].finishReason === "SAFETY") {
        throw new Error("Gemini bloqueó la respuesta por seguridad (Safety Filter)");
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

exports.generateWeeklyDiet = async (req, res) => {
    const { patientName, targetCalories, restrictions, proteinGoal, carbsGoal, fatGoal } = req.body || {};

    if (!patientName || !targetCalories) return res.status(400).json({ message: "Faltan datos" });

    // Prompt super estricto para evitar markdown
    const prompt = `Actúa como API JSON. Genera dieta semanal para ${patientName}. Meta: ${targetCalories} kcal.
Macros: P ${proteinGoal}g, C ${carbsGoal}g, G ${fatGoal}g.
Restricciones: ${restrictions || "Ninguna"}.

FORMATO OBLIGATORIO:
Responde ÚNICAMENTE con un JSON válido minificado.
NO uses bloques de código \`\`\`. NO uses la palabra 'json'.
Empieza directamente con '{' y termina con '}'.

ESTRUCTURA Y CLAVES (Minificadas para ahorrar espacio):
Use claves de 1 letra:
- "n": nombre plato
- "t": tiempo (string)
- "i": ingredientes [array]
- "a": alimento
- "g": gramos (numero)
- "k": kcal (numero)
- "p": proteina (numero)
- "c": carbo (numero)
- "f": grasa (numero)
- "ins": instrucciones [array strings cortos]
- "tip": tip (string corto)

REGLAS:
1. Llena Lunes a Domingo.
2. Llena las 5 comidas (desayuno, media_manana, almuerzo, snack, cena).
3. Instrucciones MUY BREVES (max 3 palabras por paso).

Ejemplo:
{"lunes":{"desayuno":[{"n":"Pan","t":"5m","i":[{"a":"Pan","g":30,"k":80,"p":2,"c":15,"f":1}],"ins":["Tostar"],"tip":"Integral"}],"media_manana":[],"almuerzo":[],"snack":[],"cena":[]},"martes":{}}
`;

    try {
        console.log(`🔵 [Render] Generando dieta para ${patientName}...`);

        const text = await callGemini(prompt);

        // Log para depuración en Render (veremos los primeros y últimos caracteres)
        console.log(`📡 Respuesta recibida (longitud: ${text.length}). Inicio: ${text.substring(0, 50)}... Fin: ...${text.substring(text.length - 50)}`);

        const jsonText = extractJsonFromText(text);

        if (!jsonText) {
            console.error("❌ Texto recibido completo:", text); // Veremos todo el texto si falla
            throw new Error("No se pudo encontrar un JSON válido en la respuesta de la IA");
        }

        let minifiedMenu;
        try {
            minifiedMenu = JSON.parse(jsonText);
        } catch (e) {
            console.error(`🔴 Error de parsing JSON en posición ${e.message}`);
            // Si falla, intentamos ver si se cortó al final y lo cerramos a la fuerza (Hack de emergencia)
            throw new Error(`JSON inválido o incompleto: ${e.message}`);
        }

        const fullMenu = expandirMenuBackend(minifiedMenu);
        const { scaledMenu, scaledTotals } = autoScalePortions(fullMenu, targetCalories);

        res.json({ ok: true, menu: scaledMenu, totals: scaledTotals });

    } catch (error) {
        console.error("🔴 Error FINAL generando dieta:", error.message);
        res.status(500).json({
            ok: false,
            message: "Error al generar el menú.",
            error: error.message,
            details: "Revisa los logs del servidor para ver la respuesta cruda."
        });
    }
};

exports.validateGeminiConfig = async (req, res) => {
    res.json({ ok: true, message: "Endpoint activo" });
};