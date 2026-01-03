// backend/src/routes/appointments.js
// ============================================
// Rutas para gestión de citas (usando PostgreSQL)
// ============================================

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const pgPool = require('../pgClient'); // ← Postgres

const router = express.Router();

// ============================================
// 1. STATS DE CITAS (SOLO DOCTORA)
//    GET /api/appointments/stats
// ============================================
router.get('/stats', requireAuth, async (req, res) => {
    try {
        // 🆕 Usar zona horaria de Ecuador (UTC-5)
        const todaySql = `
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END)::int AS pending,
        SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END)::int AS done,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END)::int AS cancelled
      FROM appointments
      WHERE (appointment_datetime AT TIME ZONE 'America/Guayaquil')::date = CURRENT_DATE
    `;

        const last30Sql = `
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END)::int AS pending,
        SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END)::int AS done,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END)::int AS cancelled
      FROM appointments
      WHERE (appointment_datetime AT TIME ZONE 'America/Guayaquil')::date >= (CURRENT_DATE - INTERVAL '30 days')
    `;

        const normalize = (row) => ({
            total: Number(row?.total) || 0,
            pending: Number(row?.pending) || 0,
            done: Number(row?.done) || 0,
            cancelled: Number(row?.cancelled) || 0,
        });

        const { rows: todayRows } = await pgPool.query(todaySql);
        const { rows: last30Rows } = await pgPool.query(last30Sql);

        return res.json({
            ok: true,
            today: normalize(todayRows[0]),
            last30: normalize(last30Rows[0]),
        });
    } catch (err) {
        console.error('❌ Error obteniendo stats de citas (Postgres):', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al obtener estadísticas de citas' });
    }
});

// ============================================
// 2. CREAR CITA (PÚBLICO - DESDE LANDING)
//    POST /api/appointments
// ============================================
router.post('/', async (req, res) => {
    const {
        patient_name,
        patient_email,
        patient_phone,
        reason,
        appointment_datetime,
        // 🆕 NUEVOS CAMPOS BIOMÉTRICOS
        patient_weight,
        patient_height,
        patient_age,
        patient_gender,
        patient_bmi,
        patient_bmi_category
    } = req.body;

    if (!patient_name || !appointment_datetime) {
        return res.status(400).json({
            ok: false,
            message:
                'El nombre del paciente y la fecha/hora de la cita son obligatorios',
        });
    }

    try {
        // 🆕 INSERT actualizado con columnas biométricas
        const insertSql = `
      INSERT INTO appointments
        (
          patient_name, 
          patient_email, 
          patient_phone, 
          reason, 
          appointment_datetime, 
          status,
          patient_weight,
          patient_height,
          patient_age,
          patient_gender,
          patient_bmi,
          patient_bmi_category
        )
      VALUES ($1, $2, $3, $4, $5, 'pendiente', $6, $7, $8, $9, $10, $11)
      RETURNING id;
    `;

        const result = await pgPool.query(insertSql, [
            patient_name,
            patient_email || null,
            patient_phone || null,
            reason || null,
            appointment_datetime,
            // 🆕 Valores biométricos (pueden ser null)
            patient_weight || null,
            patient_height || null,
            patient_age || null,
            patient_gender || null,
            patient_bmi || null,
            patient_bmi_category || null
        ]);

        const newId = result.rows[0]?.id;

        console.log('✅ Cita creada con datos biométricos:', {
            id: newId,
            peso: patient_weight,
            altura: patient_height,
            imc: patient_bmi,
            categoria: patient_bmi_category
        });

        return res.status(201).json({
            ok: true,
            message: 'Cita creada correctamente',
            appointmentId: newId,
        });
    } catch (err) {
        console.error('❌ Error al crear cita (Postgres):', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al crear la cita' });
    }
});

// ============================================
// 3. OBTENER CITA(S) (PRIVADO - DOCTORA)
//    GET /api/appointments
//    Filtros: status, q, date_from, date_to
// ============================================
router.get('/', requireAuth, async (req, res) => {
    const { status, q, date_from, date_to } = req.query;

    // 🆕 Incluir columnas biométricas en el SELECT
    let sql = `
    SELECT 
      a.*,
      p.id AS linked_patient_id 
    FROM appointments a
    LEFT JOIN patients p ON (
      (a.patient_email IS NOT NULL AND a.patient_email <> '' AND a.patient_email = p.email)
      OR
      (a.patient_phone IS NOT NULL AND a.patient_phone <> '' AND a.patient_phone = p.phone)
    )
    WHERE 1 = 1
  `;

    const params = [];
    let idx = 1;

    if (status) {
        sql += ` AND a.status = $${idx}`;
        params.push(status);
        idx++;
    }

    if (q) {
        sql += ` AND (a.patient_name ILIKE $${idx} OR a.patient_email ILIKE $${idx + 1})`;
        const like = `%${q}%`;
        params.push(like, like);
        idx += 2;
    }

    if (date_from) {
        sql += ` AND a.appointment_datetime >= $${idx}`;
        params.push(date_from);
        idx++;
    }

    if (date_to) {
        sql += ` AND a.appointment_datetime <= $${idx}`;
        params.push(date_to);
        idx++;
    }

    sql += ' ORDER BY a.appointment_datetime DESC';

    try {
        const { rows } = await pgPool.query(sql, params);
        return res.json({ ok: true, appointments: rows });
    } catch (err) {
        console.error('❌ Error al obtener citas (Postgres):', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al obtener citas' });
    }
});

// ============================================
// 🆕 3.1. OBTENER UNA CITA POR ID (PRIVADO - DOCTORA)
//    GET /api/appointments/:id
// ============================================
router.get('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            SELECT 
              a.*,
              p.id AS linked_patient_id 
            FROM appointments a
            LEFT JOIN patients p ON (
              (a.patient_email IS NOT NULL AND a.patient_email <> '' AND a.patient_email = p.email)
              OR
              (a.patient_phone IS NOT NULL AND a.patient_phone <> '' AND a.patient_phone = p.phone)
            )
            WHERE a.id = $1
        `;

        const { rows } = await pgPool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                ok: false,
                message: 'Cita no encontrada'
            });
        }

        return res.json({
            ok: true,
            appointment: rows[0]
        });
    } catch (err) {
        console.error('❌ Error al obtener cita por ID (Postgres):', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al obtener la cita' });
    }
});

// ============================================
// 4. ACTUALIZAR ESTADO DE CITA (PRIVADO - DOCTORA)
//    PATCH /api/appointments/:id/status
// ============================================
router.patch('/:id/status', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pendiente', 'realizada', 'cancelada'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            ok: false,
            message: 'Estado inválido',
        });
    }

    try {
        const updateSql = `
      UPDATE appointments
      SET status = $1
      WHERE id = $2
      RETURNING id;
    `;

        const result = await pgPool.query(updateSql, [status, id]);

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ ok: false, message: 'Cita no encontrada' });
        }

        return res.json({ ok: true, message: 'Estado actualizado' });
    } catch (err) {
        console.error('❌ Error al actualizar cita (Postgres):', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al actualizar cita' });
    }
});

// ============================================
// 5. ELIMINAR CITA (PRIVADO - DOCTORA)
//    DELETE /api/appointments/:id
// ============================================
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pgPool.query('DELETE FROM appointments WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ ok: false, message: 'Cita no encontrada' });
        }

        return res.json({ ok: true, message: 'Cita eliminada correctamente' });
    } catch (err) {
        console.error('❌ Error al eliminar cita (Postgres):', err);
        return res.status(500).json({ ok: false, message: 'Error al eliminar cita' });
    }
});

module.exports = router;