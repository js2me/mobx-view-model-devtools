import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import type { PropertyListItemRenderProps } from '.';
import css from './styles.module.css';

export const FunctionProperty = observer(
  ({ item }: PropertyListItemRenderProps) => {
    const argLabels = Array.from(
      { length: item.data.length },
      (_, i) => `arg${i + 1}`,
    );

    return (
      <div
        className={cx(css.property, css.function)}
        title={String(item.data)}
        style={
          { '--level': item.depth, '--order': item.order } as CSSProperties
        }
        data-fitted={item.isFitted}
        onClick={(e) => item.devtools.handlePropertyClick(item, e)}
        data-depth={item.depthLine}
      >
        <span className={css.propertyName}>{item.property}</span>
        {`(${argLabels.join(', ')})`}
        {item.extraContent}
      </div>
    );
  },
);
