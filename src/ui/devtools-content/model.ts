import {
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import SimpleBar from 'simplebar';
import { createRef, type Ref } from 'yummies/mobx';
import type { Maybe } from 'yummies/types';
import { type ViewModelDevtools, ViewModelImpl } from '@/model';
import type { ListItem } from '@/model/list-item/list-item';

export class DevtoolsContentVM extends ViewModelImpl<{
  devtools: ViewModelDevtools;
  ref?: Ref<HTMLDivElement>;
}> {
  private offsetIndex = -4;

  contentRef = createRef<HTMLDivElement, { scrollbar: Maybe<SimpleBar> }>({
    meta: { scrollbar: null },
    onChange: this.payload.ref,
    onSet: (node) => {
      const scrollbar = new SimpleBar(node);
      this.contentRef.meta = { scrollbar };
      const scrollElement = scrollbar.getScrollElement();

      if (!scrollElement) return;

      reaction(
        () => this.payload.devtools.listItems.length,
        () => this.handleRefreshItems(),
        {
          fireImmediately: true,
        },
      );
      this.virtualizedContentRef.current!.style.height = `${node.clientHeight - 60}px`;
      scrollElement.addEventListener('scroll', this.handleRefreshItems);
    },
  });

  virtualizedContentRef = createRef<HTMLDivElement>();

  get itemsCount() {
    const clientHeight =
      this.contentRef.meta.scrollbar?.getScrollElement()?.clientHeight ?? 0;
    if (!clientHeight) {
      return 0;
    }
    return Math.round(clientHeight / 22) + 8 + 4;
  }

  get items() {
    const listItems: ListItem<any>[] = [];

    for (let virtIndex = 0; virtIndex < this.itemsCount; virtIndex++) {
      const i = this.offsetIndex + virtIndex;
      const listItem = this.payload.devtools.listItems[i];
      if (listItem) {
        listItem.metaData.i = i;
        listItems.push(listItem);
      }
    }

    return listItems;
  }

  handleRefreshItems = () => {
    const scrollElement = this.contentRef.meta.scrollbar?.getScrollElement();

    if (!scrollElement) return;

    this.virtualizedContentRef.current!.style.transform =
      `translateY(${scrollElement.scrollTop}px)`;

    runInAction(() => {
      this.offsetIndex = Math.floor(scrollElement.scrollTop / 22);
    });
  };

  willMount(): void {
    makeObservable<typeof this, 'offsetIndex'>(this, {
      itemsCount: computed,
      offsetIndex: observable.ref,
      items: computed.struct,
    });
  }
}
