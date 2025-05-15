
module.exports = () => ({
    resize: () => ({
      toBuffer: () => Promise.resolve(Buffer.from('mocked-image'))
    })
  });
  