const Rol = require('../models/rolModel');

exports.getRolById = async (req, res) => {
    const { id_rol } = req.params;

    try {
        // Llamar a la función getRolById del modelo y esperar el resultado
        const rol = await Rol.getRolById(id_rol);

        if (rol) {
            res.json({ rol });
        } else {
            res.status(404).send('Rol no encontrado');
        }
    } catch (err) {
        console.error("Error al obtener el rol:", err);
        return res.status(500).json({ message: "Error al obtener el rol.", error: err.message });
    }
};

