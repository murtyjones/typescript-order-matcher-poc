export const limitProcess = jest.fn();

export const Limit = jest.fn().mockImplementation(() => {
  return { process: limitProcess };
});
