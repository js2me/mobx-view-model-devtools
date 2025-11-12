import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { getAllKeys } from '@/model/utils/get-all-keys';
import { Property, type PropertyDetailedProps } from '.';
import css from './styles.module.css';

export const InstanceProperty = observer((props: PropertyDetailedProps) => {
  const { name, value, model, extraRight } = props;
  const isExpanded = model.isPathExpanded(props.path);

  const Constructor = value.constructor as Function;
  const className = Constructor.name;

  const keys = getAllKeys(value);

  return (
    <>
      <div
        className={cx(css.property, css.instance, css.expandable, {
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
            :&nbsp;
          </>
        )}
        <span className={css.propertyValue}>{`${className}`}</span>
        {isExpanded && <>&nbsp;{`{`}</>}
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
              extraRight={`,`}
            />
          ))}
          <div
            className={cx(css.property, css.instance)}
            style={
              {
                '--level': props.level,
                '--order': keys.length,
              } as CSSProperties
            }
          >
            {`}`}
            {extraRight}
          </div>
        </>
      )}
    </>
  );
});
