// controllers/userController.js
const UserModel = require('../models/userModel'); // Importamos el modelo de usuario
const { hasExactlyTwoImages, isPDFValid, hasNoText, checkForMaliciousContent } = require('../config/pdfUtils');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.loginUser = async (req, res) => {
    const { identificacion, contrasena } = req.body;

    if (isNaN(identificacion)) {
        return res.status(400).json({ message: "El ID debe ser un número" });
    }

    try {
        const usuario = await UserModel.getUserById(identificacion);
        if (!usuario) {
            return res.status(401).json({ message: "Credenciales no existentes o incorrectas" });
        }

        const isMatch = await usuario.verificarContrasena(contrasena);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Generar token con toda la información del usuario
        const token = jwt.sign(
            {
                id: usuario.id,
                identificacion: usuario.identificacion,
                ID_Rol: usuario.ID_Rol,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                urlImage: usuario.urlImage,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            token, // Solo enviamos el token, ya que dentro está toda la información
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};


exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params; // Obtén el ID de los parámetros de la URL

    try {
        const infousuario = await UserModel.getUserInfoById(id);

        if (infousuario) {
        res.status(200).json({ success: true, data: infousuario });
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).json({ success: false, message: "Error al obtener el usuario" });
    }
};


exports.subirImagenPerfil = async (req, res) => {
    const { userId } = req.params; // Obtén el ID del usuario desde los parámetros de la URL
    const imagen = req.file; // Obtén la imagen subida

    // Verifica si se proporcionó una imagen
    if (!imagen) {
        return res.status(400).json({ success: false, message: "No se proporcionó ninguna imagen." });
    }

    try {
        // 1. Convertir la imagen a Blob
        const imagenBlob = new Blob([imagen.buffer], { type: imagen.mimetype });

        // 2. Llama a la función del modelo para subir la imagen y actualizar el usuario
        const usuarioActualizado = await UserModel.subirImagenYActualizarUsuario(userId, imagenBlob);
        if (usuarioActualizado) {
            return res.status(200).json({
                success: true,
                message: "Foto de perfil actualizada correctamente.",
                urlImagen: usuarioActualizado.urlimage,
                usuario: usuarioActualizado
            });
        } else {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }
    } catch (error) {
        console.error("Error subiendo la imagen o actualizando el usuario:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
};

exports.eliminarImagenPerfil = async (req, res) => {
    const { userId } = req.params; // Obtén el ID del usuario desde los parámetros de la URL
    

    try {
        // Llama a la función del modelo para eliminar la imagen y actualizar el usuario
        const usuarioActualizado = await UserModel.eliminarImagenYActualizarUsuario(userId);
       
        if (usuarioActualizado) {
            return res.status(200).json({
                success: true,
                message: "Imagen de perfil eliminada correctamente.",
                usuario: usuarioActualizado,
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "El usuario no tiene una imagen de perfil para eliminar o no se encontró el usuario.",
            });
        }
    } catch (error) {
        console.error("Error eliminando la imagen o actualizando el usuario:", error);
        return res.status(500).json({
            success: false,
            message: "Error en el servidor.",
            error: error.message,
        });
    }
};
// Subir PDF
exports.subirPDF = async (req, res) => {
    const pdfFile = req.file;
    const userData = JSON.parse(req.body.userData);

    if (!pdfFile) {
        return res.status(400).json({ success: false, message: "No se proporcionó ningún archivo PDF." });
    }

    try {
        // 1. Validar el PDF
        const pdfBuffer = pdfFile.buffer;

        // Verificar que el PDF no esté dañado
        if (!(await isPDFValid(pdfBuffer))) {
            return res.status(200).json({ success: false, message: "El archivo PDF está dañado o no es válido." });
        }

        // Verificar que el PDF no contenga contenido malicioso (enlaces)
        if (await checkForMaliciousContent(pdfBuffer)) {
            return res.status(200).json({ success: false, message: "El PDF contiene enlaces o contenido sospechoso." });
        }

        // Verificar que el PDF no contenga texto
        if (!(await hasNoText(pdfBuffer))) {
            return res.status(200).json({ success: false, message: "El PDF no debe contener texto." });
        }

        // Verificar que el PDF contenga exactamente dos imágenes
        if (!(await hasExactlyTwoImages(pdfBuffer))) {
            return res.status(200).json({ success: false, message: "El PDF debe contener exactamente dos imágenes." });
        }

        // 2. Subir el PDF al modelo (el modelo se encarga de encriptarlo y guardarlo)
        const resultado = await UserModel.subirPDF(pdfFile.buffer,userData);

        if (resultado) {
            return res.status(200).json({ success: true, message: "PDF subido correctamente." });
        } else {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }
    } catch (error) {
        console.error("Error subiendo el PDF:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
};

// Eliminar PDF
exports.eliminarPDF = async (req, res) => {
    const { userId } = req.params; // Obtén el ID del usuario desde los parámetros de la URL

    try {
        // Llama a la función del modelo para eliminar el PDF
        const resultado = await UserModel.eliminarPDF(userId);

        if (resultado) {
            return res.status(200).json({
                success: true,
                message: "PDF eliminado correctamente.",
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No se encontró el usuario o no se pudo eliminar el PDF.",
            });
        }
    } catch (error) {
        console.error("Error eliminando el PDF:", error);
        return res.status(500).json({
            success: false,
            message: "Error en el servidor.",
            error: error.message,
        });
    }
};
exports.obtenerPDF = async (req, res) => {
    const {
        userId,
        identificacion,
        nombre,
        apellido,
        correo
    } = req.query; // Parámetros GET


    try {
        // 2. Crear objeto con los datos del usuario
        const userData = {
            id: userId,
            identificacion,
            nombre,
            apellido,
            correo
        };
        // 1. Obtener el PDF del modelo
        const result = await UserModel.obtenerPDF(userData);
        
        // 2. Manejar diferentes tipos de respuesta
        if (result && result.error === "CREDENTIALS_ERROR") {
            return res.status(200).json({
                success: false,
                message: "No tienes permiso para acceder a este documento",
                code: "FORBIDDEN"
            });
        }
        
        if (result && result.error === "INVALID_FORMAT") {
            return res.status(200).json({
                success: false,
                message: "El documento tiene un formato no válido",
                code: "INVALID_FORMAT"
            });
        }

        if (!result) {
            return res.status(200).json({
                success: false,
                message: "No hay documento asociado a este usuario",
                code: "NOT_FOUND"
            });
        }

        // 3. Enviar el PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.send(result);
    } catch (error) {
        console.error("Error obteniendo el PDF:", error);
        return res.status(500).json({
            success: false,
            message: "Error en el servidor",
            code: "SERVER_ERROR",
            error: error.message
        });
    }
};
