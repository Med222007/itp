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
jest.mock('../models/rolModel');

const { getRolById } = require('../controllers/rolController');
const Rol = require('../models/rolModel');


describe('getRolById Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id_rol: 1 } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    
    };
  });

  it('debería devolver el rol si se encuentra', async () => {
    Rol.getRolById.mockResolvedValue('Administrador');

    await getRolById(req, res);

    expect(Rol.getRolById).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ rol: 'Administrador' });
  });

  it('debería devolver 404 si no se encuentra el rol', async () => {
    Rol.getRolById.mockResolvedValue(null);

    await getRolById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Rol no encontrado');
  });

  it('debería manejar errores de forma adecuada', async () => {
    const error = new Error('DB Error');
    Rol.getRolById.mockRejectedValue(error);

    console.error = jest.fn(); // para evitar spam en la consola

    await getRolById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener el rol.",
      error: error.message
    });
  });
});
