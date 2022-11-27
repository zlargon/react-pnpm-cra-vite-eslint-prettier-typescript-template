import { renderTestStore } from './actionTestUtils';
import { IState, Store } from './store';
import { user_click_increment_button } from './actions/user_click_increment_button';
import { user_click_increment_button_with_number } from './actions/user_click_increment_button_with_number';
import { initialize_application } from './asyncActions/initialize_application';
import { user_click_delay_decrement_button } from './asyncActions/user_click_delay_decrement_button';
import { user_click_delay_decrement_button_with_number } from './asyncActions/user_click_delay_decrement_button_with_number';

import * as API from 'apis/apis';
jest.mock('apis/apis');
const MockAPI = API as jest.Mocked<typeof API>;

test('actions', async () => {
  type IActionNames =
    | 'user_click_increment_button'
    | 'user_click_increment_button_with_number'
    | 'initialize_application'
    | 'user_click_delay_decrement_button'
    | 'user_click_delay_decrement_button_with_number';

  const { expectState, dispatchAction } = renderTestStore<IState, IActionNames>({
    Store,
    actions: [user_click_increment_button],
    actionsWithParams: [user_click_increment_button_with_number],
    asyncActions: [initialize_application, user_click_delay_decrement_button],
    asyncActionsWithParams: [user_click_delay_decrement_button_with_number],
  });

  MockAPI.getDefaultCounter.mockResolvedValue(10);
  dispatchAction('initialize_application');
  await expectState((s) => {
    expect(s.isInitializing).toBe(false);
    expect(s.counter).toBe(10);
  });

  dispatchAction('user_click_increment_button');
  await expectState((s) => expect(s.counter).toBe(11));

  dispatchAction('user_click_increment_button_with_number', 10);
  await expectState((s) => expect(s.counter).toBe(21));

  dispatchAction('user_click_delay_decrement_button');
  await expectState((s) => expect(s.counter).toBe(20));

  dispatchAction('user_click_delay_decrement_button_with_number', 10);
  await expectState((s) => expect(s.counter).toBe(10));
});
