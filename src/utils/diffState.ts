import { produce } from 'immer';
import { diffLines } from 'diff';

/**
 * diffState - Display the diff between states in the console
 *
 * @param oldState - old state
 * @param newState - new state
 * @param excluder - exclude the state that you don't want to compare. e.g. the large array
 */
export function diffState<IState>(
  oldState: IState,
  newState: IState,
  excluder: (state: IState) => void = (s) => {
    // e.g.
    // s.largeArray = [];
  },
): void {
  const diff = diffLines(
    JSON.stringify(produce(oldState, excluder), null, 4),
    JSON.stringify(produce(newState, excluder), null, 4),
  );

  const texts = [];
  const styles = [];
  for (const part of diff) {
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    texts.push(`%c${part.value}`);
    styles.push(`color: ${color}`);
  }

  // eslint-disable-next-line no-console
  console.log(texts.join(''), ...styles);
}
