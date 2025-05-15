const express = require('express');
const router = express.Router();
const { agregarNotificacion, obtenerNotificaciones } = require('../controllers/notificacionController');
const { verificarToken} = require('../middlewares/authMiddleware');

// Ruta para obtener las notificaciones de un usuario
router.get('/notificaciones/:id',verificarToken, obtenerNotificaciones);

// Ruta para agregar una nueva notificación
router.post('/notificaciones',verificarToken, agregarNotificacion);

module.exports = router;
