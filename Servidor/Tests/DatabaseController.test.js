jest.mock('../models/databaseExport');
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

const DatabaseController = require('../controllers/databaseController');
const DatabaseExport = require('../models/databaseExport');
const { Readable } = require('stream');

describe('DatabaseController.exportDatabase', () => {
  afterAll(() => {
    const db = require('../config/database');
    if (typeof db.end === 'function') {
      db.end(); // Cerramos la conexión abierta para que Jest termine correctamente
    }
  });

  it('debería exportar correctamente la base de datos', async () => {
    const mockStream = new Readable();
    mockStream._read = () => {};

    setTimeout(() => {
      mockStream.push('contenido simulado');
      mockStream.push(null); // Finaliza el stream
    }, 10);

    DatabaseExport.exportDatabase.mockResolvedValue(mockStream);

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockStream.pipe = jest.fn().mockImplementation(() => {
      mockStream.emit('end');
      return res;
    });

    await DatabaseController.exportDatabase({}, res);

    expect(DatabaseExport.exportDatabase).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/sql');
    expect(res.setHeader).toHaveBeenCalledWith(
      expect.stringContaining('Content-Disposition'),
      expect.stringMatching(/^attachment; filename=database_export_\d+\.sql$/)
    );
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
  });

  it('debería manejar errores al exportar la base de datos', async () => {
    DatabaseExport.exportDatabase.mockRejectedValue(new Error('Error simulado'));

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    console.error = jest.fn();

    await DatabaseController.exportDatabase({}, res);

    expect(DatabaseExport.exportDatabase).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error al exportar la base de datos');
  });
});
