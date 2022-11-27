/* eslint-disable no-restricted-globals */
// This function makes global variable 'window' mockable
export default function getWindow(): Window {
  return window;
}
