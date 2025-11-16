import { computed, makeObservable } from 'mobx';
import { typeGuard } from 'yummies/type-guard';
import type { Maybe } from 'yummies/types';
import { getAllKeys } from '../utils/get-all-keys';
import type { ViewModelDevtools } from '../view-model-devtools';
import { ListItem } from './list-item';
import { MetaListItem } from './meta-list-item';
import { VMListItem } from './vm-list-item';

export class PropertyListItem extends ListItem<any> {
  get data() {
    return this.property && this.parent.data[this.property];
  }

  get dataType() {
    return typeof this.data;
  }

  get stringifiedDataType() {
    return Object.prototype.toString.call(this.data);
  }

  get type() {
    if (Array.isArray(this.data)) {
      return 'array';
    }

    if (
      typeGuard.isObject(this.data) &&
      this.data.constructor?.name &&
      this.data.constructor.name !== 'Object'
    ) {
      return 'instance';
    } else if (typeGuard.isFunction(this.data)) {
      return 'function';
    } else if (typeGuard.isObject(this.data)) {
      return 'object';
    } else if (
      this.stringifiedDataType.startsWith('[object ') &&
      this.data &&
      typeof this.data === 'object' &&
      'constructor' in this.data
    ) {
      return 'instance';
    } else {
      return 'primitive';
    }
  }

  get children(): PropertyListItem[] {
    if (this.type === 'array') {
      const arrayChildItems = Object.keys(this.data).map((property, order) =>
        PropertyListItem.create(
          this.devtools,
          property,
          `${this.path}.${property}`,
          order,
          this,
        ),
      );

      arrayChildItems.push(
        PropertyListItem.create(
          this.devtools,
          'length',
          `${this.path}.length`,
          arrayChildItems.length,
          this,
        ),
      );

      return arrayChildItems;
    }

    if (this.type === 'function') {
      return Object.keys(this.data).map((property, order) => {
        return PropertyListItem.create(
          this.devtools,
          property,
          `${this.path}.${property}`,
          order,
          this,
        );
      })
    }

    if (this.type === 'instance' || this.type === 'object') {
      return getAllKeys(this.data).map((property, order) => {
        return PropertyListItem.create(
          this.devtools,
          property,
          `${this.path}.${property}`,
          order,
          this,
        );
      });
    }

    return [];
  }

  get isFitted() {
    const { searchEngine } = this.devtools;

    if (!searchEngine.isActive || !this.property) {
      return true;
    }

    return searchEngine.segments.some((it) => it.startsWith(this.property!));
  }

  get extraContent() {
    if (this.isExpanded) {
      return null;
    }

    if (this.parent.isExpanded) {
      if (this.parent instanceof VMListItem) {
        return ',';
      }
      if (this.parent instanceof PropertyListItem)
        switch (this.parent.type) {
          case 'array':
          case 'instance':
          case 'object':
            return ',';
        }
    }

    return null;
  }

  private get propertyClosingTag(): ListItem<any> | null {
    switch (this.type) {
      case 'array':
        return new MetaListItem(
          this.devtools,
          `${this.key}/closing-tag`,
          ']',
          this.depth,
        );
      case 'instance':
      case 'object':
        return new MetaListItem(
          this.devtools,
          `${this.key}/closing-tag`,
          '}',
          this.depth,
        );
      default:
        return null;
    }
  }

  get expandedChildren(): ListItem<any>[] {
    if (!this.isExpanded || !this.isExpandable) {
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

    if (this.propertyClosingTag) {
      result.push(this.propertyClosingTag);
    }

    return result;
  }

  get depth() {
    return this.parent.depth + 1;
  }

  get searchData() {
    return {
      property: this.property?.toLowerCase() || '',
    };
  }

  protected constructor(
    devtools: ViewModelDevtools,
    public property: Maybe<string>,
    public path: string,
    public order: number,
    private parent: ListItem<any>,
  ) {
    super(devtools, PropertyListItem.createKey(parent, property), undefined);

    computed(this, 'type');
    computed(this, 'searchData');
    computed(this, 'propertyClosingTag');
    computed(this, 'dataType');
    computed(this, 'stringifiedDataType');
    computed(this, 'extraContent');
    makeObservable(this);
  }

  static createKey(parent: ListItem<any>, property: Maybe<string>) {
    return `${parent.key}-${property}`;
  }

  static create(
    devtools: ViewModelDevtools,
    property: Maybe<string>,
    path: string,
    order: number,
    parent: ListItem<any>,
  ) {
    const cache = parent.cache ?? devtools.anyCache;
    const key = `${PropertyListItem.createKey(parent, property)}/list-item`;

    let item: Maybe<PropertyListItem> = cache.get(key);

    if (!item) {
      item = new PropertyListItem(devtools, property, path, order, parent);
      cache.set(key, item);
    }

    return item;
  }
}
