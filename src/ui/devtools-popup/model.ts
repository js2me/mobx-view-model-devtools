import { clamp } from 'lodash-es';
import { createRef } from 'yummies/mobx';
import type { Defined, Maybe } from 'yummies/types';
import { type ViewModelDevtoolsConfig, ViewModelImpl } from '@/model';
import type { DevtoolsClientVM } from '../devtools-client/model';
import css from './styles.module.css';

export class VmDevtoolsPopupVM extends ViewModelImpl<{}, DevtoolsClientVM> {
  devtools = this.parentViewModel.devtools;

  static lastX: number | null = null;

  dragState = {
    isDragging: false,
    offsetX: 0,
    hasMoved: false,
    startX: 0,
  };

  private rect: Maybe<DOMRect> = null;

  contentRef = createRef<HTMLDivElement>({
    onSet: (node) => {
      if (VmDevtoolsPopupVM.lastX !== null) {
        node.style.left = `${this.fixX(VmDevtoolsPopupVM.lastX)}px`;
      }

      node.addEventListener('mousedown', (e: MouseEvent) => {
        const path = e.composedPath();
        const isDragOnContentHeader = path.some(
          (it) => (it as HTMLElement).dataset?.contentHeader,
        );

        if (!isDragOnContentHeader) {
          return;
        }

        this.dragState.isDragging = true;
        this.dragState.hasMoved = false;

        const rect = node.getBoundingClientRect();
        this.dragState.offsetX = rect.left - e.clientX;
        this.dragState.startX = rect.left;

        node.classList.add(css.dragging);
      });

      const handleMouseMove = (e: MouseEvent) => {
        if (!this.dragState.isDragging) return;

        const x = this.fixX(e.clientX + this.dragState.offsetX);

        node.style.left = `${x}px`;

        VmDevtoolsPopupVM.lastX = x;

        if (x !== this.dragState.startX) {
          this.dragState.hasMoved = true;
        }
      };

      const handleStopDragging = () => {
        this.dragState.isDragging = false;
        node.classList.remove(css.dragging);
        this.dragState.hasMoved = false;
      };

      // node.addEventListener('click', (e: MouseEvent) => {
      //   if (this.dragState.hasMoved) {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     return;
      //   }
      // });

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleStopDragging);
      window.addEventListener('blur', handleStopDragging);
    },
  });

  get position(): Defined<ViewModelDevtoolsConfig['position']> {
    const { left, top } = this.offsets;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const isLeft = left < centerX;
    const isTop = top < centerY;

    if (isTop && isLeft) return 'top-left';
    if (isTop && !isLeft) return 'top-right';
    if (!isTop && isLeft) return 'bottom-left';

    return 'bottom-right';
  }

  private get offsets() {
    this.rect = this.contentRef.current?.getBoundingClientRect();

    return {
      left: this.rect?.left ?? 0,
      top: this.rect?.top ?? 0,
    };
  }

  private get size() {
    if (!this.rect && this.contentRef.current) {
      this.rect = this.contentRef.current.getBoundingClientRect();
    }

    return {
      width: this.rect?.width ?? 0,
      height: this.rect?.height ?? 0,
    };
  }

  private fixX(rawX: Maybe<number | string>) {
    const minX = 12;
    const maxX = window.innerWidth - this.size.width - 12;

    const x = typeof rawX === 'string' ? +rawX.replace('px', '') : rawX;

    return clamp(x || 0, minX, maxX);
  }
}
