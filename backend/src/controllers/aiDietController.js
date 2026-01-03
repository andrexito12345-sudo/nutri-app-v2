const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateWeeklyDiet = async (req, res) => {
    console.log("🔵 [BACKEND] Procesando solicitud para:", req.body.patientName);

    // MENÚ DE RESPALDO (Por si todo falla)
    const menuRespaldo = {
        lunes: { desayuno: "Bolón de verde", media_manana: "Papaya", almuerzo: "Sancocho", snack: "Yogurt", cena: "Estofado de pollo" },
        martes: { desayuno: "Tigrillo", media_manana: "Humita", almuerzo: "Ceviche", snack: "Batido de mora", cena: "Tortilla de huevo" },
        miercoles: { desayuno: "Mote pillo", media_manana: "Manzana", almuerzo: "Seco de pollo", snack: "Galletas", cena: "Crema de zapallo" },
        jueves: { desayuno: "Encebollado", media_manana: "Pera", almuerzo: "Guatita", snack: "Chochos", cena: "Pollo a la plancha" },
        viernes: { desayuno: "Majado", media_manana: "Piña", almuerzo: "Encocado", snack: "Pan de yuca", cena: "Atún" },
        sabado: { desayuno: "Sandwich", media_manana: "Sandía", almuerzo: "Cazuela", snack: "Gelatina", cena: "Lomo saltado" },
        domingo: { desayuno: "Tamal", media_manana: "Frutillas", almuerzo: "Hornado", snack: "Empanada", cena: "Sopa de quinoa" }
    };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API KEY no configurada");

        const genAI = new GoogleGenerativeAI(apiKey);
        // Usamos Flash porque es el más rápido para tareas simples
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // PROMPT OPTIMIZADO PARA VELOCIDAD
        // Le pedimos que NO sea creativo, solo funcional.
        const prompt = `
            Actúa como API JSON. Genera un menú semanal (lunes-domingo) de comida típica ecuatoriana saludable.
            Paciente: ${req.body.patientName}. Calorías: ${req.body.targetCalories}.
            Formato JSON ESTRICTO (sin markdown, sin intro):
            {
              "lunes": { "desayuno": "plato y cantidad", "media_manana": "...", "almuerzo": "...", "snack": "...", "cena": "..." },
              "martes": ...
            }
        `;

        console.log("📡 Consultando a Gemini...");

        // AUMENTAMOS EL TIMEOUT A 35 SEGUNDOS (Para evitar cortes prematuros)
        const resultPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Tiempo de espera agotado (35s)")), 35000));

        const result = await Promise.race([resultPromise, timeoutPromise]);
        const response = await result.response;

        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        // Limpieza extra por si Gemini añade texto antes o después
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1) text = text.substring(firstBrace, lastBrace + 1);

        const dietPlan = JSON.parse(text);

        console.log("✅ [ÉXITO] Menú generado y enviado.");
        res.json({ ok: true, menu: dietPlan, source: "gemini" });

    } catch (error) {
        console.error("⚠️ [FALLO CONTROLADO]:", error.message);
        // Si falla (por tiempo o error), enviamos respaldo instantáneo para que el usuario no espere en blanco.
        res.json({ ok: true, menu: menuRespaldo, source: "backup_auto" });
    }
};