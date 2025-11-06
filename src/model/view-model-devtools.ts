import {
  action,
  computed,
  makeObservable,
  type ObservableSet,
  observable,
} from 'mobx';
import type {
  AnyViewModel,
  ViewModelParams,
  ViewModelStoreBase,
} from 'mobx-view-model';
import { type ChangeEventHandler, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { VListHandle } from 'virtua';
import { createRef, type Ref } from 'yummies/mobx';
import type { AnyObject, Maybe } from 'yummies/types';
import { DevtoolsClient } from '@/ui/devtools-client';
import css from '../styles.module.css';
import { KeyboardHandler } from './keyboard-handler';
import { ViewModelImpl } from './lib/view-model.impl';
import { ViewModelStoreImpl } from './lib/view-model-store.impl';
import type { AnyVM, FittedInfo, VmTreeItem } from './types';
import { checkPath } from './utils/check-path';
import {
  createFocusableRef,
  type FocusableRef,
} from './utils/create-focusable-ref';
import { getAllKeys } from './utils/get-all-keys';

export interface ViewModelDevtoolsConfig {
  containerId?: string;
  defaultIsOpened?: boolean;
  viewModels?: ViewModelStoreBase;
  position?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';
  buttonClassName?: string;
  extras?: AnyObject;
}

export class ViewModelDevtools {
  isPopupOpened: boolean;
  displayType: string;
  vmStore: ViewModelStoreBase;
  projectVmStore?: Maybe<ViewModelStoreBase<AnyViewModel>>;
  extras: Maybe<AnyObject>;
  isAllVmsExpandedByDefault: boolean;
  expandedVmItemsPaths: ObservableSet<string>;
  logoUrl: string;
  inputRef: FocusableRef<HTMLInputElement>;
  scrollContentRef: Ref<HTMLDivElement>;
  keyboardHandler: KeyboardHandler;
  search: string;

  private expandedVmsSet: ObservableSet<string>;
  scrollListRef: Ref<VListHandle>;

  get allVms() {
    const vmStore = this.projectVmStore as Maybe<ViewModelStoreBase>;
    const viewModelsMap =
      ((vmStore as any)?.viewModels as Map<string, AnyVM>) ?? new Map();

    return [...viewModelsMap.values()].filter(
      (vm) => !ViewModelImpl.isPrototypeOf(vm.constructor),
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

  get isActive() {
    return !!this.projectVmStore || Object.keys(this.extras || {}).length > 0;
  }

  get isInSearch() {
    return !!this.search.toLowerCase().trim();
  }

  private get searchCache() {
    this.formattedSearch;
    return new Map<string, FittedInfo>();
  }

  getVMFittedInfo(vmTreeItem: VmTreeItem): FittedInfo {
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

  checkIsExtrasPropertyFitted(property: string): boolean {
    if (!this.isInSearch) {
      return true;
    }

    return this.formattedSearch.includes(property.toLowerCase());
  }

  isExpanded(vmItem: VmTreeItem) {
    return (
      this.expandedVmsSet.has(vmItem.key) ||
      this.isInSearch ||
      this.isAllVmsExpandedByDefault
    );
  }

  checkIsVmPathExpanded(vmItem: VmTreeItem, path: string) {
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

  checkIsExtraPathExpanded(path: string) {
    const expandedKey = `__EXTRA__%%%${path}`;

    return this.expandedVmItemsPaths.has(expandedKey);
  }

  handleExpandVmPropertyClick(vmItem: VmTreeItem, path: string) {
    const expandedKey = `${vmItem.key}%%%${path}`;

    if (this.expandedVmItemsPaths.has(expandedKey)) {
      this.expandedVmItemsPaths.delete(expandedKey);
    } else {
      this.expandedVmItemsPaths.add(expandedKey);
    }
  }

  handleExpandExtraPropertyClick(path: string) {
    const expandedKey = `__EXTRA__%%%${path}`;

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

  private constructor(public config: ViewModelDevtoolsConfig) {
    this.isPopupOpened = !!this.config.defaultIsOpened;
    this.search = '';
    this.displayType = 'popup';
    this.extras = this.config.extras;
    this.vmStore = new ViewModelStoreImpl();
    this.projectVmStore = this.config.viewModels;
    this.expandedVmsSet = observable.set();
    this.isAllVmsExpandedByDefault = true;
    this.expandedVmItemsPaths = observable.set<string>();
    this.logoUrl = 'https://js2me.github.io/mobx-view-model/logo.png';
    this.inputRef = createFocusableRef<HTMLInputElement>();
    this.scrollContentRef = createRef<HTMLDivElement>();
    this.scrollListRef = createRef<VListHandle>();
    this.keyboardHandler = new KeyboardHandler(this);

    makeObservable<typeof this, 'searchCache'>(this, {
      isPopupOpened: observable.ref,
      isAllVmsExpandedByDefault: observable,
      search: observable.ref,
      projectVmStore: observable.ref,
      extras: observable.ref,
      setStore: action,
      setExtras: action,
      handleExpandVmPropertyClick: action,
      handleExpandExtraPropertyClick: action,
      allVms: computed.struct,
      isActive: computed,
      isInSearch: computed,
      vmTree: computed.struct,
      rootVms: computed.struct,
      handleSearchChange: action,
      searchCache: computed,
    });

    this.render();
  }

  setStore(viewModels: ViewModelStoreBase<AnyViewModel> | undefined) {
    this.projectVmStore = viewModels;
  }

  setExtras(extras: Maybe<AnyObject>) {
    this.extras = extras;
  }

  render() {
    const containerId = this.config.containerId ?? 'view-model-devtools';

    let container = document.querySelector(
      `#${containerId}`,
    ) as Maybe<HTMLDivElement>;

    if (!container) {
      container = document.createElement('div');
      container.style = 'display: contents;';
      container.className = css.rootContainer;
      container.id = containerId;

      if (document.body) {
        document.body.appendChild(container);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(container!);
        });
      }
    }

    const root = createRoot(container);
    root.render(createElement(DevtoolsClient, { payload: { devtools: this } }));
  }

  private static _instance: ViewModelDevtools | null = null;

  static define(config?: ViewModelDevtoolsConfig) {
    if (!ViewModelDevtools._instance) {
      ViewModelDevtools._instance = new ViewModelDevtools(config ?? {});
    }

    return ViewModelDevtools._instance;
  }

  static connect(
    viewModels: ViewModelDevtoolsConfig['viewModels'],
    extras?: AnyObject,
  ) {
    const devtools = ViewModelDevtools.define();

    devtools.setStore(viewModels);
    devtools.setExtras(extras);

    return devtools;
  }

  static connectViewModels(viewModels: ViewModelDevtoolsConfig['viewModels']) {
    const devtools = ViewModelDevtools.define();
    devtools.setStore(viewModels);
    return devtools;
  }

  static connectExtras(extras: AnyObject) {
    const devtools = ViewModelDevtools.define();
    devtools.setExtras(extras);
    return devtools;
  }
}
