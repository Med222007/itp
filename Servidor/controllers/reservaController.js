const Reserva = require('../models/reservaModel');
const Notificacion = require('../models/notificacionModel');

// Controlador para crear una reserva
exports.crearReserva = async (req, res) => {
    const { Fecha_hora, Persona_id, rol } = req.body;
    const fecha = Fecha_hora.split(' ')[0];

    try {
        // Llama al método para contar reservas solo si no es admin
        const count = await Reserva.contarReservasDelUsuarioPorFecha(Persona_id, fecha, rol);

        // Si el rol es usuario y ya tiene una reserva para ese día, devolver error
        if (rol === 'Usuario' && count >= 1) {
            return res.status(409).json({ error: 'Ya tienes una reserva para este día.' });
        }

        // Si no tiene reservas o es admin, proceder con la creación de la reserva
        const resultado = await Reserva.crearReserva(Fecha_hora, Persona_id, rol);

        // Crear una notificación para el usuario
        const mensaje = `Tu reserva ha sido realizada para el ${Fecha_hora}.`;
        await Notificacion.agregarNotificacion(mensaje, Persona_id, Fecha_hora);

        // Si la reserva se crea con éxito, devuelve el ID de la reserva creada
        res.status(201).json({ message: 'Reserva creada con éxito', id_reserva: resultado });
    } catch (err) {
        console.error('Error al crear la reserva:', err);
        return res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

// Controlador para cancelar una reserva
exports.cancelarReserva = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la reserva desde los parámetros de la URL
    const { rol } = req.body;  // Obtener el rol del cuerpo de la solicitud

    try {
        // Primero, obtenemos la reserva para poder acceder a sus detalles
        const reserva = await Reserva.obtenerReservaPorId(id);

        // Si no se encuentra la reserva, devuelve un error
        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        // Cancelar la reserva
        await Reserva.cancelarReserva(id);

        // Crear el mensaje de la notificación dependiendo del rol
        let mensaje;
        if (rol === 'Usuario') {
            mensaje = `Has cancelado tu reserva para el ${reserva.Fecha_hora} con éxito.`;
        } else {
            mensaje = `Tu reserva para el ${reserva.Fecha_hora} ha sido cancelada por un administrador.`;
        }

        // Crear una notificación para el usuario
        try {
            await Notificacion.agregarNotificacion(mensaje, reserva.Persona_id, reserva.Fecha_hora);
        } catch (err) {
            console.error('Error al agregar notificación:', err);
        }

        res.status(200).json({ message: 'Reserva cancelada con éxito' });
    } catch (err) {
        console.error('Error al cancelar la reserva:', err);
        return res.status(500).json({ error: 'Error al cancelar la reserva' });
    }
};


// Controlador para obtener reservas por fecha
exports.obtenerReservasPorFecha = async (req, res) => {
    const { fecha } = req.params;

    try {
        // Llama al modelo para obtener las reservas
        const reservas = await Reserva.obtenerReservasPorFecha(fecha);

        // Si no se encuentran reservas, envía un array vacío
        if (reservas.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(reservas);
    } catch (err) {
        console.error("Error al obtener reservas:", err);
        // Asegúrate de que envías solo una respuesta
        return res.status(500).json({ mensaje: "Error al obtener las reservas" });
    }
};

// Controlador para obtener días completamente reservados
exports.obtenerDiasReservados = async (req, res) => {
    try {
        // Llama al modelo para obtener los días completamente reservados
        const results = await Reserva.obtenerDiasCompletamenteReservados();

        // Formateamos el resultado para que solo nos dé la fecha
        const formattedResults = results.map(item => {
            const fecha = item.fecha.toISOString().split('T')[0]; // Tomar solo la parte de la fecha
            return {
                fecha: fecha,
                count: item.count
            };
        });

        res.status(200).send(formattedResults);
    } catch (err) {
        console.error('Error en el controlador:', err);
        return res.status(500).json({ error: 'Error al obtener los días reservados' });
    }
};

// Controlador para reservar todas las horas de un día
exports.reservarTodoElDia = async (req, res) => {
    const { fecha, persona_id, rol } = req.body; // fecha en formato 'YYYY-MM-DD'
    try {
        // Llamamos al método reservarTodoElDia del modelo y esperamos el resultado
        const resultados = await Reserva.reservarTodoElDia(fecha, persona_id, rol);

        // Si todo sale bien, devolvemos los resultados
        res.status(201).json({
            message: 'Horas reservadas con éxito',
            resultados
        });
    } catch (err) {
        return res.status(500).json({
            error: 'Error al reservar las horas',
            detalles: err.message // Asegúrate de enviar un mensaje de error más específico
        });
    }
};









