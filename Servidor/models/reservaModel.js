const db = require("../config/database");
const Notificacion=require("./notificacionModel");

class Reserva {
    constructor(id_reserva, fecha_hora, persona_id) {
        this.id_reserva = id_reserva;
        this.fecha_hora = fecha_hora;
        this.persona_id = persona_id;
    }
    
// Método para crear una nueva reserva
static async crearReserva(fecha_hora, persona_id, rol) {
    const fecha = fecha_hora.split(' ')[0]; // Obtener solo la fecha sin la hora

    // Contar las reservas del usuario para esa fecha
    const count = await this.contarReservasDelUsuarioPorFecha(persona_id, fecha, rol);

    // Verifica si el usuario ya tiene una reserva para ese día
    if (count >= 1) {
        throw new Error("Ya tienes una reserva para este día."); // Lanza un error si ya tiene una reserva
    }

    // Si no tiene reservas, crea la nueva reserva
    const query = "INSERT INTO reservas (Fecha_hora, Persona_id) VALUES (?, ?)";
    return new Promise((resolve, reject) => {
        db.query(query, [fecha_hora, persona_id], (err, results) => {
            if (err) {
                return reject(err); // Rechaza la promesa con el error si ocurre
            }
            resolve(results.insertId); // Resuelve la promesa con el ID de la nueva reserva
        });
    });
}


// Método para cancelar una reserva
    static cancelarReserva(id_reserva) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE reservas SET Estado = 'cancelado' WHERE ID_Reserva = ?";
            db.query(query, [id_reserva], (err, results) => {
                if (err) {
                    return reject(err); // Rechaza la promesa en caso de error
                }
                resolve(results.affectedRows); // Resuelve la promesa con el número de filas afectadas
            });
        });
    }

   
// Método para obtener reservas por fecha
    static obtenerReservasPorFecha(fecha) {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT r.ID_Reserva, r.Fecha_hora, r.Persona_id, u.NOMBRE, u.APELLIDO, r.Estado
            FROM reservas r 
            JOIN users u ON r.Persona_id = u.ID 
            WHERE DATE(r.Fecha_hora) = ?`;
            
            db.query(query, [fecha], (err, results) => {
                if (err) {
                    return reject(err); // Rechaza la promesa en caso de error
                }
                resolve(results); // Resuelve la promesa con los resultados
            });
        });
    }
// Método para obtener días completamente reservados
    static obtenerDiasCompletamenteReservados() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT DATE(STR_TO_DATE(Fecha_hora, '%Y-%m-%d %H:%i:%s')) AS fecha, COUNT(*) AS count
            FROM reservas
            WHERE Estado = 'reservado'
            GROUP BY fecha
            HAVING COUNT(*) >= 17
            `;

            db.query(query, (err, results) => {
                if (err) {
                    return reject(err); // Rechaza la promesa en caso de error
                }
                resolve(results); // Resuelve la promesa con los resultados
            });
        });
    }
// Método para contar reservas del usuario en una fecha específica
static contarReservasDelUsuarioPorFecha(persona_id, fecha, rol) {
    return new Promise((resolve, reject) => {
        if (rol === 'Administrador') {
            return resolve(0); // Resuelve la promesa con 0 si es administrador
        }

        const query = `
            SELECT COUNT(*) AS count
            FROM reservas
            WHERE Persona_id = ? 
                AND DATE(Fecha_hora) = ?
                AND Estado = 'reservado'
        `;
        db.query(query, [persona_id, fecha], (err, results) => {
            if (err) {
                return reject(err); // Rechaza la promesa en caso de error
            }
            resolve(results[0].count); // Resuelve la promesa con la cantidad de reservas
        });
    });
}

// Método para obtener una reserva por ID
    static obtenerReservaPorId(id_reserva) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM reservas WHERE ID_Reserva = ?";
            db.query(query, [id_reserva], (err, results) => {
                if (err) {
                    return reject(err); // Rechaza la promesa en caso de error
                }
                if (results.length === 0) {
                    return resolve(null); // Si no se encuentra la reserva, devuelve null
                }
                resolve(results[0]); // Devuelve la primera reserva (solo debe haber una por ID)
            });
        });
    }
    // Método para reservar todas las horas de un día
    static async reservarTodoElDia(fecha, persona_id,rol) {
        try {
            //Obtenemos todas las reservas existentes para el día elegido
            const reservasExistentes = await this.obtenerReservasPorFecha(fecha);
            //cancelamos todas las reservas existentes
            let reservasCanceladas = 0;
            let erroresCancelacion = [];
            for (const reserva of reservasExistentes) {
              // Verificamos si el estado de la reserva es diferente a "cancelado"
                if (reserva.Estado !== 'cancelado') {
                    try {
                        await this.cancelarReserva(reserva.ID_Reserva);
                        reservasCanceladas++;
                        
                        // Enviar notificación al usuario cuya reserva fue cancelada
                        const mensajeCancelacion = `Tu reserva para el ${reserva.Fecha_hora} ha sido cancelada por un administrador.`;
                        await Notificacion.agregarNotificacion(mensajeCancelacion, reserva.Persona_id, reserva.Fecha_hora);
                    } catch (err) {
                        erroresCancelacion.push(err); // Guardamos el error
                    }
                }
            }
            
            // Si hubo errores al cancelar, lanzamos una excepción
            if (erroresCancelacion.length > 0) {
                throw new Error('Errores al cancelar reservas: ' + JSON.stringify(erroresCancelacion));
            }
    
            //Reservar todas las horas del día
            const horasDisponibles = [];
            const horaInicio = new Date(`${fecha}T06:00:00Z`); // Usar UTC
            const horaFin = new Date(`${fecha}T22:00:00Z`); // Usar UTC
            
            // Generamos las horas disponibles
            for (let hora = horaInicio; hora <= horaFin; hora.setUTCHours(hora.getUTCHours() + 1)) {
                horasDisponibles.push(hora.toISOString().slice(0, 19).replace('T', ' '));
            }
            
            let reservasExitosas = 0;
            let erroresReserva = [];
    
            for (const hora of horasDisponibles) {
                try {
                    await this.crearReserva(hora, persona_id,rol);
                    reservasExitosas++;
                } catch (err) {
                    erroresReserva.push(err); // Guardamos el error
                }
            }
            //Enviar notificación al usuario que realizó la reserva
            const mensajeReserva = `Has reservado todo el dia ${fecha} de forma exitosa`;
            await Notificacion.agregarNotificacion(mensajeReserva, persona_id, fecha);

            // Si hubo errores al reservar, lanzamos una excepción
            if (erroresReserva.length > 0) {
                throw new Error('Errores al reservar horas: ' + JSON.stringify(erroresReserva));
            }
    
            // Devolvemos el resultado
            return {
                reservasCanceladas,
                reservasExitosas,
            };
        } catch (err) {
            // Capturamos cualquier error inesperado
            throw err;
        }
    }

}

module.exports = Reserva;
