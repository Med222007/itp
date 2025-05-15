const multer = require("multer");

const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            if (err.field === "imagen") {
                return res.status(200).json({ success: false, message: "La imagen es demasiado grande. El tamaño máximo permitido es 2 MB." });
            } else if (err.field === "pdf") {
                return res.status(200).json({ success: false, message: "El PDF es demasiado grande. El tamaño máximo permitido es 1 MB." });
            }
        }
        return res.status(200).json({ success: false, message: err.message });
    } else if (err) {
        if (err.uploadType === "imagen") {
            return res.status(200).json({ success: false, message: err.message });
        } else if (err.uploadType === "pdf") {
            return res.status(200).json({ success: false, message: err.message });
        }
        return res.status(200).json({ success: false, message: err.message });
    }
    next();
};

module.exports = errorHandler;
