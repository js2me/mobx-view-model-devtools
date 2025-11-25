import SimpleBar from 'simplebar';
import { createRef, type Ref } from 'yummies/mobx';
import type { Maybe } from 'yummies/types';
import { type ViewModelDevtools, ViewModelImpl } from '@/model';

export class DevtoolsContentVM extends ViewModelImpl<{
  devtools: ViewModelDevtools;
  ref?: Ref<HTMLDivElement>;
}> {
  contentRef = createRef<HTMLDivElement>({
    meta: { scrollbar: null as Maybe<SimpleBar> },
    onChange: this.payload.ref,
    onSet: (node) => {
      const scrollbar = new SimpleBar(node);
      this.contentRef.meta = { scrollbar };
    },
  });
}
