import { computed, makeObservable, untracked } from 'mobx';
import type { AnyObject } from 'yummies/types';
import type { AnyVM } from '../types';
import type { ViewModelDevtools } from '../view-model-devtools';
import { ListItem } from './list-item';
import { PropertyListItem } from './property-list-item';

export class ExtraListItem extends ListItem<AnyVM> {
  get isFitted() {
    const { searchEngine } = this.devtools;

    if (!searchEngine.isActive) {
      return true;
    }

    const firstSegment = searchEngine.segments[0];
    const secondSegment = searchEngine.segments[1];

    let isFittedByName: boolean;

    if (secondSegment) {
      isFittedByName = this.searchData.name === firstSegment;
    } else {
      isFittedByName = this.searchData.name.startsWith(firstSegment);
    }

    return isFittedByName;
  }

  private get propertyListItems(): PropertyListItem[] {
    return Object.keys(this.data || {}).map((property, order) => {
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
    return [...this.propertyListItems];
  }

  get depth(): number {
    return 0;
  }

  searchData;

  displayName;

  constructor(devtools: ViewModelDevtools, extras: AnyObject) {
    const displayName = 'Extras';
    const key = `extra$$$-${displayName}-`;

    super(devtools, key, extras, undefined, new Map());

    this.displayName = displayName;
    this.searchData = {
      name: displayName.toLowerCase().trim(),
    };

    computed.struct(this, 'propertyListItems');
    makeObservable(this);

    untracked(() => {
      this.expand();
    });
  }
}
