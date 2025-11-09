import {
  action,
  computed,
  makeObservable,
  type ObservableSet,
  observable,
  reaction,
} from 'mobx';
import type {
  AnyViewModel,
  ViewModelParams,
  ViewModelStoreBase,
} from 'mobx-view-model';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { VListHandle } from 'virtua';
import { createRef, type Ref } from 'yummies/mobx';
import type { AnyObject, Maybe } from 'yummies/types';
import { DevtoolsClient } from '@/ui/devtools-client';
import css from '../styles.module.css';
import { KeyboardHandler } from './keyboard-handler';
import { ViewModelImpl } from './lib/view-model.impl';
import { ViewModelStoreImpl } from './lib/view-model-store.impl';
import { SearchEngine } from './search-engine';
import type { AnyVM, VmTreeItem } from './types';
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
  searchEngine: SearchEngine;
  isHierarchyMode: boolean;

  private expandedVmsSet: ObservableSet<string>;
  scrollListRef: Ref<VListHandle>;
  private autoscrollTimeout: number | undefined;

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
        searchData: {
          name: displayName.toLowerCase().trim(),
          id: (vm.id || '').toLowerCase().trim(),
        },
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

  private get containerId() {
    return this.config.containerId ?? 'view-model-devtools';
  }

  isExpanded(vmItem: VmTreeItem) {
    return (
      this.expandedVmsSet.has(vmItem.key) ||
      this.searchEngine.isActive ||
      this.isAllVmsExpandedByDefault
    );
  }

  checkIsVmPathExpanded(vmItem: VmTreeItem, path: string) {
    const searchResult = this.searchEngine.getSearchResult({
      item: vmItem,
      type: 'vm',
    });

    if (searchResult.fittedPath.length) {
      if (searchResult.isFittedById || searchResult.isFittedByName) {
        if (
          searchResult.fittedPath
            .slice(1)
            .join('.')
            .startsWith(path.toLowerCase())
        ) {
          return true;
        }
      } else {
        if (searchResult.fittedPath.join('.').startsWith(path.toLowerCase())) {
          return true;
        }
      }
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

  private getVmParams(vm: AnyVM): null | ViewModelParams {
    if ('vmParams' in vm) {
      return vm.vmParams as ViewModelParams;
    }

    return null;
  }

  setStore(viewModels: ViewModelStoreBase<AnyViewModel> | undefined) {
    this.projectVmStore = viewModels;
  }

  setExtras(extras: Maybe<AnyObject>) {
    this.extras = extras;
  }

  toggleHierarchyMode = () => {
    this.isHierarchyMode = !this.isHierarchyMode;
  };

  private init() {
    reaction(
      () => this.searchEngine.formattedSearchText,
      () => {
        clearTimeout(this.autoscrollTimeout!);

        this.autoscrollTimeout = setTimeout(() => {
          if (!this.isActive) {
            this.scrollListRef.current?.scrollTo(0);
            return;
          }

          let maxLevel = 0;
          let lastFoundElementIndex: number | undefined;

          const htmlCollection = document.querySelectorAll(
            `#${this.containerId} [data-fitted]`,
          );

          (htmlCollection as any).forEach(
            (element: HTMLElement, index: number) => {
              if (
                element.dataset.fitted === 'true' &&
                element.dataset.depth &&
                element.dataset.depth.length >= maxLevel
              ) {
                maxLevel = element.dataset.depth!.length;
                lastFoundElementIndex = index;
              }
            },
          );

          if (lastFoundElementIndex === undefined) {
            this.scrollListRef.current?.scrollTo(90);
          } else {
            this.scrollListRef.current?.scrollToIndex(lastFoundElementIndex, {
              align: 'center',
              offset: -65,
              smooth: true,
            });
          }
        }, 200);
      },
    );
  }

  render() {
    let container = document.querySelector(
      `#${this.containerId}`,
    ) as Maybe<HTMLDivElement>;

    if (!container) {
      container = document.createElement('div');
      container.style = 'display: contents;';
      container.className = css.rootContainer;
      container.id = this.containerId;

      if (document.body) {
        document.body.appendChild(container);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(container!);
        });
      }

      this.init();
    }

    const root = createRoot(container);
    root.render(createElement(DevtoolsClient, { payload: { devtools: this } }));
  }

  private static _instance: ViewModelDevtools | null = null;

  private constructor(public config: ViewModelDevtoolsConfig) {
    this.isPopupOpened = !!this.config.defaultIsOpened;
    this.displayType = 'popup';
    this.extras = this.config.extras;
    this.vmStore = new ViewModelStoreImpl();
    this.projectVmStore = this.config.viewModels;
    this.expandedVmsSet = observable.set();
    this.isAllVmsExpandedByDefault = true;
    this.isHierarchyMode = true;
    this.expandedVmItemsPaths = observable.set<string>();
    this.logoUrl =
      'data:image/png;base64,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';
    this.inputRef = createFocusableRef<HTMLInputElement>();
    this.scrollContentRef = createRef<HTMLDivElement>();
    this.scrollListRef = createRef<VListHandle>();
    this.keyboardHandler = new KeyboardHandler(this);
    this.searchEngine = new SearchEngine();

    makeObservable(this, {
      isPopupOpened: observable.ref,
      isAllVmsExpandedByDefault: observable,
      projectVmStore: observable.ref,
      isHierarchyMode: observable.ref,
      extras: observable.ref,
      setStore: action,
      setExtras: action,
      toggleHierarchyMode: action,
      handleExpandVmPropertyClick: action,
      handleExpandExtraPropertyClick: action,
      allVms: computed.struct,
      isActive: computed,
      vmTree: computed.struct,
      rootVms: computed.struct,
    });

    this.render();
  }

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
