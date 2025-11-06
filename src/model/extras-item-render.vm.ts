import { action, makeObservable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { AnyObject } from 'yummies/types';
import { ViewModelImpl } from './lib/view-model.impl';
import type { ViewModelDevtools } from './view-model-devtools';

type ExtrasItemRenderPayload = {
  extras: AnyObject;
  devtools: ViewModelDevtools;
};

export class ExtrasItemRenderVM extends ViewModelImpl<ExtrasItemRenderPayload> {
  devtools = this.payload.devtools;

  constructor(vmParams: ViewModelParams<any, any>) {
    super(vmParams);

    makeObservable<typeof this>(this, {
      handleExpandPropertyClick: action,
    });
  }

  isPathExpanded(path: string) {
    return this.devtools.checkIsExtraPathExpanded(path);
  }

  handleExpandPropertyClick(path: string): void {
    this.devtools.handleExpandExtraPropertyClick(path);
  }
}
