import { viewModelsConfig } from 'mobx-view-model';
import { ViewModelDevtools } from './model';
import { ViewModelStoreImpl } from './model/lib/view-model-store.impl';

Object.assign(globalThis, {
  ViewModelDevtools,
});

ViewModelDevtools.define({
  position: 'top-right',
  defaultIsOpened: false,
});

viewModelsConfig.hooks.storeCreate.sub((store) => {
  if (ViewModelStoreImpl === store.constructor) {
    return;
  }

  ViewModelDevtools.connect(store as any);
});
