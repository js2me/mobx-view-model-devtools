import { FolderTree, ListUl, Magnifier, Xmark } from '@gravity-ui/icons';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { ReactNode } from 'react';
import { VList } from 'virtua';
import { cx } from 'yummies/css';
import type { DevtoolsClientVM } from '@/model';
import { IconToggleButton } from '../shared/icon-toggle-button';
import { ExtrasItemRender } from './extras-item-render';
import css from './styles.module.css';
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
        <header className={css.vmContentHeader}>
          <img
            className={css.vmContentHeaderLogo}
            src={model.devtools.logoUrl}
          />
          <span className={css.vmContentHeaderTitle}>
            mobx-view-model devtools
          </span>
          {headerContent}
        </header>
        <div className={css.vmContentControlPanel}>
          <div className={css.vmContentControlPanelActions}>
            <IconToggleButton
              onUpdate={model.devtools.handleChangePresentationMode}
              options={[
                {
                  value: 'tree',
                  icon: FolderTree,
                },
                {
                  value: 'list',
                  icon: ListUl,
                },
              ]}
              value={model.devtools.presentationMode}
            />
          </div>
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
              <Xmark />
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
