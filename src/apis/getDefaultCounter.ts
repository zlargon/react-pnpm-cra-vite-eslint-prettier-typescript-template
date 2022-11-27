import { delay } from 'utils/delay';

export const getDefaultCounter = async () => {
  await delay(1000);
  return 10;
};
