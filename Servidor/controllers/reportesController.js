const ReportesModel = require('../models/reportesModel');
const ExcelJS = require('exceljs'); // Para generar Excel
const PdfPrinter = require('pdfmake'); // Para generar PDF

// Definir las fuentes
const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};
const printer = new PdfPrinter(fonts);
// Controlador para exportar el reporte de reservas por usuario
exports.exportarReservasUsuario = async (req, res) => {
    const { identificacion } = req.params;
    const format = req.query.format; // Formato: excel o pdf

    try {
        // Validar que la identificación no esté vacía
        if (!identificacion) {
            return res.status(400).json({ success: false, message: "La identificación no puede estar vacía." });
        }

        // Verificar si la identificación existe
        const existe = await ReportesModel.verificarIdentificacion(identificacion);

        if (!existe) {
            return res.status(200).json({ success: false, message: "El usuario no existe." });
        }

        // Obtener las reservas del usuario por su identificación
        const reservas = await ReportesModel.ReporteReservaId(identificacion);

        if (reservas.length === 0) {
            return res.status(200).json({ success: false, message: "No se encontraron reservas para este usuario." });
        }

        // Exportar en Excel
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reservas');

            // Añadir encabezados
            worksheet.columns = [
                { header: 'ID Reserva', key: 'id_reserva', width: 15, style: { font: { bold: true } } },
                { header: 'Fecha y Hora', key: 'fecha_hora', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm' } },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Nombre', key: 'nombre', width: 20 },
                { header: 'Apellido', key: 'apellido', width: 20 },
                { header: 'Correo', key: 'correo', width: 30 },
            ];

            // Añadir datos
            reservas.forEach((reserva) => {
                worksheet.addRow([
                    reserva.ID_Reserva,
                    reserva.Fecha_hora,
                    reserva.Estado,
                    reserva.NOMBRE,
                    reserva.APELLIDO,
                    reserva.CORREO,
                ]);
            });

            // Autoajustar columnas
            worksheet.columns.forEach((column) => {
                column.width = column.header.length < 12 ? 12 : column.header.length;
            });

            // Escribir el archivo en un buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Enviar el archivo como respuesta
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader('Content-Disposition', 'attachment; filename=ReservasUsuario.xlsx');
            return res.send(buffer);
        }
        // Exportar en PDF
        else if (format === 'pdf') {
            const docDefinition = {
                content: [
                    { text: 'Reporte de Reservas por Usuario', style: 'header' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'ID Reserva', style: 'tableHeader' },
                                    { text: 'Fecha y Hora', style: 'tableHeader' },
                                    { text: 'Estado', style: 'tableHeader' },
                                    { text: 'Nombre', style: 'tableHeader' },
                                    { text: 'Apellido', style: 'tableHeader' },
                                    { text: 'Correo', style: 'tableHeader' },
                                ],
                                ...reservas.map((reserva) => [
                                    reserva.ID_Reserva,
                                    reserva.Fecha_hora,
                                    reserva.Estado,
                                    reserva.NOMBRE,
                                    reserva.APELLIDO,
                                    reserva.CORREO,
                                ]),
                            ],
                        },
                        layout: {
                            fillColor: (rowIndex) => (rowIndex === 0 ? '#CCCCCC' : null), // Color de fondo para el encabezado
                        },
                    },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10],
                        alignment: 'center',
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black',
                        fillColor: '#CCCCCC', // Color de fondo para el encabezado de la tabla
                    },
                },
                defaultStyle: {
                    font: 'Helvetica',
                },
            };
            const printer = new PdfPrinter(fonts);
            // Generar el PDF usando la instancia de PdfPrinter ya configurada
            const pdfDoc = printer.createPdfKitDocument(docDefinition);

            // Enviar el archivo como respuesta
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=ReservasUsuario.pdf');
            pdfDoc.pipe(res);
            pdfDoc.end();
        }
        // Formato no válido
        else {
            return res.status(400).json({ success: false, message: "Formato no válido. Use 'excel' o 'pdf'." });
        }
    } catch (error) {
        console.error("Error al obtener las reservas o exportar el reporte:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
};

exports.exportarReporteGeneral = async (req, res) => {
    const { tipo } = req.params;
    const format = req.query.format || 'excel';

    try {
        let resultados = [];
        let columnas = [];

        switch (tipo) {
            case 'usuarios-mayor-promedio':
                resultados = await ReportesModel.usuariosConMasReservasQueElPromedio();
                columnas = [
                    { header: 'Nombre', key: 'NOMBRE', width: 20 },
                    { header: 'Apellido', key: 'APELLIDO', width: 20 },
                    { header: 'Correo', key: 'CORREO', width: 30 },
                    { header: 'Total Reservas', key: 'total_reservas', width: 15 }
                ];
                break;

            case 'fechas-multiples':
                resultados = await ReportesModel.fechasConMultiplesReservas();
                columnas = [
                    { header: 'Fecha', key: 'fecha', width: 20 },
                    { header: 'Cantidad de Reservas', key: 'cantidad_reservas', width: 25 }
                ];
                break;

            case 'sin-notificaciones':
                resultados = await ReportesModel.usuariosSinNotificaciones();
                columnas = [
                    { header: 'Nombre', key: 'NOMBRE', width: 20 },
                    { header: 'Apellido', key: 'APELLIDO', width: 20 },
                    { header: 'Correo', key: 'CORREO', width: 30 }
                ];
                break;

            case 'Rol-con-mas-reservas':
                resultados = await ReportesModel.rolConMasReservas();
                columnas = [
                    { header: 'Rol', key: 'Rol', width: 25 },
                    { header: 'Total de Reservas', key: 'Total_reservas', width: 25 }
                ];
                break;

            default:
                return res.status(400).json({ success: false, message: "Tipo de reporte no válido." });
        }

        if (resultados.length === 0) {
            return res.status(200).json({ success: false, message: "No se encontraron datos para este reporte." });
        }

        // 📤 Exportar en Excel
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte');

            worksheet.columns = columnas;
            resultados.forEach((row) => {
                worksheet.addRow(row);
            });

            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Reporte_${tipo}.xlsx`);
            return res.send(buffer);
        }

        // 🧾 Exportar en PDF
        if (format === 'pdf') {
            const headers = columnas.map(col => ({ text: col.header, style: 'tableHeader' }));
            const body = [headers];

            resultados.forEach((row) => {
                const dataRow = columnas.map(col => row[col.key]);
                body.push(dataRow);
            });

            const docDefinition = {
                content: [
                    { text: `Reporte: ${tipo.replace(/-/g, ' ')}`, style: 'header' },
                    {
                        table: { headerRows: 1, body },
                        layout: { fillColor: (rowIndex) => rowIndex === 0 ? '#CCCCCC' : null }
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
                    tableHeader: { bold: true, fontSize: 12, color: 'black' }
                },
                defaultStyle: { font: 'Helvetica' }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Reporte_${tipo}.pdf`);
            pdfDoc.pipe(res);
            pdfDoc.end();
        } else {
            return res.status(400).json({ success: false, message: "Formato no válido. Usa 'excel' o 'pdf'." });
        }

    } catch (error) {
        console.error("Error al generar el reporte:", error);
        res.status(500).json({ success: false, message: "Error en el servidor." });
    }
};
