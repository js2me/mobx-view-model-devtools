import {
  action,
  computed,
  makeObservable,
  type ObservableSet,
  observable,
} from 'mobx';
import {
  type AnyViewModel,
  type ViewModelParams,
  ViewModelStoreBase,
} from 'mobx-view-model';
import { type ChangeEventHandler, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createRef, type Ref } from 'yummies/mobx';
import type { AnyObject, Maybe } from 'yummies/types';
import { DevtoolsClient } from '@/ui/devtools-client';
import { KeyboardHandler } from './keyboard-handler';
import { DevtoolsVMImpl } from './lib/devtools-vm.impl';
import type { AnyVM, VMFittedInfo, VmTreeItem } from './types';
import { checkPath } from './utils/check-path';
import {
  createFocusableRef,
  type FocusableRef,
} from './utils/create-focusable-ref';
import { getAllKeys } from './utils/get-all-keys';

export interface ViewModelDevtoolsConfig {
  containerId?: string;
  defaultIsOpened?: boolean;
  viewModels: ViewModelStoreBase;
  position?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';
  buttonClassName?: string;
  extras?: AnyObject;
}

export class ViewModelDevtools {
  isOpened: boolean;
  displayType: string;
  vmStore: ViewModelStoreBase;
  projectVmStore: ViewModelStoreBase<AnyViewModel>;
  isAllVmsExpandedByDefault: boolean;
  expandedVmItemsPaths: ObservableSet<string>;
  logoUrl: string;
  inputRef: FocusableRef<HTMLInputElement>;
  containerRef: FocusableRef<HTMLDivElement>;
  buttonRef: Ref<HTMLButtonElement>;
  keyboardHandler: KeyboardHandler;
  search: string;

  private expandedVmsSet: ObservableSet<string>;

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

  handleToggleOpen = () => {
    this.isOpened = !this.isOpened;
  };

  private getVmParams(vm: AnyVM): null | ViewModelParams {
    if ('vmParams' in vm) {
      return vm.vmParams as ViewModelParams;
    }

    return null;
  }

  private getViewModelsMap() {
    const vmStore = (this.config.viewModels ??
      this.projectVmStore) as ViewModelStoreBase;

    return ((vmStore as any)?.viewModels as Map<string, AnyVM>) ?? new Map();
  }

  constructor(public config: ViewModelDevtoolsConfig) {
    this.isOpened = !!this.config.defaultIsOpened;
    this.search = '';
    this.displayType = 'popup';
    this.vmStore = new ViewModelStoreBase();
    this.projectVmStore = this.config.viewModels;
    this.expandedVmsSet = observable.set();
    this.isAllVmsExpandedByDefault = true;
    this.expandedVmItemsPaths = observable.set<string>();
    this.logoUrl = 'https://js2me.github.io/mobx-view-model/logo.png';
    this.inputRef = createFocusableRef<HTMLInputElement>();
    this.containerRef = createFocusableRef<HTMLDivElement>();
    this.buttonRef = createRef<HTMLButtonElement>();
    this.keyboardHandler = new KeyboardHandler(this);

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

    this.render();
  }

  render() {
    const containerId = this.config.containerId ?? 'view-model-devtools';

    let existedContainer = document.querySelector(
      `#${containerId}`,
    ) as Maybe<HTMLDivElement>;

    if (!existedContainer) {
      existedContainer = document.createElement('div');
      existedContainer.style = 'display: contents;';
      existedContainer.id = containerId;
      document.body.appendChild(existedContainer);
    }

    const root = createRoot(existedContainer);
    root.render(createElement(DevtoolsClient, { payload: { devtools: this } }));
  }

  static connect(config: ViewModelDevtoolsConfig) {
    new ViewModelDevtools(config);
  }
}
