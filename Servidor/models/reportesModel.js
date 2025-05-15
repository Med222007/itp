const db = require("../config/database");

class ReportesModel {

    // Función para formatear fechas en formato "dd/mm/yyyy"
    static async formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }); // Devuelve "dd/mm/yyyy"
    }

    // Obtener las reservas de un usuario por su identificación
    static async ReporteReservaId(identificacion) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.ID_Reserva, r.Fecha_hora, r.Estado, u.NOMBRE, u.APELLIDO, u.CORREO
                FROM reservas r
                INNER JOIN users u ON r.Persona_id = u.ID
                WHERE u.IDENTIFICACION = ?
            `;
            db.query(query, [identificacion], (err, results) => {
                if (err) return reject(err); // Rechaza la promesa en caso de error
                resolve(results); // Resuelve la promesa con los resultados
            });
        });
    }
    // Verificar si la identificación existe en la base de datos
    static async verificarIdentificacion(identificacion) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT ID FROM users WHERE IDENTIFICACION = ?
            `;
            db.query(query, [identificacion], (err, results) => {
                if (err) return reject(err); // Rechaza la promesa en caso de error
                if (results.length > 0) {
                    resolve(true); // La identificación existe
                } else {
                    resolve(false); // La identificación no existe
                }
            });
        });
    }
    //Usuarios con más reservas que el promedio
    static async usuariosConMasReservasQueElPromedio() {
        const query = `
        SELECT u.NOMBRE, u.APELLIDO, u.CORREO, COUNT(r.ID_Reserva) AS total_reservas
            FROM users u
            JOIN reservas r ON u.ID = r.Persona_id
            WHERE r.Estado = 'reservado'  -- Filtramos solo las reservas que están en estado 'reservado'
            GROUP BY u.ID
            HAVING COUNT(r.ID_Reserva) > (
            SELECT AVG(total)
            FROM (
                SELECT COUNT(*) AS total
                FROM reservas
                WHERE Estado = 'reservado'  -- Filtramos las reservas 'reservadas' para la subconsulta
                GROUP BY Persona_id
            ) AS subconsulta
        )
    `;
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Fechas con múltiples reservas
    static async fechasConMultiplesReservas() {
        const query = `
        SELECT fecha, cantidad_reservas
        FROM (
            SELECT DATE(Fecha_hora) AS fecha, COUNT(*) AS cantidad_reservas
            FROM reservas
            WHERE Estado = 'reservado'
            GROUP BY DATE(Fecha_hora)
        ) AS reservas_por_fecha
        WHERE cantidad_reservas > 1;
    `;
        return new Promise((resolve, reject) => {
            db.query(query, async (err, results) => { // Aquí añadimos `async` a la función de callback
                if (err) return reject(err);

                // Esperar a que la fecha se formatee correctamente
                const resultadosConFechaFormateada = await Promise.all(results.map(async (result) => ({
                    ...result,
                    fecha: await this.formatearFecha(result.fecha) // Esperar la fecha formateada
                })));

                resolve(resultadosConFechaFormateada);
            });
        });
    }

    //Usuarios sin notificaciones
    static async usuariosSinNotificaciones() {
        const query = `
        SELECT u.NOMBRE, u.APELLIDO, u.CORREO
        FROM users u
        WHERE NOT EXISTS (
        SELECT 1
        FROM notificaciones n
        WHERE n.id_usuario = u.ID
        );

    `;
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    //Rol con mas reservas
    static async rolConMasReservas() {
        const query = `
        SELECT r.rol AS Rol, COUNT(res.ID_Reserva) AS Total_reservas
        FROM roles r
        JOIN users u ON r.ID_Rol = u.id_rol
        JOIN reservas res ON res.Persona_id = u.ID
        WHERE res.Estado = 'reservado'
        GROUP BY r.rol
        HAVING COUNT(res.ID_Reserva) = (
            SELECT MAX(total_reservas)
            FROM (
                SELECT COUNT(res.ID_Reserva) AS total_reservas
                FROM roles r
                JOIN users u ON r.ID_Rol = u.id_rol
                JOIN reservas res ON res.Persona_id = u.ID
                WHERE res.Estado = 'reservado'
                GROUP BY r.rol
            ) AS max_reservas
        );

    `;
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

}

module.exports = ReportesModel;