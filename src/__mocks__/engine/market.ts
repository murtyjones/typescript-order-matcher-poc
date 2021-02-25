export const marketProcess = jest.fn();

export const Market = jest.fn().mockImplementation(() => {
  return { process: marketProcess };
});
