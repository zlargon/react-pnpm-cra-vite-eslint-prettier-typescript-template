import { delay } from './delay';

test('delay', async () => {
  const startTime = Date.now();
  await delay(1000);
  const endTime = Date.now();

  expect(endTime - startTime).toBeGreaterThanOrEqual(999);
});
