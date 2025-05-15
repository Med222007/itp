jest.mock('fs');
jest.mock('path');
jest.mock('../config/database', () => ({
    config: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'usuarios_itp',
    },
    connect: jest.fn(),
    end: jest.fn(),
    promise: jest.fn().mockReturnValue({
        query: jest.fn()
    }),
}));
jest.mock('../config/encryption', () => ({
    encrypt: jest.fn((data) => `encrypted(${data})`),
    decrypt: jest.fn((data) => data.replace('encrypted(', '').replace(')', ''))
}));
jest.mock('../config/pdfUtils', () => ({
    isPDFValid: jest.fn().mockResolvedValue(true),
    checkForMaliciousContent: jest.fn().mockResolvedValue(false),
    hasNoText: jest.fn().mockResolvedValue(true),
    hasExactlyTwoImages: jest.fn().mockResolvedValue(true)
}));


const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const controller = require('../controllers/usercontroller');
const UserModel = require('../models/userModel');
UserModel.obtenerPDF = jest.fn(); // Ahora sí puedes usar .mockResolvedValue()


describe('Controlador de PDFs', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------- subirPDF ----------
    describe('subirPDF', () => {
        it('debería devolver error si no hay archivo', async () => {
            const req = { file: null, body: { userData: '{}' } };
            const res = mockResponse();

            await controller.subirPDF(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "No se proporcionó ningún archivo PDF."
            });
        });

        it('debería subir el PDF correctamente', async () => {
            const req = {
                file: { buffer: Buffer.from('fake-pdf-content') },
                body: { userData: JSON.stringify({ id: 1 }) }
            };
            const res = mockResponse();
        
            const mockQuery = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);
            db.promise.mockReturnValue({ query: mockQuery });
        
            await controller.subirPDF(req, res);
        
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "PDF subido correctamente."
            });
        });
        
    });

    // ---------- eliminarPDF ----------
    describe('eliminarPDF', () => {
        it('debería eliminar un PDF si existe', async () => {
            const req = { params: { userId: 1 } };
            const res = mockResponse();

            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockReturnValue(true);

            db.promise.mockReturnValueOnce({
                query: jest.fn().mockResolvedValue([[{ pdf_path: 'ruta.pdf' }]])
            }).mockReturnValueOnce({
                query: jest.fn().mockResolvedValue([{ affectedRows: 1 }])
            });

            await controller.eliminarPDF(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "PDF eliminado correctamente."
            });
        });
    });

    // ---------- obtenerPDF ----------
    describe('obtenerPDF', () => {
        it('debería devolver un PDF cuando el modelo lo retorna correctamente', async () => {
            const req = {
                query: {
                    userId: 1,
                    identificacion: '123',
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    correo: 'juan@test.com'
                }
            };
    
            const res = {
                setHeader: jest.fn(),
                send: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            const fakeBuffer = Buffer.from('PDF_DATA');
            UserModel.obtenerPDF = jest.fn().mockResolvedValue(fakeBuffer); // Aquí está el fix
    
            await controller.obtenerPDF(req, res);
    
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
        });
    });
    
    
});

// Función auxiliar para simular `res`
function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
}
