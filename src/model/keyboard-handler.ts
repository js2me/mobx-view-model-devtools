import {
  type KeyboardHandlerAction,
  KeyboardHandler as KeyboardHandlerLib,
} from 'mobx-swiss-knife';
import type { ViewModelDevtools } from './view-model-devtools';

export class KeyboardHandler extends KeyboardHandlerLib<KeyboardHandlerAction> {
  constructor(devtools: ViewModelDevtools) {
    super({
      actions: [
        {
          shortcuts: ['Ctrl+F12'],
          action: () => {
            devtools.isPopupOpened = !devtools.isPopupOpened;
          },
        },
        {
          shortcuts: ['Escape'],
          action: () => {
            devtools.isPopupOpened = false;
          },
        },
        {
          shortcuts: ['Ctrl+ArrowLeft'],
          action: () => {
            devtools.isAllVmsExpandedByDefault = false;
          },
        },
        {
          shortcuts: ['Ctrl+ArrowRight'],
          action: () => {
            devtools.isAllVmsExpandedByDefault = true;
          },
        },
        {
          shortcuts: ['Ctrl+ArrowDown'],
          action: () => {
            if (!devtools.scrollListRef.current) return;

            devtools.scrollListRef.current.scrollTo(
              devtools.scrollListRef.current.scrollOffset + 400,
            );
          },
        },
        {
          shortcuts: ['Ctrl+ArrowUp'],
          action: () => {
            if (!devtools.scrollListRef.current) return;

            devtools.scrollListRef.current.scrollTo(
              devtools.scrollListRef.current.scrollOffset - 400,
            );
          },
        },
      ],
    });
  }
}
