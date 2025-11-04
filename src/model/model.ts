import { debounce } from 'lodash-es';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { type ViewModelParams, ViewModelStoreBase } from 'mobx-view-model';
import type { ChangeEventHandler } from 'react';
import { createRef } from 'yummies/mobx';
import { KeyHanders } from './key-handlers';
import { DevtoolsVMImpl } from './lib/devtools-vm.impl';
import type { AnyVM, VMFittedInfo, VmTreeItem } from './types';
import { checkPath } from './utils/check-path';
import { createFocusableRef } from './utils/create-focusable-ref';
import { getAllKeys } from './utils/get-all-keys';
import { renderDevtools } from '@/ui/render-devtools';
import { AnyObject } from 'yummies/types';

interface DevtoolsVMPayload {
  defaultIsOpened?: boolean;
  viewModels: ViewModelStoreBase;
  position?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';
  buttonClassName?: string;
  extras?: AnyObject;
}

export class DevtoolsVM extends DevtoolsVMImpl<DevtoolsVMPayload> {
  isOpened = !!this.payload.defaultIsOpened;

  displayType = 'popup';

  vmStore = new ViewModelStoreBase();

  projectVmStore = this.payload.viewModels!;

  handleToggleOpen = () => {
    this.isOpened = !this.isOpened;
  };

  private expandedVmsSet = observable.set();

  isAllVmsExpandedByDefault = true;

  expandedVmItemsPaths = observable.set<string>();

  logoUrl = 'https://js2me.github.io/mobx-view-model/logo.png';

  inputRef = createFocusableRef<HTMLInputElement>();
  containerRef = createFocusableRef<HTMLDivElement>();
  buttonRef = createRef();

  keyboardHandler = new KeyHanders(this);

