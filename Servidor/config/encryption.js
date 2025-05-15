const crypto = require('crypto');

const IV_LENGTH = 16; // Longitud del vector de inicialización

// Función para generar una clave dinámica basada en el usuario
function generateEncryptionKey(userData) {
    // Usar datos únicos y consistentes del usuario
    const baseKey = [
        userData.id,
        userData.identificacion,
        userData.nombre,
        userData.apellido
    ].join('|');

    return crypto.createHash('sha256').update(baseKey).digest();
}

// Función para encriptar
function encrypt(text, userData) {
    const encryptionKey = generateEncryptionKey(userData);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Hash de validación 
    const validationData = [
        userData.id,
        userData.identificacion,
        userData.nombre,
        userData.apellido
    ].join('|');

    const validationHash = crypto.createHash('sha256')
        .update(validationData)
        .digest('hex')
        .substring(0, 16);

    
    const encryptedResult = `${iv.toString('hex')}:${validationHash}:${encrypted}`;

    return encryptedResult;
}

// Función para desencriptar
function decrypt(text,userData) {
    if (!text) {
        return { success: false, error: "Texto encriptado no proporcionado" };
    }

    // Dividir el texto en sus componentes
    const parts = text.split(':');
    if (parts.length !== 3) {
        return { success: false, error: "Formato de texto encriptado incorrecto" };
    }

    const [ivHex, originalValidationHash, encryptedText] = parts;
  
    // 1. Primero validar las credenciales antes de intentar desencriptar
      // Hash de validación 
      const validationHash = [
        userData.id,
        userData.identificacion,
        userData.nombre,
        userData.apellido
    ].join('|');

   
    const currentValidationHash = crypto.createHash('sha256').update(validationHash).digest('hex').substring(0, 16);
    console.log("hash usuario actual " + currentValidationHash)
    console.log("hash usuario que encrypto " + originalValidationHash)

    if (currentValidationHash !== originalValidationHash) {
        return {
            success: false,
            error: "Credenciales erróneas para descifrar este documento",
            code: "INVALID_CREDENTIALS"
        };
    }

    // 2. Si las credenciales son válidas, proceder con la desencriptación
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const encryptionKey = generateEncryptionKey(userData);
        const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return { success: true, data: decrypted };
    } catch (error) {
        return {
            success: false,
            error: "Error al desencriptar el documento",
            details: error.message
        };
    }
}

module.exports = { encrypt, decrypt };