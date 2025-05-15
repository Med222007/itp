jest.mock('../models/userModel'); // Simulamos el módulo
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
const userController = require('../controllers/userController');
const UserModel = require('../models/userModel'); // Importamos el modelo de usuario



// Mock de req y res
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('userController.loginUser', () => {
    it('debería retornar 400 si el ID no es un número', async () => {
        const req = { body: { identificacion: "abc", contrasena: "1234" } };
        const res = mockResponse();

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "El ID debe ser un número" });
    });

    it('debería retornar 401 si el usuario no existe', async () => {
        UserModel.getUserById.mockResolvedValue(null);

        const req = { body: { identificacion: "123", contrasena: "1234" } };
        const res = mockResponse();

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Credenciales no existentes o incorrectas" });
    });

    it('debería retornar 401 si la contraseña es incorrecta', async () => {
        const mockUsuario = {
            verificarContrasena: jest.fn().mockResolvedValue(false)
        };
        UserModel.getUserById.mockResolvedValue(mockUsuario);

        const req = { body: { identificacion: "123", contrasena: "incorrecta" } };
        const res = mockResponse();

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Credenciales incorrectas" });
    });

    it('debería retornar 200 con un token si el login es exitoso', async () => {
        const mockUsuario = {
            id: 1,
            identificacion: "123",
            ID_Rol: 2,
            nombre: "Juan",
            apellido: "Pérez",
            urlImage: "img.jpg",
            verificarContrasena: jest.fn().mockResolvedValue(true)
        };

        UserModel.getUserById.mockResolvedValue(mockUsuario);

        process.env.JWT_SECRET = "testsecret";
        process.env.JWT_EXPIRES_IN = "1h";

        const req = { body: { identificacion: "123", contrasena: "correcta" } };
        const res = mockResponse();

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].token).toBeDefined(); // Verifica que haya un token
    });
});

describe('userController.obtenerUsuarioPorId', () => {
    it('debería retornar el usuario si existe', async () => {
        const mockUsuario = {
            id: 1,
            nombre: "Carlos",
            apellido: "Lopez"
        };

        UserModel.getUserInfoById.mockResolvedValue(mockUsuario);

        const req = { params: { id: "1" } };
        const res = mockResponse();

        await userController.obtenerUsuarioPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUsuario });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
        UserModel.getUserInfoById.mockResolvedValue(null);

        const req = { params: { id: "99" } };
        const res = mockResponse();

        await userController.obtenerUsuarioPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Usuario no encontrado" });
    });

    it('debería retornar 500 si hay un error', async () => {
        UserModel.getUserInfoById.mockRejectedValue(new Error("Fallo DB"));
        console.error = jest.fn(); 

        const req = { params: { id: "1" } };
        const res = mockResponse();

        await userController.obtenerUsuarioPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Error al obtener el usuario" });
    });
});
