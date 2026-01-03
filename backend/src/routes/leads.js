const express = require('express');
const router = express.Router();
const pgPool = require('../pgClient');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        // Consultamos landing_leads (puedes agregar UNION ALL si tienes otra tabla de WhatsApp)
        const text = `
            SELECT id, payload, created_at 
            FROM landing_leads 
            ORDER BY created_at DESC 
            LIMIT 100
        `;
        const { rows } = await pgPool.query(text);

        const leads = rows.map(row => {
            let data = row.payload;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) { data = {}; }
            }

            // ⚡ MAPEJO FLEXIBLE: Buscamos nombres de campos tanto en inglés como en español
            return {
                id: row.id,
                date: row.created_at,
                // Detecta si viene de WhatsApp o Web
                source: data.source || (data.whatsapp ? 'WhatsApp Bot' : 'Calculadora IMC'),
                name: data.name || data.nombre || data.full_name || 'Nuevo Interesado',
                phone: data.phone || data.telefono || data.from || '',
                email: data.email || 'N/A',
                // Muestra el resultado del IMC si existe, o el interés general
                interest: data.imc_result ? `IMC: ${data.imc_result}` : (data.interest || 'Consulta General')
            };
        });

        res.json({ ok: true, leads });
    } catch (error) {
        console.error('❌ Error obteniendo leads:', error);
        res.status(500).json({ ok: false, message: 'Error de servidor' });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await pgPool.query('DELETE FROM landing_leads WHERE id = $1', [id]);
        return res.json({ ok: true, message: 'Lead eliminado' });
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Error' });
    }
});

module.exports = router;