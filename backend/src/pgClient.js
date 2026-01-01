// backend/src/pgClient.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.PG_URL;

if (!connectionString) {
    console.log('ℹ️ PostgreSQL desactivado (no hay DATABASE_URL/PG_URL). Se usará solo SQLite.');
}

let pool = null;

if (connectionString) {
    // Detectar si es localhost o producción
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    const poolConfig = {
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
    };

    // Solo usar SSL en producción (Render), NO en localhost
    if (!isLocalhost) {
        poolConfig.ssl = {
            rejectUnauthorized: false
        };
    }

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
        console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
    });

    if (isLocalhost) {
        console.log('✅ Pool de PostgreSQL inicializado (LOCAL - sin SSL)');
    } else {
        console.log('✅ Pool de PostgreSQL inicializado (PRODUCCIÓN - con SSL)');
    }
}

module.exports = pool;