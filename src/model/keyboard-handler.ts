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
          shortcuts: ['Ctrl+Shift+F12'],
          action: () => {
            devtools.handleToggleOpen();
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
            requestAnimationFrame(() => {
              devtools.containerRef.current!.scrollTop += 200;
            });
          },
        },
        {
          shortcuts: ['Ctrl+ArrowUp'],
          action: () => {
            requestAnimationFrame(() => {
              devtools.containerRef.current!.scrollTop -= 200;
            });
          },
        },
      ],
    });
  }
}
