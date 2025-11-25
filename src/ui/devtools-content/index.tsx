import {
  BarsAscendingAlignLeftArrowDown,
  BarsDescendingAlignCenter,
  BarsDescendingAlignLeftArrowUp,
  FolderTree,
  ListUl,
  Magnifier,
  Xmark,
} from '@gravity-ui/icons';
import { type ViewModelProps, withViewModel } from 'mobx-view-model';
import type { ReactNode } from 'react';
import { Virtualizer } from 'virtua';
import { cx } from 'yummies/css';
import { ExtraListItem } from '@/model/list-item/extra-list-item';
import { MetaListItem } from '@/model/list-item/meta-list-item';
import { PropertyListItem } from '@/model/list-item/property-list-item';
import { VMListItem } from '@/model/list-item/vm-list-item';
import { IconToggleButton } from '../shared/icon-toggle-button';
import { ExtraListItemRender } from './list-items/extra-list-item-render';
import { MetaListItemRender } from './list-items/meta-list-item-render';
import { PropertyListItemRender } from './list-items/property-list-item-render';
import { VmListItemRender } from './list-items/vm-list-item-render';
import { DevtoolsContentVM } from './model';
import css from './styles.module.css';

export const VmDevtoolsContent = withViewModel(
  DevtoolsContentVM,
  ({
    model,
    className,
    headerContent,
    ...props
  }: {
    className?: string;
    headerContent?: ReactNode;
  } & ViewModelProps<DevtoolsContentVM>) => {
    const { devtools } = model.payload;

    return (
      <div
        {...props}
        className={cx(css.vmContent, className)}
        ref={model.contentRef}
      >
        <header className={css.vmContentHeader}>
          <div className={css.gradientBlur} />
          <div className={css.vmContentHeaderTitle} data-content-header>
            <img className={css.vmContentHeaderLogo} src={devtools.logoUrl} />
            <span className={css.vmContentHeaderTitleText}>
              mobx-view-model devtools
            </span>
            {headerContent}
          </div>
          <div className={css.vmContentControlPanel}>
            <div className={css.vmContentControlPanelActions}>
              <IconToggleButton
                onUpdate={devtools.handleChangePresentationMode}
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
                value={devtools.presentationMode}
              />
              <IconToggleButton
                onUpdate={devtools.handleSortPropertiesChange}
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
                value={devtools.sortPropertiesBy}
              />
            </div>
            <div
              className={`${css.vmContentInput} ${devtools.searchEngine.isActive && css.filled}`}
            >
              <Magnifier />
              <input
                ref={devtools.searchEngine.searchInputRef}
                autoFocus
                placeholder="search by property path or ViewModel name"
              />
              <button onClick={devtools.searchEngine.resetSearch}>
                <Xmark />
              </button>
            </div>
          </div>
        </header>
        <div className={css.vmContentVirtualized}>
          <Virtualizer
            ref={devtools.scrollListRef}
            itemSize={22}
            data={devtools.listItems}
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
