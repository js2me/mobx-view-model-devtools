import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { ReactNode } from 'react';
import { VList } from 'virtua';
import { cx } from 'yummies/css';
import type { DevtoolsClientVM } from '@/model';
import css from '@/styles.module.css';
import { Magnifier } from '../icons/magnifier';
import { XMark } from '../icons/x-mark';
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
      <div {...props} className={cx(css.vmContent, className)}>
        <header>
          <span>mobx-view-model devtools</span>
          {headerContent}
        </header>
        <div className={css.vmContentFilters}>
          <div className={`${css.vmContentInput} ${model.devtools.searchEngine.isActive && css.filled}`}>
            <Magnifier />
            <input
              ref={model.devtools.searchEngine.searchInputRef}
              autoFocus
              placeholder="search by property path or ViewModel name"
            />
            <button onClick={model.devtools.searchEngine.resetSearch}>
              <XMark />
            </button>
          </div>
        </div>
        <VList className={css.vmContentTree} ref={model.devtools.scrollListRef} itemSize={22}>
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
        </VList>
      </div>
    );
  },
);
