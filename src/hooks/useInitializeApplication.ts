import { useEffect } from 'react';
import { Store } from 'store/store';
import { initialize_application } from 'store/asyncActions/initialize_application';

export const useInitializeApplication = () => {
  const isApplicationInitializing = Store.useSelector((s) => s.isInitializing);
  const dispatchAsyncAction = Store.useDispatchAsyncAction();
  useEffect(() => {
    dispatchAsyncAction(initialize_application);
  }, [dispatchAsyncAction]);

  return isApplicationInitializing;
};
