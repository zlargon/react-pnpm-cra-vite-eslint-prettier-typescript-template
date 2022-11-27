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

import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { createContext as createSelectorContext, useContextSelector } from 'use-context-selector';
import { produce } from 'immer';

let DEBUG_STORE = process.env.NODE_ENV === 'development';
export const debugStore = (enable: boolean): void => {
  DEBUG_STORE = enable;
};

/**
 *
 * @param initialState        - initial state of the store
 * @returns store.Provider    - The react component to connect the store
 *          store.useSelector - The react hook to get the state from store
 *          store.useDispatch - The react hook to get the dispatch function
 */
export function createStore<IState>(initialState: IState): {
  Provider: React.FC<{ children: React.ReactNode }>;
  useSelector: <ISelected>(selector: (state: IState) => ISelected) => ISelected;
  useDispatch: () => Dispatch<(state: IState) => void>; // Dispatch<IAction>
} {
  // Types
  type IAction = (state: IState) => void;
  type IReducer = (state: IState, action: IAction) => IState;

  // Reducer
  const reducer: IReducer = (state, action) => {
    /* eslint-disable no-console */
    // check action name
    if (action.name.length === 0 && process.env.NODE_ENV !== 'production') {
      console.warn('[Store] Action name is missing. You should always give a name for the action.');
    }

    const newState = produce(state, action);
    if (DEBUG_STORE) {
      const styles = 'color: blue';
      console.groupCollapsed(`Action: ${action.name || '(anonymous)'}`);
      console.log('%cPrevious state (before dispatch action):', styles, state);
      console.log('%cCurrent state (after dispatch action):', styles, newState);
      console.groupEnd();
    }
    return newState;
  };

  // Context
  const StateContext = createSelectorContext<IState>(initialState);
  const DispatchContext = createContext<Dispatch<IAction>>(() => null);

  // Provider Component
  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return {
    Provider,
    useSelector: (selector) => useContextSelector(StateContext, selector),
    useDispatch: (): Dispatch<IAction> => useContext(DispatchContext),
  };
}
