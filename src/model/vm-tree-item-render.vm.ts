import { action, makeObservable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import { ViewModelImpl } from './lib/view-model.impl';
import type { VmTreeItem } from './types';
import type { ViewModelDevtools } from './view-model-devtools';

type VmTreeItemRenderPayload = {
  vmItem: VmTreeItem;
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
      handleExpandPropertyClick: action,
      handleVmItemHeaderClick: action,
    });
  }

  isPathExpanded(path: string) {
    return this.devtools.checkIsPathExpanded(this.payload.vmItem, path);
  }

  handleExpandPropertyClick(path: string): void {
    this.devtools.handleExpandPropertyClick(this.payload.vmItem, path);
  }

  handleVmItemHeaderClick(vmItem: VmTreeItem): void {
    this.devtools.handleVmItemHeaderClick(vmItem);
  }
}
