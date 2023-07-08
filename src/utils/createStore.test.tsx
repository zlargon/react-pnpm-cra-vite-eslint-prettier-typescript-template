import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor, screen } from '@testing-library/react';
import User from '@testing-library/user-event';
import { createStore } from './createStore';
import { delay } from './delay';

const REACT_MAJOR_VERSION = parseInt(React.version.split('.')[0]);

// mock console
/* eslint-disable no-console */
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

// Records of the component rendering times
const renderTimes = {
  app: 0,
  counter: 0,
};

// =============================================================================
// State & Types & Store
// =============================================================================
const initialState = { count: 0 };
const onStateChangeSpy = jest.fn();
const Store = createStore({
  initialState,
  onStateChange: onStateChangeSpy,
});
type IAction = typeof Store.infer.Action;
type IAsyncAction = typeof Store.infer.AsyncAction;

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

// Button Component
const Button = ({
  text,
  onClick,
}: {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}): JSX.Element => {
  return <button onClick={onClick}>{text}</button>;
};

// Counter Component
const Counter = (): JSX.Element => {
  renderTimes.counter++; // update the render times

  const count = Store.useSelector((s) => s.count);
  return <div data-testid="counter">{count}</div>;
};

// App Component
const App = (): JSX.Element => {
  renderTimes.app++; // update the render times

  const dispatch = Store.useDispatch();
  const dispatchAsyncAction = Store.useDispatchAsyncAction();
  return (
    <div>
      <Counter />
      <Button text="+1" onClick={() => dispatch(increase_1)} />
      <Button text="+2" onClick={() => dispatch(increase_number(2))} />
      <Button text="+3" onClick={() => dispatch(increase_number_with_action_name(3))} />
      <Button
        text="+4"
        onClick={() =>
          dispatch((s) => {
            s.count += 4;
          })
        }
      />
      <Button
        text="+5"
        onClick={() => {
          dispatch(function increase_5(s) {
            s.count += 5;
          });
        }}
      />
      <Button text="+6 after 500ms" onClick={() => dispatchAsyncAction(increase_6_later)} />
      <Button text="+7 after 500ms" onClick={() => dispatchAsyncAction(increase_number_later(7))} />
      <Button
        text="+8 after 500ms"
        onClick={() => dispatchAsyncAction(increase_number_later_with_action_name(8))}
      />
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
  const expectCounterTimesToBe = (times: number): void => {
    /* eslint-disable jest/no-conditional-expect */
    if (REACT_MAJOR_VERSION >= 18) {
      expect(renderTimes.app).toBeLessThanOrEqual(2); // react 18 will render twice initially

      // Skip the testing of the rendering time for the counter component as React 18 has introduced "automatic batching"
      // to optimize rendering times. This means that the component's rendering time may not be predictable during testing.
      // https://reactjs.org/blog/2022/03/29/react-v18.html#new-feature-automatic-batching
      // https://github.com/reactwg/react-18/discussions/21
    } else {
      expect(renderTimes.app).toBe(1); // app component should never re-render
      expect(renderTimes.counter).toBe(times);
    }
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
  const expectActionNameToBe = (actionName: string): void => {
    const actualActionName = onStateChangeSpy.mock.calls.at(-1)[0].actionName;
    expect(actualActionName).toBe(actionName);
  };

  // initial app component
  expectCounterNumberToBe(0);
  expectCounterTimesToBe(1);

  // pre-defined action without arguments
  clickButton('+1');
  expectCounterNumberToBe(1);
  expectCounterTimesToBe(2);
  expectActionNameToBe('increase_1');
  expectToShowActionWarning(0);

  // pre-defined action with arguments but no action name
  clickButton('+2');
  expectCounterNumberToBe(3);
  expectCounterTimesToBe(3);
  expectActionNameToBe('');
  expectToShowActionWarning(1);

  // pre-defined action with arguments and has action name
  clickButton('+3');
  expectCounterNumberToBe(6);
  expectCounterTimesToBe(4);
  expectActionNameToBe('increase_number');
  expectToShowActionWarning(0);

  // immediate anonymous action
  clickButton('+4');
  expectCounterNumberToBe(10);
  expectCounterTimesToBe(5);
  expectActionNameToBe('');
  expectToShowActionWarning(1);

  // immediate action with action name
  clickButton('+5');
  expectCounterNumberToBe(15);
  expectCounterTimesToBe(6);
  expectActionNameToBe('increase_5');
  expectToShowActionWarning(0);

  // async action without arguments
  clickButton('+6 after 500ms');
  await waitFor(() => {
    expectCounterNumberToBe(21);
    expectCounterTimesToBe(7);
    expectActionNameToBe('increase_6');
    expectToShowActionWarning(0);
  });

  // async action with arguments but no action name
  clickButton('+7 after 500ms');
  await waitFor(() => {
    expectCounterNumberToBe(28);
    expectCounterTimesToBe(8);
    expectActionNameToBe('');
    expectToShowActionWarning(1);
  });

  // async action with arguments and has action name
  clickButton('+8 after 500ms');
  await waitFor(() => {
    expectCounterNumberToBe(36);
    expectCounterTimesToBe(9);
    expectActionNameToBe('increase_number');
    expectToShowActionWarning(0);
  });
});

// =============================================================================
// Test Actions and Async Actions
// =============================================================================
test('actions and async actions', async () => {
  const { testDispatchActions, testDispatchAsyncActions } = Store.testUtils;

  // init state
  let state = initialState;
  expect(state.count).toEqual(0);

  // dispatch actions
  state = testDispatchActions(state, [
    increase_1,
    increase_number(3),
    increase_number_with_action_name(5),
  ]);
  expect(state.count).toEqual(9);

  // dispatch async actions
  state = await testDispatchAsyncActions(state, [
    increase_6_later,
    increase_number_later(10),
    increase_number_later_with_action_name(10),
  ]);
  expect(state.count).toEqual(35);
});
