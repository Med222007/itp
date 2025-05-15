const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');


// Ruta para crear una nueva reserva
router.post('/reservas',verificarToken, reservaController.crearReserva);

// Ruta para cancelar una reserva
router.delete('/reservas/:id',verificarToken, reservaController.cancelarReserva);


// Ruta para obtener reservas por fecha
router.get('/reservas/:fecha',verificarToken, reservaController.obtenerReservasPorFecha);

// Ruta para obtener días completamente reservados
router.get('/dias-completamente-reservados',verificarToken,reservaController.obtenerDiasReservados);

//ruta para poder reservar todo el dia completo en caso de ser administrador
router.post('/reservar-todo-el-dia',verificarToken,verificarAdmin, reservaController.reservarTodoElDia);


module.exports = router;