  constructor(vmParams: ViewModelParams<DevtoolsVMPayload>) {
    super({
      ...vmParams,
      vmConfig: {
        observable: {
          viewModels: {
            useDecorators: false,
          },
        },
      },
    });

    makeObservable<typeof this, 'vmMap'>(this, {
      isOpened: observable.ref,
      isAllVmsExpandedByDefault: observable,
      search: observable.ref,
      handleToggleOpen: action,
      handleExpandPropertyClick: action,
      allVms: computed.struct,
      vmMap: computed.struct,
      isInSearch: computed,
      vmTree: computed.struct,
      rootVms: computed.struct,
      handleSearchChange: action,
    });

    const debouncedFocusOnFittedElement = debounce(([search]) => {
      if (search) {
        document.querySelector('[data-fitted="true"]')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    }, 140);

    reaction(
      () =>
        [
          this.formattedSearch,
          this.allVms,
          this.isAllVmsExpandedByDefault,
        ] as const,
      debouncedFocusOnFittedElement,
      { signal: this.unmountSignal },
    );
  }

  private get vmMap() {
    return this.getViewModelsMap();
  }

  get allVms() {
    return [...this.vmMap.values()].filter(
      (vm) => !DevtoolsVMImpl.isPrototypeOf(vm.constructor),
    );
  }

  get rootVms() {
    return this.allVms.filter((vm) => {
      const vmParams = this.getVmParams(vm);
      return !vmParams || vmParams.parentViewModel == null;
    });
  }

  search = '';

  get formattedSearch() {
    return this.search.toLowerCase().trim();
  }

  get vmTree(): VmTreeItem[] {
    const flattenTreeItems: VmTreeItem[] = [];

    const result: VmTreeItem[] = [];

    const createTreeItem = (vm: AnyVM, depth: number): VmTreeItem | null => {
      const alreadyExistVmTreeItem = flattenTreeItems.find(
        (it) => it.vm === vm,
      );

      if (alreadyExistVmTreeItem) {
        return alreadyExistVmTreeItem;
      }

      const vmParams = this.getVmParams(vm);
      const parentVm = vmParams?.parentViewModel || null;

      const displayName = vm.constructor.name;

      const treeItem: VmTreeItem = {
        parent: parentVm ? createTreeItem(parentVm, depth - 1) : null,
        vm,
        displayName,
        children: [],
        depth,
        key: `${displayName}-${vm.id}-${depth}`,
        properties: getAllKeys(vm),
      };

      flattenTreeItems.push(treeItem);

      const collectedChildren = this.allVms
        .filter((maybeChildVm) => {
          const params = this.getVmParams(maybeChildVm);
          return params?.parentViewModel && params.parentViewModel === vm;
        })
        .map((childVm) => createTreeItem(childVm, depth + 1))
        .filter((it): it is VmTreeItem => Boolean(it));

      treeItem.children.push(...collectedChildren);

      return treeItem;
    };

    this.rootVms.forEach((vm) => {
      const item = createTreeItem(vm, 0);
      if (item) {
        result.push(item);
      }
    });

    return result;
  }

  get isInSearch() {
    return !!this.search.toLowerCase().trim();
  }

  @computed
  private get searchCache() {
    this.formattedSearch;
    return new Map<string, VMFittedInfo>();
  }

  getVMFittedInfo(vmTreeItem: VmTreeItem): VMFittedInfo {
    if (!this.isInSearch) {
      return {
        isFitted: true,
        isFittedByName: true,
        fittedProperties: [],
      };
    }

    if (this.searchCache.has(vmTreeItem.key)) {
      return this.searchCache.get(vmTreeItem.key)!;
    }

    let isFittedByProperty = false;
    const fittedProperties: string[] = [];

    let isFittedByName = vmTreeItem.displayName
      .toLowerCase()
      .trim()
      .includes(this.formattedSearch);

    let isFittedByPropertyPath = checkPath(vmTreeItem.vm, this.search);

    if (!isFittedByPropertyPath && this.search.at(-1) === '.') {
      isFittedByPropertyPath = checkPath(
        vmTreeItem.vm,
        this.search.slice(0, -1),
      );
    }

    let usedSearchForProperties = this.formattedSearch;

    if (
      !isFittedByPropertyPath &&
      this.search.split('.')[0].toLowerCase() ===
        vmTreeItem.displayName.toLowerCase()
    ) {
      const removedVmNameSearch = this.search.split('.').slice(1).join('.');

      if (removedVmNameSearch) {
        isFittedByPropertyPath = checkPath(vmTreeItem.vm, removedVmNameSearch);
      } else {
        isFittedByPropertyPath = true;
        isFittedByName = true;
      }

      usedSearchForProperties = removedVmNameSearch.toLowerCase().trim();
    }

    vmTreeItem.properties.forEach((property) => {
      let isFitted = false;

      if (isFittedByName) {
        isFitted = true;
      } else {
        const formattedProperty = property.toLowerCase().trim();

        if (formattedProperty.includes(usedSearchForProperties)) {
          isFitted = true;
        } else if (
          usedSearchForProperties !== '.' &&
          `.${formattedProperty}`.includes(usedSearchForProperties)
        ) {
          isFitted = true;
        }
      }

      if (isFittedByPropertyPath) {
        const part = usedSearchForProperties.split('.')[0];
        if (part === property) {
          isFitted = true;
        }
      }

      if (!isFittedByProperty) {
        isFittedByProperty = isFitted;
      }

      if (isFitted) {
        fittedProperties.push(property);
      }
    });

    const isFittedById =
      !!vmTreeItem.vm.id && vmTreeItem.vm.id.includes(this.formattedSearch);

    const isFitted =
      isFittedByName ||
      isFittedById ||
      isFittedByProperty ||
      isFittedByPropertyPath;

    this.searchCache.set(vmTreeItem.key, {
      isFitted,
      isFittedById,
      isFittedByName,
      isFittedByPropertyPath,
      fittedProperties,
    });

    return this.searchCache.get(vmTreeItem.key)!;
  }

  checkIsPropertyFitted(vmItem: VmTreeItem, property: string): boolean {
    if (!this.isInSearch) {
      return true;
    }

    return this.getVMFittedInfo(vmItem).fittedProperties.includes(property);
  }

  isExpanded(vmItem: VmTreeItem) {
    return (
      this.expandedVmsSet.has(vmItem.key) ||
      this.isInSearch ||
      this.isAllVmsExpandedByDefault
    );
  }

  checkIsPathExpanded(vmItem: VmTreeItem, path: string) {
    const vmFittedInfo = this.getVMFittedInfo(vmItem);

    const firstPathSegment = (
      path.startsWith('.') ? path.slice(1) : path
    ).split('.')[0];

    if (
      firstPathSegment &&
      vmFittedInfo.fittedProperties.includes(firstPathSegment)
    ) {
      return this.expandedVmItemsPaths.has(`${vmItem.key}%%%${path}`);
    }

    return this.expandedVmItemsPaths.has(`${vmItem.key}%%%${path}`);
  }

  handleExpandPropertyClick(vmItem: VmTreeItem, path: string) {
    const expandedKey = `${vmItem.key}%%%${path}`;

    if (this.expandedVmItemsPaths.has(expandedKey)) {
      this.expandedVmItemsPaths.delete(expandedKey);
    } else {
      this.expandedVmItemsPaths.add(expandedKey);
    }
  }

  handleVmItemHeaderClick(vmItem: VmTreeItem): void {
    if (this.isExpanded(vmItem)) {
      this.expandedVmsSet.delete(vmItem.key);
    } else {
      this.expandedVmsSet.add(vmItem.key);
    }
  }

  handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    this.search = e.target.value;
  };

  private getVmParams(vm: AnyVM): null | ViewModelParams {
    if ('vmParams' in vm) {
      return vm.vmParams as ViewModelParams;
    }

    return null;
  }

  private getViewModelsMap() {
    const vmStore = (this.payload.viewModels ??
      this.projectVmStore) as ViewModelStoreBase;

    return ((vmStore as any)?.viewModels as Map<string, AnyVM>) ?? new Map();
  }

  willMount(): void {
    this.vmStore.attach(this);
    const container = document.createElement('div');
    document.body.appendChild(container);
    renderDevtools(container, this);
  }
}
