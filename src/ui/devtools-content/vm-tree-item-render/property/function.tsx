import { cx } from 'yummies/css';
import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/expand-button';
import type { PropertyDetailedProps } from '.';

export const FunctionProperty = observer((props: PropertyDetailedProps) => {
  const { name: property, value, valueType } = props;

  const argLabels = Array.from(
    { length: value.length },
    (_, i) => `arg${i + 1}`,
  );

  return (
    <div
      className={cx(css.line, css.property, css.function)}
      title={String(value)}
      style={{ '--level': props.level, '--order': props.order } as CSSProperties}
      data-fitted={props.isFitted}
    >
      <ExpandButton />
      {valueType.includes('Async') && (
        <span className={cx(css.propertyMeta, css.small)}>async&nbsp;</span>
      )}
      <span className={css.propertyName}>{property}</span>
      <span className={css.propertyMeta}>{`(${argLabels.join(', ')})`}</span>
    </div>
  );
});
