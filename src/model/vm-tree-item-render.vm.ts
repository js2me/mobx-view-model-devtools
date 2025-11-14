import { action, makeObservable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import { ViewModelImpl } from './lib/view-model.impl';
import type { VMListItem } from './list-item/vm-list-item';
import type { VmTreeItem } from './types';
import type { ViewModelDevtools } from './view-model-devtools';

type VmTreeItemRenderPayload = {
  vmItem: VMListItem;
  devtools: ViewModelDevtools;
};

export class VmTreeItemRenderVM extends ViewModelImpl<
  VmTreeItemRenderPayload,
  VmTreeItemRenderVM
> {
  devtools = this.payload.devtools;

  constructor(vmParams: ViewModelParams<any, any>) {
    super(vmParams);

    makeObservable<typeof this>(this, {
      handleVmItemHeaderClick: action,
    });
  }


}
