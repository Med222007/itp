//usuarioModel.js
const bcrypt = require('bcryptjs');

class Usuario {
    constructor(id,identificacion, nombre, apellido, contrasena,correo,urlImage,ID_Rol,IMAGE_DOCUMENT) {
        this.id=id;
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.apellido = apellido;
        this.contrasena = contrasena;
        this.correo=correo;
        this.urlImage = urlImage;
        this.ID_Rol=ID_Rol;
        this.IMAGE_DOCUMENT=IMAGE_DOCUMENT
    }

    async verificarContrasena(contrasenaIngresada) {
        return await bcrypt.compare(contrasenaIngresada, this.contrasena);
    }
}

module.exports = Usuario;
