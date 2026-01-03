
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const aiController = require('../controllers/aiDietController');

console.log("✅ dietRoutes cargado desde:", __filename);
console.log("✅ aiDietController resuelto desde:", require.resolve("../controllers/aiDietController"));

// Ruta POST para generar dieta con IA
router.post('/generate-ai', requireAuth, aiController.generateWeeklyDiet);

module.exports = router;