const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const pdfjsLib = require('pdfjs-dist');

// Configuración para Node.js
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');


// Función para extraer imágenes del PDF
async function extractImagesFromPDF(pdfBuffer) {
    const images = [];

    // Convertir Buffer a Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ops = await page.getOperatorList();

        for (let j = 0; j < ops.fnArray.length; j++) {
            const op = ops.fnArray[j];
            if (op === pdfjsLib.OPS.paintImageXObject) {
                const imageIndex = ops.argsArray[j][0];
                const image = await page.objs.get(imageIndex);
                images.push(image);
            }
        }
    }

    console.log("Total de imágenes detectadas:", images.length);
    return images;
}

// Validar que el PDF contenga exactamente dos imágenes
async function hasExactlyTwoImages(pdfBuffer) {
    const images = await extractImagesFromPDF(pdfBuffer);
    return images.length === 2;
}

// Función para verificar contenido malicioso (enlaces)
async function checkForMaliciousContent(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Buscar enlaces o patrones sospechosos
    const linkRegex = /https?:\/\/[^\s]+/g;
    const hasLinks = linkRegex.test(text);

    return hasLinks;
}


// Validar que el PDF no esté dañado
async function isPDFValid(pdfBuffer) {
    try {
        await PDFDocument.load(pdfBuffer);
        return true;
    } catch (error) {
        return false;
    }
}

// Validar que el PDF no contenga texto
async function hasNoText(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    return data.text.trim().length === 0;
}

// Exportar las funciones
module.exports = {extractImagesFromPDF,checkForMaliciousContent,hasExactlyTwoImages,isPDFValid,hasNoText,};