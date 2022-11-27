/**
 * a promise function to delay x milliseconds
 *
 * @param {number} ms - milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
