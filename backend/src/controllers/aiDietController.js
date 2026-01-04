// backend/src/controllers/aiDietController.js
// ============================================
// VERSIÓN OPTIMIZADA: ALIMENTOS ECUATORIANOS
// ============================================

const fetch = require("node-fetch");

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash-exp"; // Modelo más reciente y estable

function extractJsonFromText(text) {
    if (!text) return null;
    let t = text.trim();

    // Remover markdown
    t = t.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    t = t.replace(/^`+|`+$/g, "");

    // Buscar el JSON completo
    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) return null;

    return t.substring(firstBrace, lastBrace + 1);
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 minutos

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 16384, // Aumentado para respuestas largas
                    responseMimeType: "application/json" // Forzar JSON nativo
                }
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Gemini API Error ${response.status}: ${txt}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text && data.candidates?.[0]?.finishReason) {
            throw new Error(`Gemini terminó con razón: ${data.candidates[0].finishReason}`);
        }

        return text;

    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error("Timeout: La IA tardó demasiado en responder.");
        }
        throw error;
    }
}

exports.generateWeeklyDiet = async (req, res) => {
    const {
        patientName,
        targetCalories,
        restrictions,
        proteinGoal,
        carbsGoal,
        fatGoal
    } = req.body || {};

    if (!patientName || !targetCalories) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // PROMPT OPTIMIZADO PARA ALIMENTOS ECUATORIANOS
    const prompt = `Eres un nutricionista especializado en gastronomía ecuatoriana. 

TAREA: Generar plan alimenticio semanal completo (7 días) usando EXCLUSIVAMENTE alimentos típicos de Ecuador.

DATOS DEL PACIENTE:
- Nombre: ${patientName}
- Calorías diarias: ${targetCalories} kcal
- Proteína objetivo: ${proteinGoal}g
- Carbohidratos objetivo: ${carbsGoal}g
- Grasas objetivo: ${fatGoal}g
- Restricciones: ${restrictions || "Ninguna"}

ALIMENTOS ECUATORIANOS PERMITIDOS:
Proteínas: pollo, pescado (corvina, tilapia, atún), carne de res, huevos, queso fresco
Carbohidratos: arroz, verde (plátano verde), maduro, yuca, papa, choclo, quinoa, avena
Vegetales: tomate, cebolla, pimiento, lechuga, col, zanahoria, brócoli
Frutas: naranja, papaya, sandía, piña, guineo, manzana, melón
Legumbres: lenteja, frijol, garbanzo
Grasas: aguacate, aceite de oliva, maní
Lácteos: leche, yogur natural, queso fresco
Otros: café, pan integral, agua de panela (moderado)

ESTRUCTURA REQUERIDA JSON:
{
  "lunes": {
    "desayuno": [
      {
        "recetaNombre": "Nombre de la receta",
        "tiempoPrep": "15 min",
        "ingredientes": [
          {
            "alimento": "Huevo",
            "grams": 120,
            "kcal": 150,
            "proteina": 12,
            "carbohidratos": 2,
            "grasas": 10
          }
        ],
        "instrucciones": [
          "Paso 1",
          "Paso 2",
          "Paso 3"
        ],
        "tips": "Consejo nutricional"
      }
    ],
    "media_manana": [...],
    "almuerzo": [...],
    "snack": [...],
    "cena": [...]
  },
  "martes": { ... },
  ...
  "domingo": { ... }
}

REGLAS ESTRICTAS:
1. Responde SOLO con JSON válido, sin texto adicional
2. Cada día debe tener las 5 comidas: desayuno, media_manana, almuerzo, snack, cena
3. Cada comida debe tener 1-2 recetas
4. Instrucciones: máximo 4 pasos por receta
5. Tips: 1 frase corta y práctica
6. Macronutrientes deben ser EXACTOS y calculados correctamente
7. Variedad: no repetir recetas exactas en la semana
8. Porciones realistas y saludables
9. SOLO alimentos ecuatorianos

Genera el plan completo de 7 días ahora:`;

    try {
        console.log(`🔵 [Render] Generando dieta ecuatoriana para ${patientName}...`);
        console.log(`📊 Target: ${targetCalories} kcal | P:${proteinGoal}g C:${carbsGoal}g F:${fatGoal}g`);

        const text = await callGemini(prompt);

        console.log(`📡 Respuesta recibida. Longitud: ${text.length} caracteres.`);

        if (text.length < 500) {
            console.error("⚠️ Respuesta sospechosamente corta:", text);
            throw new Error("Respuesta incompleta de la IA");
        }

        const jsonText = extractJsonFromText(text);

        if (!jsonText) {
            console.error("❌ No se encontró JSON en la respuesta:", text.substring(0, 200));
            throw new Error("La respuesta no contiene JSON válido.");
        }

        let menuData;
        try {
            menuData = JSON.parse(jsonText);
        } catch (e) {
            console.error(`🔴 Error parsing JSON:`, e.message);
            console.error("JSON problemático:", jsonText.substring(0, 500));
            throw new Error("JSON inválido generado por la IA");
        }

        // Validar estructura
        const requiredDays = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        const missingDays = requiredDays.filter(day => !menuData[day]);

        if (missingDays.length > 0) {
            console.warn(`⚠️ Días faltantes: ${missingDays.join(", ")}`);
        }

        const { scaledMenu, scaledTotals } = autoScalePortions(menuData, targetCalories);

        console.log("✅ Dieta generada exitosamente");

        res.json({
            ok: true,
            menu: scaledMenu,
            totals: scaledTotals,
            metadata: {
                generatedAt: new Date().toISOString(),
                patient: patientName,
                targetCalories
            }
        });

    } catch (error) {
        console.error("🔴 Error FINAL:", error.message);
        res.status(500).json({
            ok: false,
            message: "Error al generar el menú: " + error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.validateGeminiConfig = async (req, res) => {
    res.json({
        ok: true,
        message: "Endpoint activo",
        model: GEMINI_MODEL,
        configured: !!API_KEY
    });
};