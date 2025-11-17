import {
  BarsAscendingAlignLeftArrowDown,
  BarsDescendingAlignCenter,
  BarsDescendingAlignLeftArrowUp,
  FolderTree,
  ListUl,
  Magnifier,
  Xmark,
} from '@gravity-ui/icons';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { ReactNode } from 'react';
import { Virtualizer } from 'virtua';
import { cx } from 'yummies/css';
import { ExtraListItem } from '@/model/list-item/extra-list-item';
import { MetaListItem } from '@/model/list-item/meta-list-item';
import { PropertyListItem } from '@/model/list-item/property-list-item';
import { VMListItem } from '@/model/list-item/vm-list-item';
import type { DevtoolsClientVM } from '../devtools-client/model';
import { IconToggleButton } from '../shared/icon-toggle-button';
import { ExtraListItemRender } from './list-items/extra-list-item-render';
import { MetaListItemRender } from './list-items/meta-list-item-render';
import { PropertyListItemRender } from './list-items/property-list-item-render';
import { VmListItemRender } from './list-items/vm-list-item-render';
import css from './styles.module.css';

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
        ref={model.contentRef}
      >
        <header className={css.vmContentHeader}>
          <div className={css.gradientBlur} />
          <div className={css.vmContentHeaderTitle}>
            <img
              className={css.vmContentHeaderLogo}
              src={model.devtools.logoUrl}
            />
            <span className={css.vmContentHeaderTitleText}>
              mobx-view-model devtools
            </span>
            {headerContent}
          </div>
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
              <IconToggleButton
                onUpdate={model.devtools.handleSortPropertiesChange}
                options={[
                  {
                    value: 'none',
                    icon: BarsDescendingAlignCenter,
                  },
                  {
                    value: 'asc',
                    icon: BarsAscendingAlignLeftArrowDown,
                  },
                  {
                    value: 'desc',
                    icon: BarsDescendingAlignLeftArrowUp,
                  },
                ]}
                value={model.devtools.sortPropertiesBy}
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
        </header>
        <div className={css.vmContentVirtualized}>
          <Virtualizer
            ref={model.devtools.scrollListRef}
            itemSize={22}
            data={model.devtools.listItems}
            keepMounted={[0]}
          >
            {(listItem) => {
              if (listItem instanceof VMListItem) {
                return <VmListItemRender item={listItem} key={listItem.key} />;
              }
              if (listItem instanceof ExtraListItem) {
                return (
                  <ExtraListItemRender item={listItem} key={listItem.key} />
                );
              }
              if (listItem instanceof PropertyListItem) {
                return (
                  <PropertyListItemRender
                    item={listItem as any}
                    key={listItem.key}
                  />
                );
              }
              if (listItem instanceof MetaListItem) {
                return (
                  <MetaListItemRender item={listItem} key={listItem.key} />
                );
              }

              return <></>;
            }}
          </Virtualizer>
        </div>
      </div>
    );
  },
);
