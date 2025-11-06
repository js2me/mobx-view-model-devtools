import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { ReactNode } from 'react';
import { Virtualizer } from 'virtua';
import { cx } from 'yummies/css';
import type { DevtoolsClientVM } from '@/model';
import css from '@/styles.module.css';
import { ExtrasItemRender } from './extras-item-render';
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
    const model = useViewModel<DevtoolsClientVM>();

    return (
      <div
        {...props}
        className={cx(css.vmContent, className)}
        ref={model.devtools.containerRef}
      >
        <header>
          <span>mobx-view-model devtools</span>
          {headerContent}
        </header>
        <div className={css.vmContentFilters}>
          <input
            value={model.devtools.search}
            ref={model.devtools.inputRef}
            autoFocus
            placeholder="search by property path or ViewModel name"
            onChange={model.devtools.handleSearchChange}
          />
        </div>
        <div className={css.vmContentTree}>
          <Virtualizer>
            {model.devtools.vmTree.map((vmItem) => (
              <VmTreeItemRender
                payload={{ vmItem, devtools: model.devtools }}
                key={vmItem.key}
              />
            ))}
            {!!model.devtools.extras && (
              <ExtrasItemRender
                payload={{
                  extras: model.devtools.extras,
                  devtools: model.devtools,
                }}
              />
            )}
          </Virtualizer>
        </div>
      </div>
    );
  },
);
