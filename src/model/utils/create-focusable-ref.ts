import { action, runInAction } from 'mobx';
import { createRef } from 'yummies/mobx';

export const createFocusableRef = <T extends HTMLElement = HTMLElement>() => {
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
