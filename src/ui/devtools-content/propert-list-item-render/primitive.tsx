import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import type { PropertyListItemRenderProps } from '.';
import css from './styles.module.css';

export const PrimitiveProperty = observer(
  ({ item }: PropertyListItemRenderProps) => {
    return (
      <div
        className={cx(css.property, css.primitive, css[item.dataType], {
          [css.null]: item.data === null,
        })}
        style={
          { '--level': item.depth, '--order': item.order } as CSSProperties
        }
        data-fitted={item.isFitted}
        title={String(item.data)}
        onClick={(e) => item.devtools.handlePropertyClick(item, e)}
        data-depth={item.depthLine}
      >
        {item.property === undefined ? null : (
          <>
            <span className={css.propertyName}>{item.property}</span>
            :&nbsp;
          </>
        )}
        <span className={css.propertyValue}>
          {item.dataType === 'symbol'
            ? `Symbol(${Symbol.keyFor(item.data) || ''})`
            : item.dataType === 'string'
              ? `"${item.data}"`
              : `${item.data}`}
        </span>
        {item.extraContent}
      </div>
    );
  },
);
