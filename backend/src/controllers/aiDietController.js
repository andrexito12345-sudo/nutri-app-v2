// backend/src/controllers/aiDietController.js
// ============================================
// VERSIÓN STREAMING (SOLUCIÓN PARA RENDER)
// Usa streamGenerateContent para evitar timeouts
// ============================================

const fetch = require("node-fetch");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;
// Usamos el modelo 2.5 que es más rápido y eficiente en V1
const GEMINI_MODEL = "gemini-2.5-flash";

// Helper para limpiar el JSON sucio que a veces llega
function extractJsonFromText(text) {
    if (!text) return null;
    let t = text.trim();
    // Quitar bloques de markdown
    t = t.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");

    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) return null;

    return t.substring(firstBrace, lastBrace + 1);
}

// Expansor de claves (n -> recetaNombre)
function expandirMenuBackend(menuMinificado) {
    const menuCompleto = {};
    try {
        const primerDia = Object.values(menuMinificado)[0];
        // Si ya tiene el formato largo, no hacer nada
        if (primerDia && Object.values(primerDia)[0]?.[0]?.recetaNombre) return menuMinificado;
    } catch (e) {}

    Object.keys(menuMinificado).forEach(dia => {
        menuCompleto[dia] = {};
        Object.keys(menuMinificado[dia]).forEach(tipoComida => {
            const comidas = Array.isArray(menuMinificado[dia][tipoComida]) ? menuMinificado[dia][tipoComida] : [];
            menuCompleto[dia][tipoComida] = comidas.map(receta => ({
                recetaNombre: receta.n || "Receta sin nombre",
                tiempoPrep: receta.t || "15 min",
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

// Re-escalado de calorías
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

// 🔥 NUEVA FUNCIÓN: STREAMING
// Esto evita que Render corte la conexión porque recibe datos byte a byte
async function callGeminiStream(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:streamGenerateContent?key=${API_KEY}`;

    console.log(`📡 Iniciando stream con ${GEMINI_MODEL}...`);

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
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

    // Leemos el stream y ensamblamos el texto completo
    const reader = response.body; // Node-fetch stream
    let fullText = "";

    // Node-fetch devuelve un stream que podemos iterar
    for await (const chunk of reader) {
        const chunkString = chunk.toString();
        // El stream de Gemini viene en formato JSON array [...]
        // Tenemos que parsear cada chunk, pero como es texto crudo,
        // simplemente lo acumulamos y limpiaremos al final.
        // OJO: El stream de Google manda objetos JSON parciales.

        // Estrategia simple: Acumular todo el texto crudo y luego buscar el texto real
        // Es un poco sucio pero funciona para ensamblar.
        fullText += chunkString;
    }

    // Ahora `fullText` contiene un montón de objetos JSON pegados tipo:
    // [{ "text": "Hola" }, { "text": " mun" }, { "text": "do" }]
    // Necesitamos extraer solo el campo "text" de cada candidato.

    // Parseo manual del stream de Google (que es un array de objetos)
    // El stream de Google devuelve algo como:
    // [
    //   { "candidates": [ { "content": { "parts": [ { "text": "..." } ] } } ] },
    //   ...
    // ]

    let finalText = "";
    try {
        // Truco: El stream es básicamente un array JSON válido si lo juntamos todo
        const jsonObjects = JSON.parse(fullText);

        if (Array.isArray(jsonObjects)) {
            jsonObjects.forEach(chunk => {
                if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
                    finalText += chunk.candidates[0].content.parts[0].text;
                }
            });
        }
    } catch (e) {
        console.error("Error parseando stream, intentando regex fallback...");
        // Fallback: Buscar con Regex si el JSON parse falla
        const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
        let match;
        while ((match = regex.exec(fullText)) !== null) {
            // Descapar saltos de línea codificados
            finalText += match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        }
    }

    return finalText;
}

exports.generateWeeklyDiet = async (req, res) => {
    const { patientName, targetCalories, restrictions, proteinGoal, carbsGoal, fatGoal } = req.body || {};

    if (!patientName || !targetCalories) return res.status(400).json({ message: "Faltan datos" });

    const prompt = `Genera un menú semanal JSON para ${patientName}. Meta: ${targetCalories} kcal.
Macros: P ${proteinGoal}g, C ${carbsGoal}g, G ${fatGoal}g.
Restricciones: ${restrictions || "Ninguna"}.

FORMATO OBLIGATORIO:
Responde ÚNICAMENTE con un JSON válido minificado.
NO uses bloques de código. Empieza con '{'.

CLAVES (Minificadas):
n=nombre, t=tiempo, i=ingredientes, a=alimento, g=gramos, k=kcal, p=prot, c=carb, f=grasa, ins=instrucciones, tip=tip.

REGLAS:
1. Llena Lunes a Domingo.
2. Llena 5 comidas diarias.
3. Instrucciones: MAXIMO 2 PASOS CORTOS.

Ejemplo:
{"lunes":{"desayuno":[{"n":"A","t":"5m","i":[{"a":"B","g":1,"k":1,"p":1,"c":1,"f":1}],"ins":["C"],"tip":"D"}],"media_manana":[],"almuerzo":[],"snack":[],"cena":[]},"martes":{}}
`;

    try {
        console.log(`🔵 [Render] Generando dieta (STREAM) para ${patientName}...`);

        // USAMOS LA NUEVA FUNCIÓN DE STREAM
        const text = await callGeminiStream(prompt);

        console.log(`📡 Texto final ensamblado (${text.length} chars).`);

        if (text.length < 500) {
            console.error("❌ Respuesta demasiado corta:", text);
            throw new Error("La IA respondió muy poco texto. Posible bloqueo de seguridad.");
        }

        const jsonText = extractJsonFromText(text);
        if (!jsonText) throw new Error("No se encontró JSON válido en la respuesta.");

        let minifiedMenu;
        try {
            minifiedMenu = JSON.parse(jsonText);
        } catch (e) {
            console.error(`🔴 JSON Roto:`, e.message);
            // Intento de auto-reparación simple (cerrar llaves)
            try {
                minifiedMenu = JSON.parse(jsonText + "}}}");
                console.log("✅ JSON reparado automáticamente.");
            } catch (e2) {
                throw new Error("El JSON se cortó y no se pudo reparar.");
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