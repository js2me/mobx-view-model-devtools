import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import type { PropertyListItemRenderProps } from '.';
import css from './styles.module.css';

export const ObjectProperty = observer(
  ({ item }: PropertyListItemRenderProps) => {
    return (
      <div
        className={cx(css.property, css.object, {
          [css.expandable]: item.isExpandable,
          [css.expanded]: item.isExpanded,
        })}
        style={
          { '--level': item.depth, '--order': item.order } as CSSProperties
        }
        onClick={(e) => item.devtools.handlePropertyClick(item, e)}
        data-fitted={item.isFitted}
        data-depth={item.depthLine}
      >
        {item.property === undefined ? null : (
          <>
            <span className={css.propertyName}>{item.property}</span>
            :&nbsp;
          </>
        )}
        <span className={css.propertyValue}>
          {item.isExpanded ? '{' : item.isExpandable ? '{...}' : `{}`}
        </span>
        {item.extraContent}
      </div>
    );
  },
);
