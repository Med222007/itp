const express = require('express');
const router = express.Router();
const DatabaseController = require('../controllers/databaseController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

// Ruta para exportar la base de datos
router.get('/export-database',verificarToken,verificarAdmin, DatabaseController.exportDatabase);

module.exports = router;