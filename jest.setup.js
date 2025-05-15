jest.mock('sharp', () => () => ({
    resize: () => ({
      toFormat: () => ({
        toBuffer: async () => Buffer.from('fake-image'),
      }),
    }),
  }));
  