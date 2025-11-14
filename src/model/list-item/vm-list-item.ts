import { computed, makeObservable, untracked } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { AnyVM } from '../types';
import { getAllKeys } from '../utils/get-all-keys';
import type { ViewModelDevtools } from '../view-model-devtools';
import { ListItem } from './list-item';
import { PropertyListItem } from './property-list-item';

export class VMListItem extends ListItem<AnyVM> {
  private get childVMListItems(): VMListItem[] {
    return this.allVms
      .filter((maybeChildVm) => {
        const params = this.getVmParams(maybeChildVm);
        return params?.parentViewModel && params.parentViewModel === this.data;
      })
      .map((it) => new VMListItem(this.devtools, it, this.allVms, this));
  }

  get isFitted() {
    const { searchEngine } = this.devtools;

    if (!searchEngine.isActive) {
      return true;
    }

    const firstSegment = searchEngine.segments[0];
    const secondSegment = searchEngine.segments[1];

    let isFittedById: boolean;
    let isFittedByName: boolean;

    if (secondSegment) {
      isFittedById = this.searchData.id === firstSegment;
      isFittedByName = this.searchData.name === firstSegment;
    } else {
      isFittedById = this.searchData.id.startsWith(firstSegment);
      isFittedByName = this.searchData.name.startsWith(firstSegment);
    }

    return isFittedByName || isFittedById;
  }

  private get propertyListItems(): PropertyListItem[] {
    return getAllKeys(this.data).map((property, order) => {
      return PropertyListItem.create(
        this.devtools,
        property,
        property,
        order,
        this,
      );
    });
  }

  get children(): ListItem<any>[] {
    return [...this.propertyListItems, ...this.childVMListItems];
  }

  private getVmParams(vm: AnyVM): null | ViewModelParams {
    if ('vmParams' in vm) {
      return vm.vmParams as ViewModelParams;
    }

    return null;
  }

  get depth(): number {
    if (this.parent && this.devtools.presentationMode === 'tree') {
      return this.parent.depth + 1;
    }

    return 0;
  }

  searchData;

  displayName;

  constructor(
    devtools: ViewModelDevtools,
    vm: AnyVM,
    private allVms: AnyVM[],
    private parent?: VMListItem,
  ) {
    const displayName = vm.constructor.name;
    const key = `${displayName}-${vm.id}`;

    super(devtools, key, vm, undefined, new Map());

    this.displayName = displayName;
    this.searchData = {
      name: displayName.toLowerCase().trim(),
      id: (vm.id || '').toLowerCase().trim(),
    };

    computed.struct(this, 'childVMListItems');
    computed.struct(this, 'propertyListItems');
    makeObservable(this);

    untracked(() => {
      this.expand();
    });
  }
}
