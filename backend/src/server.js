// ============================================================
// backend/src/server.js
// ------------------------------------------------------------
// Versión con JWT - Sin sesiones SQLite
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pgPool = require('./pgClient');
const path = require('path');

// Rutas
const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');
const visitsRoutes = require('./routes/visits');
const patientsRoutes = require('./routes/patients');
const consultationsRoutes = require('./routes/consultations');

const db = require('./db');
const { seedDoctor } = require('./seedDoctor');

const app = express();

const PORT = process.env.PORT || 4000;

// ===== ENTORNO =============================================================

const isRender = process.env.RENDER === 'true';
const isProduction = process.env.NODE_ENV === 'production' || isRender;

// ===== CORS ================================================================

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.1.9:5173',
    'https://nutri-app-frontend.onrender.com',
    process.env.FRONTEND_URL
].filter(Boolean); // Eliminar valores undefined

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('⚠️ Origen bloqueado por CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===== TRUST PROXY (para Render) ===========================================
app.set('trust proxy', 1);

// ===== RUTAS BASE ==========================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        message: 'API NutriVida Pro funcionando 🚀',
        mode: isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString(),
    });
});

// Formulario de landing (público)
app.post('/api/landing/form', async (req, res) => {
    try {
        const payload = req.body;

        const result = await pgPool.query(
            `INSERT INTO landing_leads (payload)
             VALUES ($1)
             RETURNING id, created_at`,
            [payload]
        );

        const row = result.rows[0];

        res.status(201).json({
            ok: true,
            id: row.id,
            createdAt: row.created_at,
        });
    } catch (err) {
        console.error('❌ Error guardando formulario de landing:', err);
        res.status(500).json({
            ok: false,
            error: 'Error guardando formulario de landing',
        });
    }
});

// ===== MONTAR RUTAS ========================================================

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/consultations', consultationsRoutes);

// ===== MANEJO DE ERRORES ===================================================

// Ruta no encontrada
app.use((req, res, next) => {
    res.status(404).json({
        ok: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);

    // Error de CORS
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            ok: false,
            message: 'Origen no permitido por CORS',
        });
    }

    res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
    });
});

// ===== ARRANQUE ============================================================

async function start() {
    try {
        console.log('🚀 Iniciando NutriVida Pro Backend...');
        console.log('   Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');

        // Ejecutar seed de doctora
        console.log('👩‍⚕️ Ejecutando seedDoctor()...');
        await seedDoctor();
        console.log('✅ seedDoctor() completado');

    } catch (err) {
        console.error('❌ Error durante inicialización:', err.message || err);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('════════════════════════════════════════════');
        console.log(`✅ Servidor escuchando en puerto ${PORT}`);
        console.log(`   Modo: ${isProduction ? 'Producción' : 'Desarrollo'}`);
        console.log(`   RENDER: ${process.env.RENDER || 'false'}`);
        console.log('════════════════════════════════════════════');
        console.log('');
    });
}

start();