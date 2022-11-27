import { render, screen } from '@testing-library/react';
import * as API from 'apis/apis';
import App from './App';

jest.mock('apis/apis');
const MockAPI = API as jest.Mocked<typeof API>;
MockAPI.getDefaultCounter.mockResolvedValue(10);

test('renders react app', async () => {
  render(<App />);
  await screen.findByText(/Counter/i);
});
