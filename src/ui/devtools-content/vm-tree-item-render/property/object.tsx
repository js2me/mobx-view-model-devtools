import { observer } from 'mobx-react-lite';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { getAllKeys } from '@/model/utils/get-all-keys';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/expand-button';
import { Property, type PropertyDetailedProps } from '.';

export const ObjectProperty = observer((props: PropertyDetailedProps) => {
  const { name: property, value, model } = props;
  const isExpanded = model.isPathExpanded(props.path);

  const keys = getAllKeys(value);
  const isExpandable = keys.length > 0;

  return (
    <>
      <div
        className={cx(css.line, css.property, css.object)}
        style={
          { '--level': props.level, '--order': props.order } as CSSProperties
        }
        onClick={() => model.handleExpandPropertyClick(props.path)}
        data-fitted={props.isFitted}
      >
        <ExpandButton expandable={isExpandable} expanded={isExpanded} />
        <span className={css.propertyName}>{property}</span>
        <span className={css.propertyMeta}>:&nbsp;</span>
        <span className={css.propertyValue}>
          {isExpandable ? '{...}' : `{}`}
        </span>
      </div>
      {isExpanded &&
        keys.map((key, order) => (
          <Property
            {...props}
            name={key}
            order={order}
            value={value[key]}
            key={key}
            path={`${props.path}.${key}`}
            level={props.level + 1}
          />
        ))}
    </>
  );
});
