// ================================================================
// Script de Migración: Agregar columnas biométricas a appointments
// ================================================================
// Uso: node runBiometricMigration.js
// ================================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.local') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurar conexión
const connectionString = process.env.DATABASE_URL || process.env.PG_URL;

if (!connectionString) {
    console.error('❌ Error: No se encontró DATABASE_URL o PG_URL en las variables de entorno');
    process.exit(1);
}

const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const poolConfig = {
    connectionString,
    max: 5,
};

if (!isLocalhost) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

console.log('🚀 MIGRACIÓN: Agregar columnas biométricas a appointments');
console.log('📍 Entorno:', isLocalhost ? 'LOCAL' : 'PRODUCCIÓN');
console.log('🔗 Base de datos:', connectionString.split('@')[1] || 'PostgreSQL');
console.log('');

(async () => {
    const client = await pool.connect();

    try {
        console.log('📦 Ejecutando migración...\n');

        // Ejecutar cada ALTER TABLE por separado (más compatible)
        const migrations = [
            {
                column: 'patient_weight',
                sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_weight NUMERIC(5,2)`,
                description: 'Peso del paciente en kg'
            },
            {
                column: 'patient_height',
                sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_height NUMERIC(5,2)`,
                description: 'Altura del paciente en cm'
            },
            {
                column: 'patient_age',
                sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_age INTEGER`,
                description: 'Edad del paciente en años'
            },
            {
                column: 'patient_gender',
                sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_gender VARCHAR(20)`,
                description: 'Género del paciente'
            },
            {
                column: 'patient_bmi',
                sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_bmi NUMERIC(5,2)`,
                description: 'IMC calculado'
            },
            {
                column: 'patient_bmi_category',
                sql: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_bmi_category VARCHAR(50)`,
                description: 'Categoría del IMC'
            }
        ];

        for (const migration of migrations) {
            try {
                await client.query(migration.sql);
                console.log(`✅ Columna '${migration.column}' agregada - ${migration.description}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️  Columna '${migration.column}' ya existe (OK)`);
                } else {
                    throw error;
                }
            }
        }

        console.log('\n📋 Verificando estructura de la tabla...\n');

        // Verificar que las columnas existen
        const verifyQuery = `
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'appointments' 
              AND column_name IN (
                'patient_weight', 
                'patient_height', 
                'patient_age', 
                'patient_gender', 
                'patient_bmi', 
                'patient_bmi_category'
              )
            ORDER BY column_name;
        `;

        const result = await client.query(verifyQuery);

        if (result.rows.length === 6) {
            console.log('✅ MIGRACIÓN EXITOSA - Todas las columnas creadas:');
            console.log('');
            result.rows.forEach(row => {
                console.log(`   • ${row.column_name.padEnd(25)} (${row.data_type})`);
            });
            console.log('');
            console.log('🎉 ¡Base de datos actualizada correctamente!');
        } else {
            console.warn('⚠️  Advertencia: Solo se encontraron', result.rows.length, 'de 6 columnas');
            console.log('Columnas encontradas:', result.rows.map(r => r.column_name));
        }

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);
        console.error('Detalles:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
        console.log('\n🔌 Conexión cerrada');
    }
})();