jest.mock('../config/database', () => ({
    config: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'usuarios_itp',
    },
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  }));
jest.mock('../models/notificacionModel');

const Reserva = require('../models/reservaModel');
const db = require('../config/database');
const Notificacion = require('../models/notificacionModel');




describe('Modelo Reserva', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('crearReserva', () => {
        it('debería lanzar error si el usuario ya tiene una reserva ese día', async () => {
            jest.spyOn(Reserva, 'contarReservasDelUsuarioPorFecha').mockResolvedValue(1);
            await expect(
                Reserva.crearReserva('2025-04-10 10:00:00', 1, 'Usuario')
            ).rejects.toThrow('Ya tienes una reserva para este día.');
        });

        it('debería crear una reserva si no tiene ninguna previa', async () => {
            jest.spyOn(Reserva, 'contarReservasDelUsuarioPorFecha').mockResolvedValue(0);
            db.query.mockImplementation((query, params, callback) => {
                callback(null, { insertId: 123 });
            });

            const result = await Reserva.crearReserva('2025-04-10 10:00:00', 1, 'Usuario');
            expect(result).toBe(123);
        });
    });

    describe('cancelarReserva', () => {
        it('debería cancelar una reserva existente', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null, { affectedRows: 1 });
            });

            const result = await Reserva.cancelarReserva(1);
            expect(result).toBe(1);
        });
    });

    describe('obtenerReservasPorFecha', () => {
        it('debería devolver las reservas para una fecha dada', async () => {
            const mockReservas = [{ ID_Reserva: 1, Estado: 'reservado' }];
            db.query.mockImplementation((query, params, callback) => {
                callback(null, mockReservas);
            });

            const result = await Reserva.obtenerReservasPorFecha('2025-04-10');
            expect(result).toEqual(mockReservas);
        });
    });

    describe('obtenerDiasCompletamenteReservados', () => {
        it('debería devolver los días con 17 o más reservas', async () => {
            const mockDias = [{ fecha: '2025-04-10', count: 17 }];
            db.query.mockImplementation((query, callback) => {
                callback(null, mockDias);
            });

            const result = await Reserva.obtenerDiasCompletamenteReservados();
            expect(result).toEqual(mockDias);
        });
    });

    describe('contarReservasDelUsuarioPorFecha', () => {
        it('debería retornar 0 si el usuario es administrador', async () => {
            const result = await Reserva.contarReservasDelUsuarioPorFecha(1, '2025-04-10', 'Administrador');
            expect(result).toBe(0);
        });

        it('debería contar reservas si es usuario', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null, [{ count: 1 }]);
            });

            const result = await Reserva.contarReservasDelUsuarioPorFecha(1, '2025-04-10', 'Usuario');
            expect(result).toBe(0);
        });
    });

    describe('obtenerReservaPorId', () => {
        it('debería devolver la reserva si existe', async () => {
            const mockReserva = [{ ID_Reserva: 1, Fecha_hora: '2025-04-10 10:00:00' }];
            db.query.mockImplementation((query, params, callback) => {
                callback(null, mockReserva);
            });

            const result = await Reserva.obtenerReservaPorId(1);
            expect(result).toEqual(mockReserva[0]);
        });

        it('debería devolver null si no existe', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null, []);
            });

            const result = await Reserva.obtenerReservaPorId(99);
            expect(result).toBeNull();
        });
    });

    describe('reservarTodoElDia', () => {
        it('debería cancelar reservas existentes y crear nuevas', async () => {
            // Simular reservas existentes
            jest.spyOn(Reserva, 'obtenerReservasPorFecha').mockResolvedValue([
                { ID_Reserva: 1, Fecha_hora: '2025-04-10 10:00:00', Persona_id: 2, Estado: 'reservado' },
                { ID_Reserva: 2, Fecha_hora: '2025-04-10 11:00:00', Persona_id: 3, Estado: 'cancelado' }
            ]);

            jest.spyOn(Reserva, 'cancelarReserva').mockResolvedValue(1);
            jest.spyOn(Reserva, 'crearReserva').mockResolvedValue(1);
            Notificacion.agregarNotificacion.mockResolvedValue();

            const result = await Reserva.reservarTodoElDia('2025-04-10', 1, 'Administrador');

            expect(result.reservasCanceladas).toBe(1);
            expect(result.reservasExitosas).toBeGreaterThan(0);
        });
    });

});


