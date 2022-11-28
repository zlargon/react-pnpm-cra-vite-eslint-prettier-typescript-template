import User from '@testing-library/user-event';
import { render, screen, waitFor, waitForOptions } from '@testing-library/react';
import React, { Dispatch } from 'react';

// ========================================================
// Action Testing Component
// ========================================================
interface ActionTestingComponentProps<IState> extends IRenderTestStore<IState> {
  current: { params: unknown[] };
}
function ActionTestingComponent<IState>({
  Store,
  current,
  actions,
  actionsWithParams,
  asyncActions,
  asyncActionsWithParams,
}: ActionTestingComponentProps<IState>) {
  const state = Store.useSelector((s) => s);
  const dispatch = Store.useDispatch();
  return (
    <div>
      <div data-testid="state">{JSON.stringify(state)}</div>

      {/* 1. Actions without params */}
      {actions.map((action) => (
        <div key={action.name} data-testid={action.name} onClick={() => dispatch(action)} />
      ))}

      {/* 2. Actions with params */}
      {actionsWithParams.map((action) => (
        <div
          key={action.name}
          data-testid={action.name}
          onClick={() => dispatch(action(...current.params))}
        />
      ))}

      {/* 3. Async Action without params */}
      {asyncActions.map((action) => (
        <div key={action.name} data-testid={action.name} onClick={() => action(dispatch)} />
      ))}

      {/* 4. Async Action with params */}
      {asyncActionsWithParams.map((action) => (
        <div
          key={action.name}
          data-testid={action.name}
          onClick={() => action(...current.params)(dispatch)}
        />
      ))}
    </div>
  );
}

// ========================================================
// Render Test Store
// ========================================================
interface IRenderTestStore<IState> {
  Store: {
    Provider: React.FC<{ children: React.ReactNode }>;
    useSelector: <ISelected>(selector: (state: IState) => ISelected) => ISelected;
    useDispatch: () => Dispatch<(state: IState) => void>;
  };
  actions: ((state: IState) => void)[];
  actionsWithParams: ((...params: any[]) => (state: IState) => void)[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  asyncActions: ((dispatch: Dispatch<(state: IState) => void>) => Promise<void>)[];
  asyncActionsWithParams: ((
    ...params: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (dispatch: Dispatch<(state: IState) => void>) => Promise<void>)[];
}

export const renderTestStore = <IState, IActionName extends string>({
  Store,
  actions,
  actionsWithParams,
  asyncActions,
  asyncActionsWithParams,
}: IRenderTestStore<IState>) => {
  const current = { params: [] as unknown[] };
  render(
    <Store.Provider>
      <ActionTestingComponent
        current={current}
        Store={Store}
        actions={actions}
        actionsWithParams={actionsWithParams}
        asyncActions={asyncActions}
        asyncActionsWithParams={asyncActionsWithParams}
      />
    </Store.Provider>,
  );

  return {
    dispatchAction: (actionName: IActionName, ...params: unknown[]) => {
      current.params = params;
      User.click(screen.getByTestId(actionName));
    },

    expectState: async (
      callback: (state: IState) => void | Promise<void>,
      options?: waitForOptions,
    ) => {
      return waitFor(() => {
        const state = screen.getByTestId('state');
        callback(JSON.parse(state.textContent!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }, options);
    },
  };
};
