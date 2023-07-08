import { createStore } from 'utils/createStore';

// initial state
export const initialState = {
  isInitializing: true,
  isLoading: false,
  counter: 0,
};

// store
export const Store = createStore({ initialState });

// types
export type IAction = typeof Store.infer.Action;
export type IAsyncAction = typeof Store.infer.AsyncAction;
