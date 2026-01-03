const express = require('express');
const router = express.Router();
const pgPool = require('../pgClient');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        // Consultamos la tabla donde el Bot inserta los datos
        const { rows } = await pgPool.query('SELECT id, payload, created_at FROM landing_leads ORDER BY created_at DESC LIMIT 50');

        const leads = rows.map(row => {
            let data = row.payload;
            // Forzamos que sea un objeto para que no rompa el frontend
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) { data = {}; }
            }

            return {
                id: row.id,
                date: row.created_at,
                // Mapeo flexible: busca todas las formas posibles del nombre y teléfono
                source: data.source || 'WhatsApp Bot',
                name: data.name || data.nombre || data.full_name || data.pushname || 'Nuevo Interesado',
                phone: data.phone || data.telefono || data.from || 'Sin número',
                interest: data.interest || data.imc_result || 'Consulta Inicial'
            };
        });

        res.json({ ok: true, leads });
    } catch (error) {
        console.error('Error en ruta leads:', error);
        res.status(500).json({ ok: false, leads: [] });
    }
});

module.exports = router;