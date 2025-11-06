import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import css from '@/styles.module.css';
import type { PropertyDetailedProps } from '.';

export const FunctionProperty = observer((props: PropertyDetailedProps) => {
  const { name: property, value } = props;

  const argLabels = Array.from(
    { length: value.length },
    (_, i) => `arg${i + 1}`,
  );

  return (
    <div
      className={cx(css.line, css.property, css.function)}
      title={String(value)}
      style={
        { '--level': props.level, '--order': props.order } as CSSProperties
      }
      data-fitted={props.isFitted}
    >
      <span className={css.propertyName}>{property}</span>
      <span className={css.propertyMeta}>{`(${argLabels.join(', ')})`}</span>
    </div>
  );
});
