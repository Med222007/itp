const multer = require('multer');

// Configura Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const imageFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true); // Aceptar el archivo
    } else {
        const error = new Error('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y GIF.');
        error.uploadType = 'image'; // Agregar propiedad personalizada
        cb(error, false); // Rechazar el archivo
    }
};

// Filtro para aceptar solo PDF
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Aceptar el archivo
    } else {
        const error = new Error('Tipo de archivo no permitido. Solo se aceptan PDF.');
        error.uploadType = 'pdf'; // Agregar propiedad personalizada
        cb(error, false); // Rechazar el archivo
    }
};

// Configura Multer con el almacenamiento y el filtro
const uploadImages = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Límite de 2MB
});

// Configura Multer para PDF
const uploadPDF = multer({
    storage: storage,
    fileFilter: pdfFilter,
    limits: { fileSize: 1 * 1024 * 1024 } // Límite de 1MB
});

module.exports = { uploadImages, uploadPDF };

