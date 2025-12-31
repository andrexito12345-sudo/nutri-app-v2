// ============================================================
// backend/src/resetDoctor.js
// ------------------------------------------------------------
// Script para ELIMINAR y RECREAR la cuenta de la doctora
// Ejecutar SOLO UNA VEZ para resetear las credenciales
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pg = require('./pgClient');

async function resetDoctor() {
    try {
        console.log('🗑️  RESETEANDO CUENTA DE LA DOCTORA...\n');

        const name = process.env.DOCTOR_NAME || 'Dra. Daniela Vaca';
        const email = process.env.DOCTOR_EMAIL || 'doctora@nutrividapro.com';
        const plainPassword = process.env.DOCTOR_PASSWORD || 'DanielaVaca12a';

        console.log('📋 Credenciales que se usarán:');
        console.log('   Nombre:', name);
        console.log('   Email:', email);
        console.log('   Password:', plainPassword);
        console.log('');

        // 1. ELIMINAR todos los usuarios existentes
        console.log('🗑️  Eliminando usuarios existentes...');
        const deleteResult = await pg.query('DELETE FROM doctors');
        console.log(`✅ ${deleteResult.rowCount} usuario(s) eliminado(s)\n`);

        // 2. CREAR nuevo usuario con las credenciales correctas
        console.log('🔐 Encriptando contraseña...');
        const hash = await bcrypt.hash(plainPassword, 10);

        console.log('👤 Creando nuevo usuario...');
        const insertResult = await pg.query(
            `INSERT INTO doctors (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [name, email, hash]
        );

        const newId = insertResult.rows[0].id;

        console.log('\n🎉 ¡CUENTA RECREADA EXITOSAMENTE!\n');
        console.log('═══════════════════════════════════════');
        console.log('📋 ID:', newId);
        console.log('👤 Nombre:', name);
        console.log('📧 Email:', email);
        console.log('🔑 Password:', plainPassword);
        console.log('═══════════════════════════════════════');
        console.log('\n✅ Ahora puedes hacer login con estas credenciales.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error reseteando doctora:', err);
        process.exit(1);
    }
}

resetDoctor();