// backend/src/routes/leads.js
const express = require('express');
const router = express.Router();
const pgPool = require('../pgClient');
const { requireAuth } = require('../middleware/auth');

// GET /api/leads - Obtener todos los leads capturados (Web y WhatsApp)
router.get('/', requireAuth, async (req, res) => {
    try {
        // Obtenemos los últimos 50 leads, ordenados por fecha
        const text = `
            SELECT id, payload, created_at 
            FROM landing_leads 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const { rows } = await pgPool.query(text);

        // Procesamos la data porque 'payload' es un JSON
        const leads = rows.map(row => {
            // El payload puede venir como string o como objeto JSON directo dependiendo de la configuración de PG
            let data = row.payload;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) {}
            }

            return {
                id: row.id,
                date: row.created_at,
                source: data.source || 'Web/Desconocido',
                name: data.name || 'Sin nombre',
                phone: data.phone || data.telefono || '',
                email: data.email || '',
                interest: data.interest || 'General'
            };
        });

        res.json({ ok: true, leads });
    } catch (error) {
        console.error('Error obteniendo leads:', error);
        res.status(500).json({ ok: false, message: 'Error de servidor' });
    }
});

// 👇 AGREGAR ESTO: Ruta para eliminar un Lead por ID
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pgPool.query('DELETE FROM landing_leads WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, message: 'Lead no encontrado' });
        }

        return res.json({ ok: true, message: 'Lead eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando lead:', error);
        return res.status(500).json({ ok: false, message: 'Error de servidor' });
    }
});

module.exports = router;