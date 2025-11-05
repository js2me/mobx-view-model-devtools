import { action, makeObservable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import {
  DevtoolsVMImpl,
  type ViewModelDevtools,
  type VmTreeItem,
} from '@/model';

type VmTreeItemRenderPayload = {
  vmItem: VmTreeItem;
  devtools: ViewModelDevtools;
};

export class VmTreeItemRenderVM extends DevtoolsVMImpl<
  VmTreeItemRenderPayload,
  VmTreeItemRenderVM
> {
  devtools = this.payload.devtools;

  constructor(vmParams: ViewModelParams<any, any>) {
    super({
      ...vmParams,
      vmConfig: {
        observable: {
          viewModels: {
            useDecorators: false,
          },
          viewModelStores: {
            useDecorators: false,
          },
        },
      },
    });

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
