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
            if (devtools.isPopupOpened) {
              devtools.hidePopup();
            } else {
              devtools.showPopup();
            }
          },
        },
        {
          shortcuts: ['Escape'],
          action: () => {
            devtools.hidePopup();
          },
        },
        {
          shortcuts: ['Ctrl+ArrowLeft'],
          action: () => {
            devtools.collapseAllVms();
          },
        },
        {
          shortcuts: ['Ctrl+ArrowRight'],
          action: () => {
            devtools.expandAllVMs();
          },
        },
        {
          shortcuts: ['Tab'],
          action: (e) => {
            if (devtools.searchEngine.searchInputRef.meta.focused) {
              e.preventDefault();
            }
          },
        },
        {
          shortcuts: ['Ctrl+ArrowDown', 'PageDown'],
          action: (e) => {
            if (!devtools.scrollListRef.current) return;

            devtools.scrollListRef.current.scrollTo(
              devtools.scrollListRef.current.scrollOffset + 400,
            );

            if (devtools.searchEngine.searchInputRef.meta.focused) {
              e.stopPropagation();
              e.preventDefault();
            }
          },
        },
        {
          shortcuts: ['Ctrl+ArrowUp', 'PageUp'],
          action: (e) => {
            if (!devtools.scrollListRef.current) return;

            devtools.scrollListRef.current.scrollTo(
              devtools.scrollListRef.current.scrollOffset - 400,
            );

            if (devtools.searchEngine.searchInputRef.meta.focused) {
              e.stopPropagation();
              e.preventDefault();
            }
          },
        },
      ],
    });
  }
}
