import { action, makeObservable } from 'mobx';
import { ViewModelImpl } from './lib/view-model.impl';
import type { ViewModelDevtools } from './view-model-devtools';

export class DevtoolsClientVM extends ViewModelImpl<{
  devtools: ViewModelDevtools;
}> {
  devtools = this.payload.devtools;

  handleToggleOpen = () => {
    if (this.devtools.isPopupOpened) {
      this.devtools.hidePopup();
    } else {
      this.devtools.showPopup();
    }
  };

  handleClosePopupClick = () => {
    this.devtools.hidePopup();
  };

  willMount(): void {
    makeObservable(this, {
      handleToggleOpen: action,
      handleClosePopupClick: action,
    });
  }
}
