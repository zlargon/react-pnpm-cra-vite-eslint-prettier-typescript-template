import { render, screen } from '@testing-library/react';
import User from '@testing-library/user-event';
import * as API from 'apis/apis';
import App from './App';

jest.mock('apis/apis');
const MockAPI = API as jest.Mocked<typeof API>;

// mock console
/* eslint-disable no-console */
jest.spyOn(console, 'log').mockImplementation(jest.fn());
jest.spyOn(console, 'group').mockImplementation(jest.fn());
jest.spyOn(console, 'groupEnd').mockImplementation(jest.fn());

const expectCounterToBe = async (value: number) => {
  const counterElement = await screen.findByTestId('counter');
  expect(counterElement).toHaveTextContent(String(value));
};

test('init app failed', async () => {
  MockAPI.getDefaultCounter.mockRejectedValue(new Error('Network Error'));
  render(<App />);
  await expectCounterToBe(0);
});

test('init app and click buttons', async () => {
  MockAPI.getDefaultCounter.mockResolvedValue(10);
  render(<App />);
  await expectCounterToBe(10);

  const incrementBtn1 = screen.getByTestId('increment-btn-1');
  User.click(incrementBtn1);
  await expectCounterToBe(11);

  const incrementBtn2 = screen.getByTestId('increment-btn-2');
  User.click(incrementBtn2);
  await expectCounterToBe(13);

  const decrementBtn1 = screen.getByTestId('decrement-btn-1');
  User.click(decrementBtn1);
  await expectCounterToBe(12);

  const decrementBtn2 = screen.getByTestId('decrement-btn-2');
  User.click(decrementBtn2);
  await expectCounterToBe(9);
});
