import { ArrowsRotateRight, FileArrowRightOut } from '@gravity-ui/icons';
import { action, computed, createAtom, makeObservable } from 'mobx';
import type { ComponentType } from 'react';
import type { ViewModelDevtools } from '../view-model-devtools';

export type ListItemViewProps<T extends ListItem<any>> = { item: T };

export type ListItemOperation<T> =
  | {
      title: string;
      icon: ComponentType;
      action: VoidFunction;
    }
  | ComponentType<ListItemViewProps<ListItem<T>>>;

export abstract class ListItem<T> {
  cache: Map<string, any>;

  protected tempVarName: string = '';

  protected dataWatchAtom = createAtom('');

  get isExpanded() {
    return this.cache.get(this.expandKey) === true;
  }

  get children() {
    return this.getChildren?.(this) ?? [];
  }

  get isExpandable() {
    return this.children.length > 0;
  }

  expand() {
    if (this.isExpandable) {
      this.cache.set(this.expandKey, true);
    }
  }

  collapse() {
    this.cache.set(this.expandKey, false);
  }

  toggleExpand() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  get expandedChildren(): ListItem<any>[] {
    if (!this.isExpanded) {
      return [];
    }

    const result: ListItem<any>[] = [];

    let stackIndex = 0;
    const stack: ListItem<any>[] = this.children;

    while (true) {
      const child = stack[stackIndex++];

      if (!child) {
        break;
      }

      result.push(child, ...child.expandedChildren);
    }

    return result;
  }

  get expandedChildrenWithSelf(): ListItem<any>[] {
    return [this, ...this.expandedChildren];
  }

  get data() {
    return this._data;
  }

  get isFitted() {
    return true;
  }

  abstract get depth(): number;

  get depthLine() {
    return String().padEnd(this.depth, '-');
  }

  get stringifiedData() {
    return String(this.data);
  }

  get operations(): ListItemOperation<T>[] {
    return [
      {
        title: 'Save into $temp(N) global variable. $temp1, $temp2, $temp3',
        icon: FileArrowRightOut,
        action: () => {
          if (!this.tempVarName) {
            let counter = 1;

            while (`$temp${counter}` in globalThis) {
              counter++;
            }

            this.tempVarName = `$temp${counter}`;
          }

          Object.assign(globalThis, {
            [this.tempVarName]: this.data,
          });

          this.devtools.notifications.push({
            title: this.getSavedTempVarNotification(this.tempVarName),
          });
        },
      },
      {
        title: 'Refresh value',
        icon: ArrowsRotateRight,
        action: () => this.dataWatchAtom.reportChanged(),
      },
    ];
  }

  getSavedTempVarNotification(tempVarName: string) {
    return `Saved into ${tempVarName}`;
  }

  expandKey;

  constructor(
    public devtools: ViewModelDevtools,
    public key: string,
    private _data: T,
    private getChildren?: (item: ListItem<T>) => ListItem<any>[],
    cache?: Map<string, any>,
  ) {
    this.cache = cache ?? devtools.anyCache;
    this.expandKey = `${key}/expand-key`;
    computed(this, 'isExpanded');
    computed(this, 'isFitted');
    computed(this, 'totalChildCount');
    computed(this, 'depthLine');
    computed(this, 'depth');
    computed(this, 'stringifiedData');
    computed.struct(this, 'operations');
    computed.struct(this, 'children');
    computed.struct(this, 'expandedChildren');
    computed.struct(this, 'expandedChildrenWithSelf');
    computed(this, 'data');
    computed(this, 'isExpandable');
    action(this, 'expand');
    action(this, 'collapse');
    makeObservable(this);
  }
}
