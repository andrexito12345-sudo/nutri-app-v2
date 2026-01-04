const express = require("express");
const router = express.Router();

const {
    generateWeeklyDiet,
    regenerateSingleMeal,
    startWeeklyDietJob,
    getWeeklyDietJobStatus,
    startDailyDietJob,
    getDailyDietJobStatus,
} = require("../controllers/aiDietController");

// Legacy (sync semana)
router.post("/generate-ai", generateWeeklyDiet);

// Job semana (si aún lo usas)
router.post("/generate-ai/start", startWeeklyDietJob);
router.get("/generate-ai/job/:id", getWeeklyDietJobStatus);

// NUEVO: Job por día (lo que quieres ahora)
router.post("/generate-day/start", startDailyDietJob);
router.get("/generate-day/job/:id", getDailyDietJobStatus);

// Regenerar una comida
router.post("/regenerate-meal", regenerateSingleMeal);

module.exports = router;
