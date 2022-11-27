import * as API from 'apis/apis';

test('API smoke test', async () => {
  await API.getDefaultCounter();
});
