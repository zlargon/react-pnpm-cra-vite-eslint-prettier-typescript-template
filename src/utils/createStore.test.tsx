import type { Dispatch } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import User from '@testing-library/user-event';
import { createStore, debugStore } from './createStore';
import { delay } from './delay';

// mock console
/* eslint-disable no-console */
const groupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(jest.fn());
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
jest.spyOn(console, 'groupEnd').mockImplementation(jest.fn());
jest.spyOn(console, 'log').mockImplementation(jest.fn());

// Records of the component rendering times
const renderTimes = {
  app: 0,
  counter: 0,
};

// =============================================================================
// State & Types & Store
// =============================================================================
const initialState = { count: 0 };
type IState = typeof initialState;
type IAction = (state: IState) => void;
type IAsyncAction = (dispatch: Dispatch<IAction>) => Promise<void>;
const Store = createStore<IState>(initialState);

// =============================================================================
// Actions (3)
// =============================================================================
const increase_1: IAction = (s) => {
  s.count++;
};

// prettier-ignore
const increase_number = (num: number): IAction => (s) => {
  s.count += num;
};

// prettier-ignore
const increase_number_with_action_name = (num: number): IAction => function increase_number(s) {
  s.count += num;
};

// =============================================================================
// Async Actions (3)
// =============================================================================
const increase_6_later: IAsyncAction = async (dispatch) => {
  await delay(500);
  dispatch(function increase_6(s) {
    s.count += 6;
  });
};

// prettier-ignore
const increase_number_later = (num: number): IAsyncAction => async (dispatch) => {
  await delay(500);
  dispatch((s) => {
    s.count += num;
  });
};

// prettier-ignore
const increase_number_later_with_action_name = (num: number): IAsyncAction => async (dispatch) => {
  await delay(500);
  dispatch(function increase_number(s) {
    s.count += num;
  });
};

// =============================================================================
// Component
// =============================================================================
// Counter Component
const Counter: React.FC = () => {
  renderTimes.counter++; // update the render times

  const count = Store.useSelector((s) => s.count);
  return <div data-testid="counter">{count}</div>;
};

// App Component
const App: React.FC = () => {
  renderTimes.app++; // update the render times

  const dispatch = Store.useDispatch();
  return (
    <div>
      <Counter />
      {/* +1 */}
      <button onClick={() => dispatch(increase_1)}>+1</button>

      {/* +2 */}
      <button onClick={() => dispatch(increase_number(2))}>+2</button>

      {/* +3 */}
      <button onClick={() => dispatch(increase_number_with_action_name(3))}>+3</button>

      {/* +4 */}
      <button
        onClick={() =>
          dispatch((s) => {
            s.count += 4;
          })
        }
      >
        +4
      </button>

      {/* +5 */}
      <button
        onClick={() => {
          dispatch(function increase_5(s) {
            s.count += 5;
          });
        }}
      >
        +5
      </button>

      {/* +6 after 500ms */}
      <button onClick={() => increase_6_later(dispatch)}>+6</button>

      {/* +7 after 500ms */}
      <button onClick={() => increase_number_later(7)(dispatch)}>+7</button>

      {/* +8 after 500ms */}
      <button onClick={() => increase_number_later_with_action_name(8)(dispatch)}>+8</button>
    </div>
  );
};

// =============================================================================
// Test
// =============================================================================
test('createStore', async () => {
  render(
    <Store.Provider>
      <App />
    </Store.Provider>,
  );

  const clickButton = (text: string): void => {
    User.click(screen.getByText(text));
  };

  // expect action update the state correctly
  const expectCounterNumberToBe = (num: number): void => {
    const counter = screen.getByTestId('counter');
    expect(counter).toHaveTextContent(num.toString());
  };

  // performance testing: should not render whole react app
  const expectCounterRenderTimesToBe = (times: number): void => {
    expect(renderTimes.app).toBe(1); // app component should never re-render
    expect(renderTimes.counter).toBe(times);
  };

  // check the missing action name
  const expectToShowActionWarning = (num: number): void => {
    expect(console.warn).toBeCalledTimes(num);
    if (num === 0) return; // no warnings

    const msg = '[Store] Action name is missing. You should always give a name for the action.';
    expect(console.warn).toHaveBeenLastCalledWith(msg);
    consoleWarnSpy.mockClear();
  };

  // debug message should show correct action name
  const expectDebugActionNameToBe = (actionName: string): void => {
    expect(console.groupCollapsed).toBeCalledTimes(1);
    expect(console.groupCollapsed).toHaveBeenLastCalledWith(`Action: ${actionName}`);
    groupCollapsedSpy.mockClear();
  };

  // initial app component
  expectCounterNumberToBe(0);
  expectCounterRenderTimesToBe(2);
  expect(console.groupCollapsed).toBeCalledTimes(0);

  // pre-defined action without arguments
  clickButton('+1');
  expectCounterNumberToBe(1);
  expectCounterRenderTimesToBe(3);
  expect(console.groupCollapsed).toBeCalledTimes(0);
  expectToShowActionWarning(0);

  // pre-defined action with arguments but no action name
  clickButton('+2');
  expectCounterNumberToBe(3);
  expectCounterRenderTimesToBe(4);
  expect(console.groupCollapsed).toBeCalledTimes(0);
  expectToShowActionWarning(1);

  // enable debug
  debugStore(true);

  // pre-defined action with arguments and has action name
  clickButton('+3');
  expectCounterNumberToBe(6);
  expectCounterRenderTimesToBe(5);
  expectDebugActionNameToBe('increase_number');
  expectToShowActionWarning(0);

  // immediate anonymous action
  clickButton('+4');
  expectCounterNumberToBe(10);
  expectCounterRenderTimesToBe(6);
  expectDebugActionNameToBe('(anonymous)');
  expectToShowActionWarning(1);

  // immediate action with action name
  clickButton('+5');
  expectCounterNumberToBe(15);
  expectCounterRenderTimesToBe(7);
  expectDebugActionNameToBe('increase_5');
  expectToShowActionWarning(0);

  // async action without arguments
  clickButton('+6');
  await waitFor(() => expectCounterNumberToBe(21));
  expectCounterRenderTimesToBe(8);
  expectDebugActionNameToBe('increase_6');
  expectToShowActionWarning(0);

  // async action with arguments but no action name
  clickButton('+7');
  await waitFor(() => expectCounterNumberToBe(28));
  expectCounterRenderTimesToBe(9);
  expectDebugActionNameToBe('(anonymous)');
  expectToShowActionWarning(1);

  // async action with arguments and has action name
  clickButton('+8');
  await waitFor(() => expectCounterNumberToBe(36));
  expectCounterRenderTimesToBe(10);
  expectDebugActionNameToBe('increase_number');
  expectToShowActionWarning(0);
});
