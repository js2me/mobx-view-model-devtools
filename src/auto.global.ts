import { viewModelsConfig } from 'mobx-view-model';
import { ViewModelDevtools } from './model';
import { ViewModelStoreImpl } from './model/lib/view-model-store.impl';

Object.assign(globalThis, {
  ViewModelDevtools,
});

ViewModelDevtools.define({
  position: 'top-right',
  defaultIsOpened: buildEnvs.isDev,
});

if (buildEnvs.isDev) {
  ViewModelDevtools.connectExtras(window);
}

viewModelsConfig.hooks.storeCreate.sub((store) => {
  if (ViewModelStoreImpl === store.constructor) {
    return;
  }

  if (buildEnvs.isDev) {
    ViewModelDevtools.connect(store as any, window);
  } else {
    ViewModelDevtools.connect(store as any);
  }
});
