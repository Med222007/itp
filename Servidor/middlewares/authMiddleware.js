//authMiddleware.js
const { OAuth2Client } = require("google-auth-library");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require("../config/database"); // Importa la conexión a la base de datos



exports.verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({
            message: "Acceso denegado. Token no proporcionado.",
            code: "NO_TOKEN"
        });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.usuario = decoded;

        // Verificar si el token está a punto de expirar (último segundo)
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp - now <= 1) {
            return res.status(401).json({
                message: "Sesión a punto de expirar",
                code: "TOKEN_ABOUT_TO_EXPIRE",
                expiresIn: decoded.exp - now
            });
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Sesión expirada. Por favor vuelve a iniciar sesión.",
                code: "TOKEN_EXPIRED",
                expiredAt: error.expiredAt
            });
        }
        return res.status(403).json({
            message: "Token inválido",
            code: "INVALID_TOKEN"
        });
    }
};

exports.verificarAdmin = (req, res, next) => {
    if (req.usuario.ID_Rol !== 1) {
        return res.status(403).json({
            message: "Acceso denegado. No tienes privilegios de administrador.",
            code: "NOT_ADMIN"
        });
    }
    next();
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginConGoogle = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token requerido." });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Verificar que el correo tenga el dominio @itp.edu.co
        if (!email.endsWith("@itp.edu.co")) {
            return res.status(403).json({ message: "Solo se permite iniciar sesión con un correo institucional @itp.edu.co." });
        }

        // Separar el nombre completo en partes
        const nameParts = name.split(' ');

        let nombre, apellido;

        // Lógica para determinar nombre y apellido según la cantidad de partes
        if (nameParts.length === 1) {
            // Si solo hay un nombre, usamos el mismo como nombre y dejamos el apellido vacío
            nombre = nameParts[0];
            apellido = '';
        } else if (nameParts.length === 2) {
            // Si hay 2 partes, la primera es el nombre y la segunda el apellido
            nombre = nameParts[0];
            apellido = nameParts[1];
        } else if (nameParts.length === 3) {
            // Si hay 3 partes, las dos primeras son el nombre y la tercera el apellido
            nombre = `${nameParts[0]} ${nameParts[1]}`;
            apellido = nameParts[2];
        } else if (nameParts.length >= 4) {
            // Si hay 4 o más partes, las primeras dos son el nombre y las últimas dos el apellido
            nombre = `${nameParts[0]} ${nameParts[1]}`;
            apellido = `${nameParts[nameParts.length - 2]} ${nameParts[nameParts.length - 1]}`;
        }

        // Verificar si el usuario ya existe
        db.query("SELECT * FROM users WHERE correo = ?", [email], (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            if (results.length > 0) {
                // Usuario existente, generar el token con la información de la base de datos
                const usuario = results[0];


                // Generar y enviar el token con los datos del usuario desde la base de datos
                generarYEnviarToken(usuario, res);
            } else {
                // Crear nuevo usuario
                db.query(
                    "INSERT INTO users (nombre, apellido, correo, urlimage, ID_Rol) VALUES (?, ?, ?, ?, ?)",
                    [nombre, apellido, email, picture, 2],
                    (err, result) => {
                        if (err) {
                            console.error("Error al insertar usuario:", err);
                            return res.status(500).json({ message: "Error al crear usuario" });
                        }

                        const usuario = {
                            id: result.insertId,
                            nombre: nombre,
                            apellido: apellido,
                            email,
                            imagen: picture,
                            ID_Rol: 2

                        };

                        // Generar y enviar el token con los datos del nuevo usuario
                        generarYEnviarToken(usuario, res);
                    }
                );
            }
        });
    } catch (error) {
        console.error("Error al verificar el token de Google:", error);
        res.status(403).json({ message: "Token inválido o expirado." });
    }
};

// Función para generar y enviar el token
const generarYEnviarToken = (usuario, res) => {
    const jwtToken = jwt.sign(
        {
            id: usuario.id || usuario.ID,
            nombre: usuario.nombre || usuario.NOMBRE,
            apellido: usuario.apellido || usuario.APELLIDO,
            identificacion: usuario.identificacion || usuario.IDENTIFICACION,
            correo: usuario.email || usuario.CORREO,
            imagen: usuario.imagen || usuario.URLIMAGE,
            ID_Rol: usuario.ID_Rol
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({ token: jwtToken, usuario });
};
