import { withViewModel } from 'mobx-view-model';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { ExtrasItemRenderVM } from '@/model';
import { getAllKeys } from '@/model/utils/get-all-keys';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/expand-button';
import { Property } from '../property';

export const ExtrasItemRender = withViewModel(
  ExtrasItemRenderVM,
  ({ model }) => {
    const extras = model.payload.extras;

    const keys = getAllKeys(extras);

    const depth = 0;

    return (
      <>
        <div
          className={cx(css.treeItem, css.vmTreeItem, css.extrasItem)}
          data-fitted={'true'}
          data-depth={String().padEnd(depth, '-')}
          style={{ '--level': depth } as CSSProperties}
        >
          <header className={css.treeItemHeader}>
            <ExpandButton showIconAnyway expanded />
            <label className={css.treeItemLabel}>Extras</label>
          </header>
        </div>
        {keys.map((property, order) => (
          <Property
            model={model}
            name={property}
            order={order}
            value={extras[property]}
            key={property}
            isFitted={model.devtools.searchEngine.getSearchPropertyResult(
              { type: 'extras', item: extras },
              property,
            )}
            level={depth + 1}
            path={property}
          />
        ))}
      </>
    );
  },
);
