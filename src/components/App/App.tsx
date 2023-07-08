import { Store } from 'store/store';
import { useInitializeApplication } from 'hooks/useInitializeApplication';
import { user_click_increment_button } from 'store/actions/user_click_increment_button';
import { user_click_increment_button_with_number } from 'store/actions/user_click_increment_button_with_number';
import { user_click_delay_decrement_button } from 'store/asyncActions/user_click_delay_decrement_button';
import { user_click_delay_decrement_button_with_number } from 'store/asyncActions/user_click_delay_decrement_button_with_number';

function AppWrapper() {
  // connect to store
  return (
    <Store.Provider>
      <App />
    </Store.Provider>
  );
}

function App() {
  const isInitializing = useInitializeApplication();
  const isLoading = Store.useSelector((s) => s.isLoading);
  if (isInitializing) {
    return <div>Initializing...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Counter />
      <Buttons />
    </div>
  );
}

function Counter() {
  const counter = Store.useSelector((s) => s.counter);
  return (
    <div>
      Counter: <span data-testid="counter">{counter}</span>
    </div>
  );
}

function Buttons() {
  const dispatch = Store.useDispatch();
  const dispatchAsyncAction = Store.useDispatchAsyncAction();
  return (
    <>
      {/* 1. action without parameter */}
      <button
        data-testid="increment-btn-1" //
        onClick={() => dispatch(user_click_increment_button)}
      >
        +1
      </button>

      {/* 2. action with parameter */}
      <button
        data-testid="increment-btn-2"
        onClick={() => dispatch(user_click_increment_button_with_number(2))}
      >
        +2
      </button>

      {/* 3. async action without parameter */}
      <button
        data-testid="decrement-btn-1"
        onClick={() => dispatchAsyncAction(user_click_delay_decrement_button)}
      >
        -1
      </button>

      {/* 4. async action with parameter */}
      <button
        data-testid="decrement-btn-2"
        onClick={() => dispatchAsyncAction(user_click_delay_decrement_button_with_number(3))}
      >
        -3
      </button>
    </>
  );
}

export default AppWrapper;
