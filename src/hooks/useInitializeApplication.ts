import { useEffect } from 'react';
import { Store } from 'store/store';
import { initialize_application } from 'store/asyncActions/initialize_application';

export const useInitializeApplication = () => {
  const isApplicationInitializing = Store.useSelector((s) => s.isInitializing);
  const dispatch = Store.useDispatch();
  useEffect(() => {
    initialize_application(dispatch);
  }, [dispatch]);

  return isApplicationInitializing;
};
