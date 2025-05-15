const db = require("../config/database");

class Rol {
    constructor(id_rol, rol) {
        this.id_rol = id_rol;
        this.rol = rol;
    }

    // Método para obtener el rol del usuario desde la base de datos
    static async getRolById(id_rol) {
        const query = "SELECT rol FROM roles WHERE ID_Rol = ?";
        
        return new Promise((resolve, reject) => {
            db.query(query, [id_rol], (err, results) => {
                if (err) {
                    return reject(err); // Rechaza la promesa si ocurre un error
                }
                if (results.length > 0) {
                    resolve(results[0].rol); // Resuelve la promesa con el rol
                } else {
                    resolve(null); // Rol no encontrado
                }
            });
        });
    }
}

module.exports = Rol;