// backend/whatsappBot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// 👇 IMPORTAMOS LA BASE DE DATOS
const pgPool = require('./src/pgClient');

// Configuramos el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Configuración extra segura
    }
});

// 1. Generar el código QR en la terminal
client.on('qr', (qr) => {
    console.log('\n=================================================');
    console.log('⚡ ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP ⚡');
    console.log('=================================================\n');
    qrcode.generate(qr, { small: true });
});

// 2. Confirmación de conexión
client.on('ready', () => {
    console.log('\n✅ NutriBot está conectado y listo para recibir clientes!\n');
});

// --- FUNCIÓN AUXILIAR: GUARDAR LEAD (BLINDADA) ---
async function saveLead(msg) {
    try {
        let phone = '';
        let name = msg._data.notifyName || 'Usuario WhatsApp';
        const rawId = msg.from;

        // INTENTO 1: La forma correcta (Pedir el contacto)
        try {
            const contact = await msg.getContact();
            if (contact) {
                phone = contact.number; // Número limpio (ej: 59399...)
                name = contact.name || contact.pushname || name;
            }
        } catch (err) {
            console.log('⚠️ Falló getContact(), usando método alternativo...');
        }

        // INTENTO 2: Método de emergencia
        if (!phone) {
            if (rawId.includes('@c.us')) {
                phone = rawId.replace(/\D/g, '');
            } else {
                // Si es un ID encriptado (@lid) y falló, guardamos el ID temporal
                phone = 'LID_' + rawId.replace('@lid', '');
                console.log('⚠️ Lead guardado con ID oculto (LID).');
            }
        }

        // Si logramos sacar algo, lo guardamos
        const payload = JSON.stringify({
            source: 'WhatsApp Bot',
            phone: phone,
            name: name,
            date: new Date().toISOString(),
            interest: 'Inició conversación (Trigger)'
        });

        await pgPool.query(
            `INSERT INTO landing_leads (payload) VALUES ($1)`,
            [payload]
        );

        console.log(`💾 NUEVO LEAD GUARDADO: ${name} (${phone})`);

    } catch (error) {
        console.error('❌ Error fatal al guardar Lead:', error.message);
    }
}

// 3. Lógica de Marketing (EL CEREBRO)
client.on('message', async msg => {
    const chat = await msg.getChat();
    const texto = msg.body.toLowerCase().trim();

    // --- DETECCIÓN DEL "TRIGGER" ---
    if (texto.includes('hola') || texto.includes('info') || texto.includes('quiero agendar')) {
        await saveLead(msg);
        await chat.sendStateTyping();
        setTimeout(async () => {
            await msg.reply(
                `👋 ¡Hola! Bienvenido a *NutriVida Pro*.\n\n` +
                `Soy el asistente virtual de la Dra. Daniela. 🌱\n` +
                `Estoy aquí para ayudarte a lograr tus metas sin dietas restrictivas.\n\n` +
                `*¿En qué puedo ayudarte hoy?* (Responde con el número):\n\n` +
                `1️⃣ Agendar Primera Cita (Gratis)\n` +
                `2️⃣ Calcular mi IMC ahora\n` +
                `3️⃣ Ver Precios y Planes\n` +
                `4️⃣ Hablar con un Humano`
            );
        }, 1500);
    }
    // --- OPCIONES ---
    else if (texto === '1') {
        await msg.reply(`¡Excelente decisión! 📅\n\nPuedes ver los horarios disponibles y reservar tu cita aquí:\n👉 https://nutri-app-frontend.onrender.com/agendar\n\n¡Son cupos limitados!`);
    }
    else if (texto === '2') {
        await msg.reply(`Conocer tu estado actual es el primer paso. ⚖️\n\nUsa nuestra calculadora profesional aquí:\n👉 https://nutri-app-frontend.onrender.com/\n*(Busca la sección de Calculadora)*`);
    }
    else if (texto === '3') {
        await msg.reply(`Nuestros planes son 100% personalizados:\n\n🟢 *Plan Inicial:* $30/mes (Dieta + 1 Control)\n🟣 *Plan Transformación:* $50/mes (Seguimiento WhatsApp 24/7)\n\n¿Te gustaría empezar con el Plan Inicial? Escribe *SI* para ayudarte.`);
    }
    else if (texto === '4') {
        await msg.reply(`Entendido. He notificado a la Dra. Daniela 👩‍⚕️. Te escribirá en cuanto se desocupe de consulta.`);
    }
    else if (texto === 'si' || texto === 'sí') {
        await msg.reply(`¡Perfecto! 🎉 Vamos a cambiar tu vida.\n\nPor favor ingresa al link de agendar y selecciona "Plan Inicial". ¡Te esperamos!`);
    }
});

// 👇 LÓGICA DE PROTECCIÓN PARA RENDER (NO TOCAR) 👇
console.log('🔄 Verificando entorno para WhatsApp Bot...');

// Detectamos si estamos en Producción (Render tiene RENDER=true)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;

if (!isProduction) {
    // ESTAMOS EN TU PC: Iniciamos el Bot
    console.log('💻 Entorno Local detectado: Iniciando NutriBot... 🚀');
    client.initialize().catch(err => {
        console.error('❌ Error al iniciar el Bot local:', err.message);
    });
} else {
    // ESTAMOS EN RENDER: NO iniciamos el Bot (Evita el Crash por falta de Chrome)
    console.log('☁️ Entorno Nube (Render) detectado: ⛔ NutriBot DESACTIVADO automáticamente.');
    console.log('✅ El servidor seguirá funcionando para Dashboard y Base de Datos.');
}

module.exports = client;