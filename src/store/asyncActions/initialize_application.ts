import type { IAsyncAction } from 'store/store';
import * as API from 'apis/apis';

export const initialize_application: IAsyncAction = async (dispatch) => {
  try {
    const counter = await API.getDefaultCounter();
    dispatch(function after_getting_default_counter_success(s) {
      s.isInitializing = false;
      s.counter = counter;
    });
  } catch (e) {
    dispatch(function after_getting_default_counter_failure(s) {
      s.isInitializing = false;
    });
  }
};
