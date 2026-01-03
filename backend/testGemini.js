// backend/listGeminiModels.js
// Script para listar TODOS los modelos disponibles

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBf-fNEsQqk1elkoRHFGmd02adQb4vZ1i8";

console.log("🔑 API Key:", API_KEY);
console.log("\n📋 Listando TODOS los modelos disponibles en Gemini...\n");

async function listModels() {
    try {
        // Listar modelos disponibles en v1
        console.log("🔵 Consultando API v1...");
        const responseV1 = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
        );

        if (responseV1.ok) {
            const dataV1 = await responseV1.json();
            console.log("\n✅ MODELOS DISPONIBLES EN V1:");

            if (dataV1.models && dataV1.models.length > 0) {
                dataV1.models.forEach(model => {
                    console.log(`\n📦 ${model.name}`);
                    console.log(`   Soporta: ${model.supportedGenerationMethods?.join(', ')}`);
                    console.log(`   Descripción: ${model.displayName}`);
                });
            } else {
                console.log("❌ No hay modelos disponibles en v1");
            }
        } else {
            console.error("❌ Error al consultar v1:", await responseV1.text());
        }

        // Listar modelos disponibles en v1beta
        console.log("\n🔵 Consultando API v1beta...");
        const responseV1Beta = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        if (responseV1Beta.ok) {
            const dataV1Beta = await responseV1Beta.json();
            console.log("\n✅ MODELOS DISPONIBLES EN V1BETA:");

            if (dataV1Beta.models && dataV1Beta.models.length > 0) {
                dataV1Beta.models.forEach(model => {
                    console.log(`\n📦 ${model.name}`);
                    console.log(`   Soporta: ${model.supportedGenerationMethods?.join(', ')}`);
                    console.log(`   Descripción: ${model.displayName}`);
                });

                // Buscar modelos que soporten generateContent
                console.log("\n\n🎯 MODELOS QUE SOPORTAN 'generateContent':");
                const validModels = dataV1Beta.models.filter(m =>
                    m.supportedGenerationMethods?.includes('generateContent')
                );

                if (validModels.length > 0) {
                    validModels.forEach(model => {
                        console.log(`✅ ${model.name}`);
                    });

                    console.log("\n\n📝 USA UNO DE ESTOS MODELOS EN TU CÓDIGO:");
                    console.log(`Ejemplo: "${validModels[0].name.replace('models/', '')}"`);
                } else {
                    console.log("❌ Ningún modelo soporta generateContent");
                }

            } else {
                console.log("❌ No hay modelos disponibles en v1beta");
            }
        } else {
            console.error("❌ Error al consultar v1beta:", await responseV1Beta.text());
        }

    } catch (error) {
        console.error("💥 Error general:", error.message);
    }
}

listModels();