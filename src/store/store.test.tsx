import { Store, initialState } from './store';
import { user_click_increment_button } from './actions/user_click_increment_button';
import { user_click_increment_button_with_number } from './actions/user_click_increment_button_with_number';
import { initialize_application } from './asyncActions/initialize_application';
import { user_click_delay_decrement_button } from './asyncActions/user_click_delay_decrement_button';
import { user_click_delay_decrement_button_with_number } from './asyncActions/user_click_delay_decrement_button_with_number';

import * as API from 'apis/apis';
jest.mock('apis/apis');
const MockAPI = API as jest.Mocked<typeof API>;

const { testDispatchActions, testDispatchAsyncActions } = Store.testUtils;

test('actions', async () => {
  MockAPI.getDefaultCounter.mockResolvedValue(10);

  let state = await testDispatchAsyncActions(initialState, [initialize_application]);

  // user_click_increment_button
  state = testDispatchActions(state, [user_click_increment_button]);
  expect(state.counter).toBe(11);

  // user_click_increment_button_with_number
  state = testDispatchActions(state, [user_click_increment_button_with_number(10)]);
  expect(state.counter).toBe(21);

  // async: user_click_delay_decrement_button
  state = await testDispatchAsyncActions(state, [user_click_delay_decrement_button]);
  expect(state.counter).toBe(20);

  // async: user_click_delay_decrement_button_with_number
  state = await testDispatchAsyncActions(state, [
    user_click_delay_decrement_button_with_number(10),
  ]);
  expect(state.counter).toBe(10);
});
