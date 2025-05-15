const DatabaseExport = require('../models/databaseExport');


class DatabaseController {
    // Método para manejar la exportación de la base de datos
    static async exportDatabase(req, res) {
        try {
            // Obtener el stream del archivo de exportación
            const fileStream = await DatabaseExport.exportDatabase();

            // Configurar las cabeceras de la respuesta
            res.setHeader('Content-Type', 'application/sql');
            res.setHeader('Content-Disposition', `attachment; filename=database_export_${Date.now()}.sql`);

            // Enviar el archivo al cliente
            fileStream.pipe(res);
        } catch (error) {
            console.error('Error en el endpoint de exportación:', error);
            res.status(500).send('Error al exportar la base de datos');
        }
    }
}

module.exports = DatabaseController;