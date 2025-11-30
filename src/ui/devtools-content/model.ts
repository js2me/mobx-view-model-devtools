import { debounce } from 'lodash-es';
import {
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { createElement, type ReactNode } from 'react';
import SimpleBar from 'simplebar';
import { createRef, type Ref } from 'yummies/mobx';
import type { Maybe } from 'yummies/types';
import { type ViewModelDevtools, ViewModelImpl } from '@/model';
import { ExtraListItem } from '@/model/list-item/extra-list-item';
import { MetaListItem } from '@/model/list-item/meta-list-item';
import { PropertyListItem } from '@/model/list-item/property-list-item';
import { VMListItem } from '@/model/list-item/vm-list-item';
import { ExtraListItemRender } from './list-items/extra-list-item-render';
import { MetaListItemRender } from './list-items/meta-list-item-render';
import { PropertyListItemRender } from './list-items/property-list-item-render';
import { VmListItemRender } from './list-items/vm-list-item-render';

const listItemRenderersMap = new Map<any, any>([
  [VMListItem, VmListItemRender],
  [ExtraListItem, ExtraListItemRender],
  [PropertyListItem, PropertyListItemRender],
  [MetaListItem, MetaListItemRender],
]);
export class DevtoolsContentVM extends ViewModelImpl<{
  devtools: ViewModelDevtools;
  ref?: Ref<HTMLDivElement>;
}> {
  private offsetIndex = -4;

  itemsCount = 0;

  contentRef = createRef<HTMLDivElement, { scrollbar: Maybe<SimpleBar> }>({
    meta: { scrollbar: null },
    onChange: this.payload.ref,
    onSet: (node) => {
      const scrollbar = new SimpleBar(node);
      this.contentRef.meta = { scrollbar };
      const scrollElement = scrollbar.getScrollElement();

      console.log('on set');

      if (!scrollElement) return;

      runInAction(() => {
        this.itemsCount = Math.round(scrollElement.clientHeight / 22) + 40 + 4;
      });

      reaction(
        () => this.payload.devtools.listItems.length,
        () => this.handleRefreshItems(),
        {
          fireImmediately: true,
        },
      );
      this.virtualizedContentRef.current!.style.height =
        `${node.clientHeight - 60}px`;
      scrollElement.addEventListener(
        'scroll',
        debounce(this.handleRefreshItems, 50),
      );
    },
  });

  virtualizedContentRef = createRef<HTMLDivElement>();

  @computed
  get virtualHeight() {
    return this.payload.devtools.listItems.length * 22;
  }

  get itemNodes(): ReactNode[] {
    const result: ReactNode[] = [];

    for (let virtIndex = 0; virtIndex < this.itemsCount; virtIndex++) {
      const i = this.offsetIndex + virtIndex;
      const listItem = this.payload.devtools.listItems[i];
      const component = listItemRenderersMap.get(listItem?.constructor);

      if (component) {
        result.push(createElement(component, { item: listItem }));
      }
    }

    return result;
  }

  handleRefreshItems = () => {
    const scrollElement = this.contentRef.meta.scrollbar?.getScrollElement();

    if (!scrollElement) return;

    this.virtualizedContentRef.current!.style.transform =
      `translateY(${scrollElement.scrollTop}px)`;

    runInAction(() => {
      this.offsetIndex = Math.ceil(scrollElement.scrollTop / 22);
    });
  };

  willMount(): void {
    makeObservable<typeof this, 'offsetIndex'>(this, {
      offsetIndex: observable.ref,
      itemsCount: observable.ref,
    });
  }
}
