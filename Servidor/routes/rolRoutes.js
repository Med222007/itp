const express = require('express');
const { getRolById } = require('../controllers/rolController');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/rol/:id_rol',verificarToken, getRolById);

module.exports = router;
