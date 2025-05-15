jest.mock('mysqldump', () => {
  return jest.fn().mockResolvedValue();
});
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
jest.mock('../models/notificacionModel');
jest.mock('../middlewares/authMiddleware', () => ({
  verificarToken: (req, res, next) => next()
}));


const request = require('supertest');
const express = require('express');
const notificacionRoutes = require('../routes/notificacionRoutes');
const Notificacion = require('../models/notificacionModel');
const app = express();
app.use(express.json());
app.use('/', notificacionRoutes);


describe('Controlador de Notificaciones', () => {

  describe('POST /notificaciones', () => {
    it('debería crear una nueva notificación', async () => {
      Notificacion.agregarNotificacion.mockResolvedValue(123); // ID de prueba

      const response = await request(app)
        .post('/notificaciones')
        .send({
          mensaje: 'Prueba',
          id_usuario: 1,
          fecha: '2025-04-05'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Notificación creada con éxito',
        id_notificacion: 123
      });
    });

    it('debería manejar errores al agregar notificación', async () => {
      Notificacion.agregarNotificacion.mockRejectedValue(new Error('Error'));

      const response = await request(app)
        .post('/notificaciones')
        .send({
          mensaje: 'Fallo',
          id_usuario: 1,
          fecha: '2025-04-05'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error al agregar la notificación' });
    });
  });

  describe('GET /notificaciones/:id', () => {
    it('debería obtener las notificaciones del usuario', async () => {
      const notificaciones = [
        { id: 1, mensaje: 'Hola', id_usuario: 1, fecha: '2025-04-05' },
        { id: 2, mensaje: 'Mundo', id_usuario: 1, fecha: '2025-04-04' }
      ];
      Notificacion.obtenerNotificaciones.mockResolvedValue(notificaciones);

      const response = await request(app).get('/notificaciones/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(notificaciones);
    });

    it('debería manejar errores al obtener notificaciones', async () => {
      Notificacion.obtenerNotificaciones.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/notificaciones/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error al obtener las notificaciones' });
    });
  });
  
  

});
