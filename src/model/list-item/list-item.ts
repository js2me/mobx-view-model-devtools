import { action, computed, makeObservable } from 'mobx';
import type { ViewModelDevtools } from '../view-model-devtools';

export type ListItemViewProps<T extends ListItem<any>> = { item: T };

export abstract class ListItem<T> {
  cache: Map<string, any>;

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
    computed.struct(this, 'children');
    computed.struct(this, 'expandedChildren');
    computed.struct(this, 'expandedChildrenWithSelf')
    computed(this, 'data');
    computed(this, 'isExpandable');
    action(this, 'expand');
    action(this, 'collapse');
    makeObservable(this);
  }
}
