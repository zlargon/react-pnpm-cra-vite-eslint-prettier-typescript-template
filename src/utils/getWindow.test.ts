import getWindow from './getWindow';

test('window smoke test', () => {
  const window = getWindow();
  expect(window).toBe(global.window);
});
