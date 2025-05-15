
global.Blob = function (content, options) {
  return { content, options };
};
jest.mock('../models/userModel.js');
jest.mock('../config/database', () => ({
  config: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'usuarios_itp',
  },
  connect: jest.fn(),
  end: jest.fn(),
}));

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../server');
require('dotenv').config();
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'mi_secreto_super_seguro'; // O el valor que usas en producción
const generarToken = (userId) => {
  const payload = {
    id: userId.toString(),
    nombre: "Prueba",
    ID_Rol: 2
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'mi_secreto_super_seguro', {
    expiresIn: '1h'
  });
};
const userId = 1;
const token = generarToken(userId);
const UserModel = require('../models/userModel');


UserModel.subirImagenYActualizarUsuario.mockImplementation(async (userId, imagenBlob) => {
  return {
    ID: userId,
    nombre: "Prueba",
    urlimage: "https://res.cloudinary.com/demo/image/upload/v123456/fotos-perfil/testimage.avif"
  };
});

UserModel.eliminarImagenYActualizarUsuario.mockImplementation(async (userId) => {
  return {
    ID: userId,
    nombre: "Prueba",
    urlimage: null
  };
});

describe('Test de imagen de perfil', () => {

  test('POST /api/usuarios/:userId/foto-perfil debe subir una imagen', async () => {
    const imagePath = path.resolve(__dirname, 'imagenes', 'imagen_de_prueba.jpg');
   

    const response = await request(app)
      .post(`/api/usuarios/${userId}/foto-perfil`)
      .set('Authorization', `Bearer ${token}`)
      .attach('imagen', imagePath, 'foto.jpg');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Foto de perfil actualizada correctamente.");
    expect(response.body.urlImagen).toContain("cloudinary");
  });

  test('POST /api/usuarios/:userId/foto-perfil sin imagen debería fallar', async () => {
    const response = await request(app)
      .post(`/api/usuarios/${userId}/foto-perfil`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("No se proporcionó ninguna imagen.");
  });

  test('DELETE /api/usuarios/:userId/foto-perfil debe eliminar imagen', async () => {
    const response = await request(app)
      .delete(`/api/usuarios/${userId}/foto-perfil`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Imagen de perfil eliminada correctamente.");
    expect(response.body.usuario.urlimage).toBeNull();
  });
});
