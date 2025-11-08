import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { getAllKeys } from '@/model/utils/get-all-keys';
import css from '@/styles.module.css';
import { Property, type PropertyDetailedProps } from '.';

export const ObjectProperty = observer((props: PropertyDetailedProps) => {
  const { name, value, model, extraRight } = props;
  const isExpanded = model.isPathExpanded(props.path);

  const keys = getAllKeys(value);
  const isExpandable = keys.length > 0;

  return (
    <>
      <div
        className={cx(css.line, css.property, css.object, {
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
        {name === undefined ? null : (
          <>
            <span className={css.propertyName}>{name}</span>
            <span className={css.propertyMeta}>:&nbsp;</span>
          </>
        )}
        <span className={css.propertyValue}>
          {isExpanded ? '{' : isExpandable ? '{...}' : `{}`}
        </span>
        {!isExpanded && extraRight}
      </div>
      {isExpanded && (
        <>
          {keys.map((key, order, arr) => (
            <Property
              {...props}
              name={key}
              order={order}
              value={value[key]}
              key={key}
              path={`${props.path}.${key}`}
              level={props.level + 1}
              extraRight={<span className={css.propertyMeta}>{`,`}</span>}
            />
          ))}
          <div
            className={cx(css.line, css.property)}
            style={
              {
                '--level': props.level,
                '--order': keys.length,
              } as CSSProperties
            }
          >
            <span className={css.propertyMeta}>{`}`}</span>
            {extraRight}
          </div>
        </>
      )}
    </>
  );
});
