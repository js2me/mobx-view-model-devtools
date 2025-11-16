import SimpleBar from 'simplebar';
import { createRef } from 'yummies/mobx';
import type { Maybe } from 'yummies/types';
import { type ViewModelDevtools, ViewModelImpl } from '@/model';

export class DevtoolsClientVM extends ViewModelImpl<{
  devtools: ViewModelDevtools;
}> {
  devtools = this.payload.devtools;

  contentRef = createRef<HTMLDivElement>({
    meta: { scrollbar: null as Maybe<SimpleBar> },
    onSet(node) {
      const scrollbar = new SimpleBar(node);
      this.meta = { scrollbar };
    },
  });
}
