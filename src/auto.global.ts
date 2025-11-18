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

const connectStore = (store: any) => {
  if (ViewModelStoreImpl === store.constructor) {
    return;
  }

  ViewModelDevtools.connect(store as any);
};

if (viewModelsConfig.hooks.storeCreate.lastPub?.[0]) {
  connectStore(viewModelsConfig.hooks.storeCreate.lastPub[0]);
}
viewModelsConfig.hooks.storeCreate.sub(connectStore);
