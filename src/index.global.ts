import { viewModelsConfig } from 'mobx-view-model';
import { ViewModelDevtools } from './model';
import { ViewModelStoreImpl } from './model/lib/view-model-store.impl';

Object.assign(globalThis, {
  ViewModelDevtools,
});

viewModelsConfig.hooks.storeCreate.sub((store) => {
  if (ViewModelStoreImpl === store.constructor) {
    return;
  }
  ViewModelDevtools.connect({
    position: 'top-right',
    viewModels: store as any,
    defaultIsOpened: false,
  });
});
