import { createStore } from 'utils/createStore';
import { diffState } from 'utils/diffState';

// initial state
export const initialState = {
  isInitializing: true,
  isLoading: false,
  counter: 0,
};

// store
export const Store = createStore({
  initialState,
  onStateChange: ({ actionName, oldState, newState }) => {
    /* eslint-disable no-console */
    console.group(actionName);
    diffState(oldState, newState);
    console.groupEnd();
  },
});

// types
export type IAction = typeof Store.infer.Action;
export type IAsyncAction = typeof Store.infer.AsyncAction;
