// backend/src/migrateLocalPg.js
// Script para crear todas las tablas en PostgreSQL LOCAL

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.local') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

console.log('🚀 Conectando a:', process.env.DATABASE_URL);

(async () => {
    const client = await pool.connect();

    try {
        console.log('📦 Creando tablas en PostgreSQL LOCAL...\n');

        // 1. TABLA DOCTORS
        await client.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla doctors creada');

        // 2. TABLA PATIENTS
        await client.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50) NOT NULL,
                birth_date DATE,
                gender VARCHAR(20),
                occupation VARCHAR(100),
                address TEXT,
                emergency_contact VARCHAR(255),
                emergency_phone VARCHAR(50),
                blood_type VARCHAR(10),
                allergies TEXT,
                notes TEXT,
                current_weight NUMERIC(5,2),
                current_bmi NUMERIC(5,2),
                last_consultation_date TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla patients creada');

        // 3. TABLA APPOINTMENTS
        await client.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id),
                patient_name VARCHAR(255) NOT NULL,
                patient_email VARCHAR(255),
                patient_phone VARCHAR(50),
                reason TEXT,
                appointment_datetime TIMESTAMPTZ NOT NULL,
                status VARCHAR(20) DEFAULT 'pendiente',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla appointments creada');

        // 4. TABLA CONSULTATIONS (SOAP COMPLETO)
        await client.query(`
            CREATE TABLE IF NOT EXISTS consultations (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                appointment_id INTEGER REFERENCES appointments(id),
                consultation_date TIMESTAMPTZ NOT NULL,
                
                -- Subjetivo
                subjective TEXT,
                symptoms TEXT,
                appetite VARCHAR(100),
                sleep_quality VARCHAR(100),
                stress_level VARCHAR(100),
                physical_activity VARCHAR(100),
                water_intake VARCHAR(100),
                bowel_habits VARCHAR(100),
                
                -- Objetivo - Antropometría
                weight NUMERIC(5,2),
                height NUMERIC(5,2),
                bmi NUMERIC(5,2),
                waist NUMERIC(5,2),
                hip NUMERIC(5,2),
                waist_hip_ratio NUMERIC(4,2),
                body_fat NUMERIC(5,2),
                body_fat_percentage NUMERIC(5,2),
                muscle_mass NUMERIC(5,2),
                ideal_weight NUMERIC(5,2),
                
                -- Signos Vitales
                blood_pressure VARCHAR(20),
                heart_rate INTEGER,
                temperature NUMERIC(4,2),
                
                -- Bioquímicos
                glucose NUMERIC(6,2),
                hba1c NUMERIC(5,2),
                cholesterol NUMERIC(6,2),
                triglycerides NUMERIC(6,2),
                hdl NUMERIC(6,2),
                ldl NUMERIC(6,2),
                hemoglobin NUMERIC(5,2),
                albumin NUMERIC(5,2),
                objective_notes TEXT,
                
                -- Análisis (PES)
                pes_problem TEXT,
                pes_etiology TEXT,
                pes_signs TEXT,
                diagnosis TEXT,
                assessment_notes TEXT,
                nutritional_status VARCHAR(100),
                risk_level VARCHAR(50),
                priority VARCHAR(50),
                
                -- Plan
                treatment_plan TEXT,
                treatment_goals TEXT,
                calories_prescribed NUMERIC(6,2),
                protein_prescribed NUMERIC(6,2),
                carbs_prescribed NUMERIC(6,2),
                fats_prescribed NUMERIC(6,2),
                diet_type VARCHAR(100),
                supplements_recommended TEXT,
                education_provided TEXT,
                referrals TEXT,
                next_appointment TIMESTAMPTZ,
                
                -- Metadata
                notes TEXT,
                created_by VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla consultations creada');

        // 5. TABLA NUTRITIONAL_CALCULATIONS
        await client.query(`
            CREATE TABLE IF NOT EXISTS nutritional_calculations (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES patients(id),
                consultation_id INTEGER REFERENCES consultations(id),
                calculation_date TIMESTAMPTZ NOT NULL,
                weight NUMERIC(5,2),
                height NUMERIC(5,2),
                age INTEGER,
                gender VARCHAR(20),
                formula_used VARCHAR(50),
                activity_level VARCHAR(50),
                stress_factor VARCHAR(50),
                goal VARCHAR(50),
                condition VARCHAR(100),
                tmb_value NUMERIC(6,2),
                get_value NUMERIC(6,2),
                calories_prescribed NUMERIC(6,2),
                protein_grams NUMERIC(6,2),
                carbs_grams NUMERIC(6,2),
                fats_grams NUMERIC(6,2),
                distribution_strategy VARCHAR(100),
                meal_distribution TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla nutritional_calculations creada');

        // 6. TABLA MEASUREMENTS
        await client.query(`
            CREATE TABLE IF NOT EXISTS measurements (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES patients(id),
                consultation_id INTEGER REFERENCES consultations(id),
                measurement_date TIMESTAMPTZ NOT NULL,
                chest NUMERIC(5,2),
                arm_left NUMERIC(5,2),
                arm_right NUMERIC(5,2),
                forearm_left NUMERIC(5,2),
                forearm_right NUMERIC(5,2),
                thigh_left NUMERIC(5,2),
                thigh_right NUMERIC(5,2),
                calf_left NUMERIC(5,2),
                calf_right NUMERIC(5,2),
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla measurements creada');

        // 7. TABLA EVOLUTION_NOTES
        await client.query(`
            CREATE TABLE IF NOT EXISTS evolution_notes (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES patients(id),
                consultation_id INTEGER NOT NULL REFERENCES consultations(id),
                note_date TIMESTAMPTZ NOT NULL,
                note_type VARCHAR(50),
                note TEXT NOT NULL,
                is_important BOOLEAN DEFAULT FALSE,
                created_by VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla evolution_notes creada');

        // 8. TABLA VISITS
        await client.query(`
            CREATE TABLE IF NOT EXISTS visits (
                id SERIAL PRIMARY KEY,
                visited_at TIMESTAMPTZ DEFAULT NOW(),
                source VARCHAR(255),
                user_agent TEXT
            );
        `);
        console.log('✅ Tabla visits creada');

        // 9. TABLA PAGE_VISITS
        await client.query(`
            CREATE TABLE IF NOT EXISTS page_visits (
                id SERIAL PRIMARY KEY,
                path VARCHAR(500) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla page_visits creada');

        // 10. TABLA LANDING_LEADS
        await client.query(`
            CREATE TABLE IF NOT EXISTS landing_leads (
                id SERIAL PRIMARY KEY,
                payload JSONB NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla landing_leads creada');

        console.log('\n🎉 ¡Todas las tablas creadas exitosamente en PostgreSQL LOCAL!\n');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        client.release();
        await pool.end();
    }
})();