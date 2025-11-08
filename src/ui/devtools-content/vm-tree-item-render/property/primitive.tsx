import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import css from '@/styles.module.css';
import type { PropertyDetailedProps } from '.';

export const PrimitiveProperty = observer((props: PropertyDetailedProps) => {
  const { name, value, extraRight } = props;
  const primitiveType = typeof value;

  return (
    <div
      className={cx(css.line, css.property, css.primitive, css[primitiveType])}
      style={
        { '--level': props.level, '--order': props.order } as CSSProperties
      }
      data-fitted={props.isFitted}
      title={String(value)}
      data-depth={String().padEnd(props.level, '-')}
    >
      {name === undefined ? null : (
        <>
          <span className={css.propertyName}>{name}</span>
          <span className={css.propertyMeta}>:&nbsp;</span>
        </>
      )}
      <span className={css.propertyValue}>
        {primitiveType === 'symbol'
          ? `Symbol(${Symbol.keyFor(value) || ''})`
          : primitiveType === 'string'
            ? `"${value}"`
            : `${value}`}
      </span>
      {extraRight}
    </div>
  );
});
