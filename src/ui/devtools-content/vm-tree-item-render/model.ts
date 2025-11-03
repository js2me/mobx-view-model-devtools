import { DevtoolsVM, DevtoolsVMImpl, VmTreeItem } from '@/model';
import { action, computed, makeObservable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';

type VmTreeItemRenderPayload = { vmItem: VmTreeItem; devtoolsVM: DevtoolsVM };

export class VmTreeItemRenderVM extends DevtoolsVMImpl<
  VmTreeItemRenderPayload,
  VmTreeItemRenderVM
> {
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
      devtoolsVM: computed.struct,
      handleExpandPropertyClick: action,
      handleVmItemHeaderClick: action,
    });
  }

  get devtoolsVM() {
    return this.payload.devtoolsVM;
  }

  isPathExpanded(path: string) {
    return this.devtoolsVM.checkIsPathExpanded(this.payload.vmItem, path);
  }

  handleExpandPropertyClick(path: string): void {
    this.devtoolsVM.handleExpandPropertyClick(this.payload.vmItem, path);
  }

  handleVmItemHeaderClick(vmItem: VmTreeItem): void {
    this.devtoolsVM.handleVmItemHeaderClick(vmItem);
  }
}
