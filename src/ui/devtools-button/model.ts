import { runInAction } from 'mobx';
import { ViewModelBase } from 'mobx-view-model';
import { createRef } from 'yummies/mobx';
import type { Defined } from 'yummies/types';
import type { ViewModelDevtoolsConfig } from '@/model';
import type { DevtoolsClientVM } from '../devtools-client/model';
import css from './styles.module.css';

export class VmDevtoolsButtonVM extends ViewModelBase<{}, DevtoolsClientVM> {
  devtools = this.parentViewModel.devtools;

  ref = createRef<HTMLButtonElement>({
    onSet: (node) => {
      const dragState = {
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        hasMoved: false,
        startX: 0,
        startY: 0,
      };

      const { width, height } = node.getBoundingClientRect();

      node.addEventListener('mousedown', (e: MouseEvent) => {
        dragState.isDragging = true;
        dragState.hasMoved = false;

        const rect = node.getBoundingClientRect();
        dragState.offsetX = rect.left - e.clientX;
        dragState.offsetY = rect.top - e.clientY;
        dragState.startX = rect.left;
        dragState.startY = rect.top;

        node.classList.add(css.dragging);
      });

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragState.isDragging) return;

        let x = e.clientX + dragState.offsetX;
        let y = e.clientY + dragState.offsetY;
        const minX = 12;
        const minY = 12;
        const maxX = window.innerWidth - width - 12;
        const maxY = window.innerHeight - height - 12;

        if (x < minX) {
          x = minX;
        }
        if (y < minY) {
          y = minY;
        }
        if (x > maxX) {
          x = maxX;
        }
        if (y > maxY) {
          y = maxY;
        }

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        if (x !== dragState.startX || y !== dragState.startY) {
          dragState.hasMoved = true;
        }
      };

      const handleMouseUp = () => {
        dragState.isDragging = false;
        node.classList.remove(css.dragging);

        if (this.position !== this.devtools.position) {
          runInAction(() => {
            this.devtools.position = this.position;
          });
        }
      };

      node.addEventListener('click', (e: MouseEvent) => {
        if (dragState.hasMoved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        this.handleClick();
      });

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
  });

  handleClick = () => {
    if (this.devtools.isPopupOpened) {
      this.devtools.hidePopup();
    } else {
      this.devtools.showPopup();
    }
  };

  private get position(): Defined<ViewModelDevtoolsConfig['position']> {
    const rect = this.ref.current?.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const isLeft = (rect?.left ?? 0) < centerX;
    const isTop = (rect?.top ?? 0) < centerY;

    if (isTop && isLeft) return 'top-left';
    if (isTop && !isLeft) return 'top-right';
    if (!isTop && isLeft) return 'bottom-left';
    return 'bottom-right';
  }
}
