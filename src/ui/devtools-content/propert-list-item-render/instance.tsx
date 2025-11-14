import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import type { PropertyListItemRenderProps } from '.';
import css from './styles.module.css';

export const InstanceProperty = observer(
  ({ item }: PropertyListItemRenderProps) => {
    const Constructor = item.data.constructor as Function;
    const className = Constructor.name;

    return (
      <div
        className={cx(css.property, css.instance, css.expandable, {
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
        <span className={css.propertyValue}>{`${className}`}</span>
        {item.isExpanded && <>&nbsp;{`{`}</>}
        {item.extraContent}
      </div>
    );
  },
);
