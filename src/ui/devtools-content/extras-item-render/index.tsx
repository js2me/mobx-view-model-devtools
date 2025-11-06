import { withViewModel } from 'mobx-view-model';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { ExtrasItemRenderVM } from '@/model';
import { getAllKeys } from '@/model/utils/get-all-keys';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/expand-button';
import { Property } from '../vm-tree-item-render/property';

export const ExtrasItemRender = withViewModel(
  ExtrasItemRenderVM,
  ({ model }) => {
    const extras = model.payload.extras;

    const keys = getAllKeys(extras);

    const depth = 0;

    return (
      <>
        <div
          className={cx(css.line, css.vmTreeItem, css.extrasItem)}
          data-fitted={'true'}
          style={{ '--level': depth } as CSSProperties}
        >
          <header>
            <ExpandButton
              showIconAnyway
              expanded
              disabled={model.devtools.isAllVmsExpandedByDefault}
            />
            <label>Extras</label>
          </header>
        </div>
        {keys.map((property, order) => (
          <Property
            model={model}
            name={property}
            order={order}
            value={extras[property]}
            key={property}
            isFitted={model.devtools.checkIsExtrasPropertyFitted(property)}
            level={depth}
            path={property}
          />
        ))}
      </>
    );
  },
);
