jest.mock('../models/reportesModel');
jest.mock('exceljs');
jest.mock('pdfmake', () => {
    return jest.fn().mockImplementation(() => ({
        createPdfKitDocument: jest.fn(() => ({
            pipe: jest.fn(),
            end: jest.fn()
        }))
    }));
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



const reportesController = require('../controllers/reportesController');
const ReportesModel = require('../models/reportesModel');
const ExcelJS = require('exceljs');


// Mock de respuesta y request
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn();
    res.send = jest.fn();
    res.end = jest.fn();
    res.pipe = jest.fn();
    res.write = jest.fn().mockReturnValue(res);
    return res;
};

describe('exportarReservasUsuario', () => {
    const reqBase = {
        params: { identificacion: '123456' },
        query: { format: 'excel' }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería retornar error si la identificación está vacía', async () => {
        const req = { ...reqBase, params: { identificacion: '' } };
        const res = mockResponse();

        await reportesController.exportarReservasUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "La identificación no puede estar vacía.",
        });
    });

    it('debería retornar error si la identificación no existe', async () => {
        ReportesModel.verificarIdentificacion.mockResolvedValue(false);
        const res = mockResponse();

        await reportesController.exportarReservasUsuario(reqBase, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "El usuario no existe.",
        });
    });

    it('debería retornar mensaje si no hay reservas para el usuario', async () => {
        ReportesModel.verificarIdentificacion.mockResolvedValue(true);
        ReportesModel.ReporteReservaId.mockResolvedValue([]);
        const res = mockResponse();

        await reportesController.exportarReservasUsuario(reqBase, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No se encontraron reservas para este usuario.",
        });
    });

    it('debería exportar reservas en Excel', async () => {
        const reservas = [{
            ID_Reserva: 1,
            Fecha_hora: new Date(),
            Estado: 'Confirmado',
            NOMBRE: 'Juan',
            APELLIDO: 'Pérez',
            CORREO: 'juan@example.com'
        }];

        const bufferMock = Buffer.from('Excel data');

        ReportesModel.verificarIdentificacion.mockResolvedValue(true);
        ReportesModel.ReporteReservaId.mockResolvedValue(reservas);

        const worksheetMock = {
            addRow: jest.fn(),
            columns: [],
        };
        const workbookMock = {
            addWorksheet: jest.fn().mockReturnValue(worksheetMock),
            xlsx: { writeBuffer: jest.fn().mockResolvedValue(bufferMock) },
        };

        ExcelJS.Workbook.mockImplementation(() => workbookMock);

        const res = mockResponse();
        await reportesController.exportarReservasUsuario(reqBase, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            'attachment; filename=ReservasUsuario.xlsx'
        );
        expect(res.send).toHaveBeenCalledWith(bufferMock);
    });

    it('debería exportar reservas en PDF', async () => {
        const reservas = [{
            ID_Reserva: 1,
            Fecha_hora: new Date().toISOString(),
            Estado: 'Confirmado',
            NOMBRE: 'Juan',
            APELLIDO: 'Pérez',
            CORREO: 'juan@example.com'
        }];
    
        ReportesModel.verificarIdentificacion.mockResolvedValue(true);
        ReportesModel.ReporteReservaId.mockResolvedValue(reservas);
    
        const pipeMock = jest.fn();
        const endMock = jest.fn();
        const createPdfKitDocumentMock = jest.fn(() => ({
            pipe: pipeMock,
            end: endMock,
        }));
    
        // Sobrescribimos implementación de PdfPrinter (ya fue mockeado arriba)
        const PdfPrinter = require('pdfmake');
        PdfPrinter.mockImplementation(() => ({
            createPdfKitDocument: createPdfKitDocumentMock,
        }));
    
        const req = { ...reqBase, query: { format: 'pdf' } };
        const res = mockResponse();
    
        await reportesController.exportarReservasUsuario(req, res);
    
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=ReservasUsuario.pdf');
        expect(pipeMock).toHaveBeenCalledWith(res);
        expect(endMock).toHaveBeenCalled();
    });
    it('debería retornar error si el formato es inválido', async () => {
        ReportesModel.verificarIdentificacion.mockResolvedValue(true);
        ReportesModel.ReporteReservaId.mockResolvedValue([{ ID_Reserva: 1 }]);

        const req = { ...reqBase, query: { format: 'invalido' } };
        const res = mockResponse();

        await reportesController.exportarReservasUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Formato no válido. Use 'excel' o 'pdf'.",
        });
    });
});
