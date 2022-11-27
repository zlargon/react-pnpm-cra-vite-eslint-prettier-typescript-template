import { IAction } from 'store/store';

export const user_click_increment_button_with_number = (num: number): IAction => {
  return function user_click_increment_button_with_number(s) {
    s.counter += num;
  };
};
