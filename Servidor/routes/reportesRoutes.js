const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

// Ruta para exportar el reporte de reservas por usuario
router.get('/reservas/usuario/:identificacion',verificarToken,verificarAdmin, reportesController.exportarReservasUsuario);

// Ruta para exportar reportes generales
router.get('/reporte-general/:tipo', verificarToken, verificarAdmin, reportesController.exportarReporteGeneral);


module.exports = router;