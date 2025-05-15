const mockAddRow = jest.fn();
const mockWriteBuffer = jest.fn().mockResolvedValue(Buffer.from('Excel data'));

const worksheetMock = {
  addRow: mockAddRow,
  columns: []
};

const workbookMock = {
  addWorksheet: jest.fn(() => worksheetMock),
  xlsx: {
    writeBuffer: mockWriteBuffer
  }
};

module.exports = {
  Workbook: jest.fn(() => workbookMock)
};
