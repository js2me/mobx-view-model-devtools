import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { Property, type PropertyDetailedProps } from '.';
import css from './styles.module.css';

export const ArrayProperty = observer((props: PropertyDetailedProps) => {
  const { name: property, value, model, extraRight } = props;
  const isExpanded = model.isPathExpanded(props.path);

  const keys = Object.keys(value);
  const isExpandable = keys.length > 0;

  return (
    <>
      <div
        className={cx(css.property, css.array, {
          [css.expandable]: isExpandable,
          [css.expanded]: isExpanded,
        })}
        style={
          { '--level': props.level, '--order': props.order } as CSSProperties
        }
        onClick={() => model.handleExpandPropertyClick(props.path)}
        data-fitted={props.isFitted}
        data-depth={String().padEnd(props.level, '-')}
      >
        {property === undefined ? null : (
          <>
            <span className={css.propertyName}>{property}</span>
            :&nbsp;
          </>
        )}
        <span className={css.propertyValue}>
          {isExpanded ? '[' : isExpandable ? '[...]' : `[]`}
        </span>
        {!isExpanded && extraRight}
      </div>
      {isExpanded && (
        <>
          {keys.map((key, order) => (
            <Property
              {...props}
              name={key}
              order={order}
              value={value[key]}
              key={key}
              path={`${props.path}.${key}`}
              level={props.level + 1}
              extraRight={','}
            />
          ))}
          <div
            className={css.property}
            style={
              {
                '--level': props.level,
                '--order': keys.length,
              } as CSSProperties
            }
          >
            {`]`}
            {extraRight}
          </div>
        </>
      )}
    </>
  );
});
