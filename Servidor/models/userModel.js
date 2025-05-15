const db = require("../config/database"); // Importa la conexión a la base de datos
const cloudinary = require('../config/cloudinary'); // Importamos Cloudinary
const Usuario = require('./usuarioModel'); // Importa el modelo de usuario
const sharp = require('sharp');
const { encrypt, decrypt } = require('../config/encryption');
const fs = require('fs');
const path = require('path');

// Definir la carpeta donde se guardarán los PDFs encriptados
const folderPath = path.join(__dirname, 'storage', 'encrypted_pdfs');

// Verificar si la carpeta existe, si no, crearla
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
}



// Función para obtener la información de un usuario por su identificación
const getUserById = async (identificacion) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM users WHERE identificacion = ?", [identificacion], (err, results) => {
            if (err) return reject(err); // Rechaza la promesa en caso de error

            if (results.length > 0) {
                const userData = results[0];
                const usuario = new Usuario(
                    userData.ID,
                    userData.IDENTIFICACION,
                    userData.NOMBRE,
                    userData.APELLIDO,
                    userData.CONTRASENA,
                    userData.CORREO,
                    userData.URLIMAGE,
                    userData.ID_Rol
                );
                return resolve(usuario); // Resuelve la promesa con la instancia del modelo
            } else {
                return resolve(null); // Usuario no encontrado
            }
        });

    });
};

// Función para obtener la información de un usuario por su ID
const getUserInfoById = async (ID) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM users WHERE ID = ?", [ID], (err, results) => {
            if (err) return reject(err); // Rechaza la promesa en caso de error

            if (results.length > 0) {
                const userData = results[0];
                const usuario = new Usuario(
                    userData.ID,
                    userData.IDENTIFICACION,
                    userData.NOMBRE,
                    userData.APELLIDO,
                    userData.CONTRASENA,
                    userData.CORREO,
                    userData.URLIMAGE,
                    userData.ID_Rol,
                );
                return resolve(usuario); // Resuelve la promesa con la instancia del modelo
            } else {
                return resolve(null); // Usuario no encontrado
            }
        });

    });
};

// Función para subir la imagen y actualizar el campo urlimage del usuario
const subirImagenYActualizarUsuario = async (userId, imagenBlob) => {
    try {
        //Convertimos el Blob a un formato que Cloudinary pueda aceptar
        const imagenBuffer = Buffer.from(await imagenBlob.arrayBuffer());

        // Comprimir la imagen con sharp y la pasamos a formato avif o webp o el que queramos
        const imagenComprimida = await sharp(imagenBuffer)
            .resize(800, 800, { fit: 'inside' })
            .avif({ quality: 80 }) // Convertir a WebP
            .toBuffer();
        //  Subimos la imagen a Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'fotos-perfil' }, // Carpeta en Cloudinary
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(imagenComprimida);
        });

        //  Obtenemos la URL de la imagen subida
        const urlImagen = result.secure_url;

        //  Actualizamos el campo urlimage del usuario en la base de datos local
        const query = "UPDATE users SET urlimage = ? WHERE ID = ?";
        const [results] = await db.promise().query(query, [urlImagen, userId]);

        if (results.affectedRows > 0) {
            // Si se actualizó correctamente, obtenemos los datos actualizados del usuario
            const [usuario] = await db.promise().query("SELECT * FROM users WHERE ID = ?", [userId]);
            return usuario[0]; // Retorna los datos actualizados del usuario
        } else {
            return null; // Usuario no encontrado
        }
    } catch (error) {
        console.error("Error subiendo la imagen o actualizando el usuario:", error);
        throw error; // Lanza el error para que lo maneje el controlador
    }
};


