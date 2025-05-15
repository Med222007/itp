const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const {uploadImages, uploadPDF} = require('../config/multer');
const { verificarToken } = require('../middlewares/authMiddleware');

 


router.post('/login', UserController.loginUser);
router.get('/usuario/:id',verificarToken, UserController.obtenerUsuarioPorId);
router.post('/usuarios/:userId/foto-perfil',verificarToken, uploadImages.single('imagen'), UserController.subirImagenPerfil);
router.delete('/usuarios/:userId/foto-perfil',verificarToken, UserController.eliminarImagenPerfil);
router.post('/usuarios/:userId/subir-pdf',verificarToken, uploadPDF.single('pdf'), UserController.subirPDF);
router.get('/usuarios/:userId/ver-pdf',verificarToken, UserController.obtenerPDF);
router.delete('/usuarios/:userId/eliminar-pdf',verificarToken, UserController.eliminarPDF);


module.exports = router;
