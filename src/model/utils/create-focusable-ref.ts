import { action, runInAction } from 'mobx';
import { type CreateRefConfig, createRef, type Ref } from 'yummies/mobx';
import type { Maybe } from 'yummies/types';

export interface FocusableRef<T extends HTMLElement = HTMLElement>
  extends Ref<T, { focused: boolean }> {}

export const createFocusableRef = <T extends HTMLElement = HTMLElement>(
  cfg?: Pick<CreateRefConfig<T>, 'onSet' | 'onUnset'>,
): FocusableRef<T> => {
  const handleFocus = action(() => {
    ref.meta.focused = true;
  });

  const handleBlur = action(() => {
    ref.meta.focused = false;
  });

  let lastNode: Maybe<T>;

  const ref = createRef({
    meta: {
      focused: false,
    },
    onSet: (node: T) => {
      if (document.activeElement === node) {
        runInAction(() => {
          ref.meta.focused = true;
        });
      }
      node.addEventListener('focus', handleFocus);
      node.addEventListener('blur', handleBlur);
      cfg?.onSet?.(node);
      lastNode = node;
    },
    onUnset: () => {
      cfg?.onUnset?.();
      lastNode?.removeEventListener('focus', handleFocus);
      lastNode?.removeEventListener('blur', handleBlur);
      lastNode = undefined;
    },
  });

  return ref;
};
