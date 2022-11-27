import { IAction } from 'store/store';

export const user_click_increment_button: IAction = (s) => {
  s.counter++;
};
