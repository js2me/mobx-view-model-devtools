import { cx } from 'yummies/css';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { ReactNode } from 'react';
import { Virtualizer } from 'virtua';
import css from '@/styles.module.css';
import { DevtoolsVM } from '@/model';
import { VmTreeItemRender } from './vm-tree-item-render';

export const VmDevtoolsContent = observer(
  ({
    className,
    headerContent,
    ...props
  }: {
    className?: string;
    headerContent?: ReactNode;
  }) => {
    const model = useViewModel<DevtoolsVM>();

    return (
      <div
        {...props}
        className={cx(css.vmContent, className)}
        ref={model.containerRef}
      >
        <header>
          <span>mobx-view-model devtools</span>
          {headerContent}
        </header>
        <div className={css.vmContentFilters}>
          <input
            value={model.search}
            ref={model.inputRef}
            autoFocus
            placeholder="search by property path or ViewModel name"
            onChange={model.handleSearchChange}
          />
        </div>
        <div className={css.vmContentTree}>
          <Virtualizer>
            {model.vmTree.map((vmItem) => (
              <VmTreeItemRender
                payload={{ vmItem, devtoolsVM: model }}
                key={vmItem.key}
              />
            ))}
          </Virtualizer>
        </div>
      </div>
    );
  },
);
