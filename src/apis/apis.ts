import { delay } from 'utils/delay';

export const getDefaultCounter = async () => {
  await delay(1000);
  return 10;
};

export const decreaseCounter = async (num?: number) => {
  // update counter to server
  await delay(500);
};