const eliminarImagenYActualizarUsuario = async (userId) => {
    try {
        // 1. Obtener la URL de la imagen del usuario
        const [usuario] = await db.promise().query("SELECT urlimage FROM users WHERE ID = ?", [userId]);

        if (!usuario[0] || !usuario[0].urlimage) {
            return null; // El usuario no tiene una imagen de perfil
        }

        const urlImagen = usuario[0].urlimage;

        // 2. Extraer el public_id de la URL de Cloudinary
        const publicId = urlImagen.split('/').pop().split('.')[0]; // Extrae el nombre del archivo sin extensión

        // 3. Añadir la carpeta "fotos-perfil" al public_id
        const fullPublicId = `fotos-perfil/${publicId}`;

        // 4. Eliminar la imagen de Cloudinary
        await cloudinary.uploader.destroy(fullPublicId);

        // 5. Actualizar el campo urlimage del usuario en la base de datos local
        const query = "UPDATE users SET urlimage = NULL WHERE ID = ?";
        const [results] = await db.promise().query(query, [userId]);

        if (results.affectedRows > 0) {
            // Si se actualizó correctamente, obtener los datos actualizados del usuario
            const [usuarioActualizado] = await db.promise().query("SELECT * FROM users WHERE ID = ?", [userId]);
            return usuarioActualizado[0]; // Retorna los datos actualizados del usuario
        } else {
            return null; // Usuario no encontrado
        }
    } catch (error) {
        console.error("Error eliminando la imagen o actualizando el usuario:", error);
        throw error; // Lanza el error para que lo maneje el controlador
    }
};
//metodo para subir pdf
const subirPDF = async (pdfBuffer, userData) => {
    try {
        // Convertir el buffer a base64
        const pdfBase64 = pdfBuffer.toString('base64');

        // Encriptar el PDF
        const encryptedPDF = encrypt(pdfBase64, userData);

        // Definir la ruta donde se guardará el archivo encriptado
        const filePath = path.join(__dirname, 'storage', 'encrypted_pdfs', `user_${userData.id}.pdf`);

        // Guardar el PDF encriptado localmente
        fs.writeFileSync(filePath, encryptedPDF, 'utf8');

        // Guardar la ruta en la base de datos
        const query = "UPDATE users SET pdf_path = ? WHERE ID = ?";
        const [results] = await db.promise().query(query, [filePath, userData.id]);

        if (results.affectedRows > 0) {
            return true;
        } else {
            return false; // No se pudo actualizar el usuario
        }
    } catch (error) {
        console.error("Error subiendo el PDF:", error);
        throw error;
    }
};


const eliminarPDF = async (userId) => {
    try {
        // Obtener la ruta del archivo desde la base de datos
        const [usuario] = await db.promise().query("SELECT pdf_path FROM users WHERE ID = ?", [userId]);

        if (!usuario[0] || !usuario[0].pdf_path) {
            return false; // No hay archivo registrado en la BD
        }

        const filePath = usuario[0].pdf_path;

        // Verificar si el archivo existe y eliminarlo
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Actualizar la base de datos para eliminar la ruta
        const query = "UPDATE users SET pdf_path = NULL WHERE ID = ?";
        const [results] = await db.promise().query(query, [userId]);

        return results.affectedRows > 0;
    } catch (error) {
        console.error("Error eliminando el PDF:", error);
        throw error;
    }
};


//metodo para obtener pdf
const obtenerPDF = async (userData) => {
    try {
        // Obtener la ruta del archivo desde la base de datos
        const [usuario] = await db.promise().query("SELECT pdf_path FROM users WHERE ID = ?", [userData.id]);

        if (!usuario[0] || !usuario[0].pdf_path) {
            return null; // No hay archivo registrado en la BD
        }

        const filePath = usuario[0].pdf_path;

        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            return null;
        }

        // Leer el archivo encriptado
        const encryptedPDF = fs.readFileSync(filePath, 'utf8');

        // Desencriptar el PDF
        const decryptionResult = decrypt(encryptedPDF, userData);

        if (!decryptionResult.success) {
            if (decryptionResult.code === "INVALID_CREDENTIALS") {
                return { 
                    error: "CREDENTIALS_ERROR", 
                    message: "No tienes permiso para acceder a este documento" 
                };
            }
            return {
                error: "DECRYPTION_ERROR",
                message: decryptionResult.error
            };
        }

        // Convertir el base64 a buffer y retornarlo
        return Buffer.from(decryptionResult.data, 'base64');
    } catch (error) {
        console.error("Error obteniendo el PDF:", error);
        throw error;
    }
};




module.exports = { getUserById, getUserInfoById, subirImagenYActualizarUsuario, eliminarImagenYActualizarUsuario,subirPDF,obtenerPDF,eliminarPDF }; // Exporta las funciones para ser usadas en el controlador
