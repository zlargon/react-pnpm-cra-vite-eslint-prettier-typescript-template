import type { Dispatch } from 'react';
import { createStore } from 'utils/createStore';

// initial state
export const initialState = {
  isInitializing: true,
  isLoading: false,
  counter: 0,
};

// types
export type IState = typeof initialState;
export type IAction = (state: IState) => void;
export type IAsyncAction = (dispatch: Dispatch<IAction>) => Promise<void>;

// store
export const Store = createStore<IState>(initialState);
