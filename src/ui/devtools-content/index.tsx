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
          <div className={css.baseActions}>
            <button
              className={cx(css.hierarchyButton, {
                [css.active]: model.devtools.isHierarchyMode,
              })}
              onClick={model.devtools.toggleHierarchyMode}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M12.25 2.5h-8.5a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75m0 4.5H5v3.13c0 .69.56 1.25 1.25 1.25H7v-.13A2.25 2.25 0 0 1 9.25 9h3a2.25 2.25 0 0 1 2.25 2.25v1.5A2.25 2.25 0 0 1 12.25 15h-3a2.25 2.25 0 0 1-2.246-2.12H6.25a2.75 2.75 0 0 1-2.75-2.75V6.986a2.25 2.25 0 0 1-2-2.236v-1.5A2.25 2.25 0 0 1 3.75 1h8.5a2.25 2.25 0 0 1 2.25 2.25v1.5A2.25 2.25 0 0 1 12.25 7m-3 3.5h3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          {headerContent}
        </header>
        <div className={css.vmContentFilters}>
          <div
            className={`${css.vmContentInput} ${model.devtools.searchEngine.isActive && css.filled}`}
          >
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
        <VList
          className={css.vmContentTree}
          ref={model.devtools.scrollListRef}
          itemSize={22}
        >
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
