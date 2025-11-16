import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import type { ExtraListItem } from '@/model/list-item/extra-list-item';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/devtools-content/expand-button';

export const ExtraTreeItemRender = observer(
  ({ item }: { item: ExtraListItem }) => {
    return (
      <div
        className={cx(css.treeItem, css.extraTreeItem)}
        data-fitted={item.isFitted}
        data-depth={item.depthLine}
        style={{ '--level': item.depth } as CSSProperties}
      >
        <header
          className={css.treeItemHeader}
        >
          <ExpandButton
            showIconAnyway={item.devtools.presentationMode === 'tree'}
            expandable={item.isExpandable}
            expanded={item.isExpanded}
          />
          <label className={css.treeItemLabel} title={item.displayName}>
            {item.displayName}
          </label>
        </header>
      </div>
    );
  },
);
