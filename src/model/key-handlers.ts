import { KeyboardHandler, type KeyboardHandlerAction } from 'mobx-swiss-knife';
import type { DevtoolsVM } from './model';

export class KeyHanders extends KeyboardHandler<KeyboardHandlerAction> {
  constructor(vm: DevtoolsVM) {
    super({
      abortSignal: vm.unmountSignal,
      actions: [
        {
          shortcuts: ['Ctrl+Shift+F12'],
          action: () => {
            vm.handleToggleOpen();
          },
        },
        {
          shortcuts: ['Ctrl+ArrowLeft'],
          action: () => {
            vm.isAllVmsExpandedByDefault = false;
          },
        },
        {
          shortcuts: ['Ctrl+ArrowRight'],
          action: () => {
            vm.isAllVmsExpandedByDefault = true;
          },
        },
        {
          shortcuts: ['Ctrl+ArrowDown'],
          action: () => {
            requestAnimationFrame(() => {
              vm.containerRef.current!.scrollTop += 200;
            });
          },
        },
        {
          shortcuts: ['Ctrl+ArrowUp'],
          action: () => {
            requestAnimationFrame(() => {
              vm.containerRef.current!.scrollTop -= 200;
            });
          },
        },
      ],
    });
  }
}
