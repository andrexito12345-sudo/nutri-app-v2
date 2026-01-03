const express = require('express');
const { requireAuth } = require('../middleware/auth');
const pg = require('../pgClient');
const router = express.Router();

router.get('/summary', requireAuth, async (req, res) => {
    try {
        const summary = {};

        // 1) Contar TODO (Citas manuales + Leads de Calculadora)
        // Usamos UNION ALL para juntar ambas fuentes de datos
        const statsSql = `
            WITH all_data AS (
                SELECT status, created_at::date as fecha FROM appointments
                UNION ALL
                SELECT 'pendiente' as status, created_at::date as fecha FROM landing_leads
            )
            SELECT
                COUNT(*)::integer AS total,
                SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END)::integer AS pendientes,
                SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END)::integer AS realizadas,
                -- Filtro específico para HOY (Zona horaria Ecuador)
                SUM(CASE WHEN fecha = (CURRENT_DATE AT TIME ZONE 'America/Guayaquil')::date THEN 1 ELSE 0 END)::integer AS hoy_total,
                SUM(CASE WHEN status = 'pendiente' AND fecha = (CURRENT_DATE AT TIME ZONE 'America/Guayaquil')::date THEN 1 ELSE 0 END)::integer AS hoy_pendientes
            FROM all_data;
        `;

        const { rows: [stats] } = await pg.query(statsSql);

        summary.appointments = {
            total: stats.total || 0,
            pendientes: stats.pendientes || 0,
            realizadas: stats.realizadas || 0,
            hoy: stats.hoy_total || 0,
            hoy_pendientes: stats.hoy_pendientes || 0
        };

        // 2) Visitas (Se mantiene igual pero ajustado a Ecuador)
        const visitsSql = `
            SELECT 
                (SELECT COUNT(*)::integer FROM page_visits) AS total_visits,
                (SELECT COUNT(*)::integer FROM page_visits 
                 WHERE DATE(created_at AT TIME ZONE 'America/Guayaquil') = CURRENT_DATE) AS visits_today;
        `;
        const { rows: [visits] } = await pg.query(visitsSql);
        summary.visits = { total_visits: visits.total_visits || 0 };
        summary.visits_today = visits.visits_today || 0;

        return res.json({ ok: true, summary });
    } catch (err) {
        console.error('❌ Error en dashboard summary:', err);
        return res.status(500).json({ ok: false, message: 'Error en dashboard' });
    }
});

module.exports = router;