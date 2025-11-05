import { action, runInAction } from 'mobx';
import { createRef, type Ref } from 'yummies/mobx';

export interface FocusableRef<T extends HTMLElement = HTMLElement>
  extends Ref<T, { focused: boolean }> {}

export const createFocusableRef = <
  T extends HTMLElement = HTMLElement,
>(): FocusableRef<T> => {
  const ref = createRef({
    meta: {
      focused: false,
    },
    onSet: (input: T) => {
      if (document.activeElement === input) {
        runInAction(() => {
          ref.meta.focused = true;
        });
      }
      input.addEventListener(
        'focus',
        action(() => {
          ref.meta.focused = true;
        }),
      );
      input.addEventListener(
        'blur',
        action(() => {
          ref.meta.focused = false;
        }),
      );
    },
  });

  return ref;
};
