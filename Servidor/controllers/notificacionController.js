const Notificacion = require('../models/notificacionModel');

// Controlador para agregar una nueva notificación
exports.agregarNotificacion = async (req, res) => {
    const { mensaje, id_usuario, fecha } = req.body;

    try {
        // Llama al modelo para agregar una nueva notificación
        const id_nueva_notificacion = await Notificacion.agregarNotificacion(mensaje, id_usuario, fecha);
        res.status(201).json({ message: 'Notificación creada con éxito', id_notificacion: id_nueva_notificacion });
    } catch (err) {
        return res.status(500).json({ error: 'Error al agregar la notificación' });
    }
};

// Controlador para obtener todas las notificaciones de un usuario
exports.obtenerNotificaciones = async (req, res) => {
    const { id } = req.params;

    try {
        // Llama al modelo para obtener las notificaciones del usuario
        const notificaciones = await Notificacion.obtenerNotificaciones(id);
        res.status(200).json(notificaciones); // Devuelve las notificaciones al frontend
    } catch (err) {
        return res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
};
