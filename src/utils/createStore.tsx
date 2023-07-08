/*
MIT License

Copyright (c) 2022 Leon Huang <zlargon1988@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { createContext, Dispatch, useCallback, useContext, useReducer } from 'react';
import { createContext as createSelectorContext, useContextSelector } from 'use-context-selector';
import { produce } from 'immer';

// Types
type Provider = (props: { children: JSX.Element }) => JSX.Element;
type InferDispatch<IState> = Dispatch<InferAction<IState>>;
type InferDispatchAsyncAction<IState> = (asyncAction: InferAsyncAction<IState>) => Promise<void>;
type InferAction<IState> = (state: IState) => void;
type InferAsyncAction<IState> = (dispatch: InferDispatch<IState>) => Promise<void>;
type InferReducer<IState> = (state: IState, action: InferAction<IState>) => IState;
type InferSelector<IState> = <ISelected>(selector: (state: IState) => ISelected) => ISelected;
type StoreOption<IState> = {
  initialState: IState;
  onStateChange?: (info: { actionName: string; oldState: IState; newState: IState }) => void;
};

/**
 *
 * @param option.initialState  - initial state of the store
 * @param option.onStateChange - on state changed (optional)
 * @returns store.useDispatch  - The react hook to get the dispatch function
 *          store.useDispatchAsyncAction - The react hook to get the dispatchAsyncAction function
 *          store.useSelector  - The react hook to get the state from store
 *          store.Provider     - The react component to connect the store
 *          store.infer        - Used to infer State, Action, AsyncAction types
 *          store.testUtils    - Used to test pure actions and async actions
 */
export function createStore<IState>({ initialState, onStateChange }: StoreOption<IState>): {
  useDispatch: () => InferDispatch<IState>;
  useDispatchAsyncAction: () => InferDispatchAsyncAction<IState>;
  useSelector: InferSelector<IState>;
  Provider: Provider;
  infer: {
    State: IState;
    Action: InferAction<IState>;
    AsyncAction: InferAsyncAction<IState>;
  };
  testUtils: {
    testDispatchActions: (state: IState, actions: InferAction<IState>[]) => IState;
    testDispatchAsyncActions: (
      state: IState,
      asyncActions: InferAsyncAction<IState>[],
    ) => Promise<IState>;
  };
} {
  // Contexts
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const DispatchContext = createContext<InferDispatch<IState>>(undefined!);
  const StateContext = createSelectorContext<IState>(initialState);

  // Reducer
  const reducer: InferReducer<IState> = (state, action) => {
    // check action name
    if (action.name.length === 0 && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[Store] Action name is missing. You should always give a name for the action.');
    }

    const newState = produce(state, action);

    onStateChange?.({
      actionName: action.name,
      oldState: state,
      newState,
    });

    return newState;
  };

  return {
    useDispatch: () => useContext(DispatchContext),
    useDispatchAsyncAction: () => {
      const dispatch = useContext(DispatchContext);
      return useCallback((asyncAction) => asyncAction(dispatch), [dispatch]);
    },
    useSelector: (selector) => useContextSelector(StateContext, selector),
    Provider: ({ children }) => {
      const [state, dispatch] = useReducer(reducer, initialState);
      return (
        <StateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
        </StateContext.Provider>
      );
    },
    infer: {
      State: undefined!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      Action: undefined!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      AsyncAction: undefined!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
    },
    testUtils: {
      testDispatchActions: (state, actions) => actions.reduce(reducer, state),
      testDispatchAsyncActions: async (state, asyncActions) => {
        const dispatch: InferDispatch<IState> = (action) => {
          state = reducer(state, action);
        };

        for (const asyncAction of asyncActions) {
          await asyncAction(dispatch);
        }
        return state;
      },
    },
  };
}
