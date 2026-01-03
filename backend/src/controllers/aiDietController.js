// backend/src/controllers/aiDietController.js
// ============================================
// Controlador de dietas con Gemini (FETCH DIRECTO)
// ============================================

const fetch = require('node-fetch');

// ✅ USAR VARIABLE DE ENTORNO
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY no está configurada');
    throw new Error('GEMINI_API_KEY no configurada');
}

exports.generateWeeklyDiet = async (req, res) => {
    const {
        patientName,
        targetCalories,
        restrictions,
        preferences,
        proteinGoal,
        carbsGoal,
        fatGoal
    } = req.body;

    console.log("🔵 Generando dieta con Gemini 2.5 Flash (FETCH DIRECTO)...");
    console.log("📊 Parámetros:", { patientName, targetCalories, restrictions });

    try {
        // Prompt mejorado
        const prompt = `
Eres una nutricionista experta ecuatoriana. Crea un menú semanal personalizado con las siguientes especificaciones:

**PACIENTE:** ${patientName}
**CALORÍAS DIARIAS:** ${targetCalories} kcal
**DISTRIBUCIÓN DE MACRONUTRIENTES:**
- Proteína: ${proteinGoal || 'No especificada'}g
- Carbohidratos: ${carbsGoal || 'No especificado'}g
- Grasas: ${fatGoal || 'No especificado'}g

**RESTRICCIONES:** ${restrictions || 'Ninguna'}
**PREFERENCIAS:** ${preferences || 'Ninguna'}

**IMPORTANTE:**
1. Usa SOLO alimentos ecuatorianos típicos (guineo, plátano, yuca, choclo, quinoa, pescado del pacífico, pollo criollo, etc.)
2. Incluye 5 comidas diarias: Desayuno, Media Mañana, Almuerzo, Snack, Cena
3. Cada comida debe tener su valor calórico aproximado
4. Responde ÚNICAMENTE con un JSON válido (sin markdown, sin comentarios)

**FORMATO JSON REQUERIDO:**
{
  "lunes": {
    "desayuno": { "comida": "Descripción", "calorias": 400 },
    "media_manana": { "comida": "Descripción", "calorias": 150 },
    "almuerzo": { "comida": "Descripción", "calorias": 600 },
    "snack": { "comida": "Descripción", "calorias": 150 },
    "cena": { "comida": "Descripción", "calorias": 500 }
  },
  "martes": { ... },
  "miercoles": { ... },
  "jueves": { ... },
  "viernes": { ... },
  "sabado": { ... },
  "domingo": { ... }
}
        `;

        console.log("🤖 Enviando prompt a Gemini API (fetch directo)...");

        // 🔥 LLAMADA DIRECTA A LA API (sin librería)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        console.log("📡 Status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("🔴 Error de API:", errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        console.log("📝 Respuesta recibida, procesando...");

        // Extraer el texto de la respuesta
        const text = data.candidates[0].content.parts[0].text;

        // Limpieza del texto
        let cleanText = text
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        // Extraer solo el JSON
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            console.error('🔴 No se encontró JSON válido en la respuesta');
            throw new Error('Respuesta de IA no contiene JSON válido');
        }

        cleanText = cleanText.substring(firstBrace, lastBrace + 1);

        // Parsear JSON
        const dietPlan = JSON.parse(cleanText);

        console.log("✅ ÉXITO: Menú semanal generado correctamente");

        res.json({
            ok: true,
            menu: dietPlan,
            metadata: {
                generatedAt: new Date().toISOString(),
                targetCalories,
                patientName,
                model: "gemini-2.5-flash (v1 API)"
            }
        });

    } catch (error) {
        console.error('🔴 Error DETALLADO al generar dieta:', error);

        res.status(500).json({
            ok: false,
            message: 'Error al generar dieta con IA',
            error: error.message
        });
    }
};

// ✅ FUNCIÓN ADICIONAL: Validar configuración
exports.validateGeminiConfig = async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                ok: false,
                message: 'GEMINI_API_KEY no configurada'
            });
        }

        console.log("🧪 Probando Gemini API con fetch directo...");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Responde solo: OK" }]
                    }]
                })
            }
        );

        console.log("📡 Status de prueba:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        res.json({
            ok: true,
            message: 'Gemini configurado correctamente',
            response: text,
            model: "gemini-2.5-flash (v1 API)"
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error de configuración de Gemini',
            error: error.message
        });
    }
};