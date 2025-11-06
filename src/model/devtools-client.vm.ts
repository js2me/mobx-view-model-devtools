import { action, makeObservable } from 'mobx';
import { ViewModelImpl } from './lib/view-model.impl';
import type { ViewModelDevtools } from './view-model-devtools';

export class DevtoolsClientVM extends ViewModelImpl<{
  devtools: ViewModelDevtools;
}> {
  devtools = this.payload.devtools;

  handleToggleOpen = () => {
    this.devtools.isPopupOpened = !this.devtools.isPopupOpened;
  };

  handleClosePopupClick = () => {
    this.devtools.isPopupOpened = false;
  };

  willMount(): void {
    makeObservable(this, {
      handleToggleOpen: action,
      handleClosePopupClick: action,
    });
  }
}
