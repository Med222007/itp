const db = require("../config/database");
const mysqldump = require('mysqldump');
const fs = require('fs');
const path = require('path');

class DatabaseExport {
    static async exportDatabase() {
        try {
            const fileName = `database_export_${Date.now()}.sql`;
            const filePath = path.join(__dirname, `../../exports/${fileName}`);

            if (!fs.existsSync(path.join(__dirname, '../../exports'))) {
                fs.mkdirSync(path.join(__dirname, '../../exports'));
                console.log('Carpeta "exports" creada.');
            }

           

            await mysqldump({
                connection: {
                    host: db.config.host,
                    user: db.config.user,
                    password: db.config.password || '',
                    database: db.config.database,
                },
                dumpToFile: filePath,
            });

            console.log('Archivo de exportación creado en:', filePath);

            const fileStream = fs.createReadStream(filePath);
            fileStream.on('end', () => {
                fs.unlinkSync(filePath);
            });

            return fileStream;
        } catch (error) {
            console.error('Error al exportar la base de datos:', error.message);
            throw new Error(`Error al exportar la base de datos: ${error.message}`);
        }
    }
}

module.exports = DatabaseExport;