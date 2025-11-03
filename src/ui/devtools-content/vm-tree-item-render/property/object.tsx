import { cx } from 'yummies/css';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { CSSProperties } from 'react';
import css from '@/styles.module.css';
import type { VmTreeItemRenderVM } from '../model';
import { Property, type PropertyDetailedProps } from '.';
import { getAllKeys } from '@/model/utils/get-all-keys';
import { ExpandButton } from '@/ui/expand-button';
  
export const ObjectProperty = observer((props: PropertyDetailedProps) => {
  const { name: property, value } = props;
  const model = useViewModel<VmTreeItemRenderVM>();
  const isExpanded = model.isPathExpanded(props.path);

  const keys = getAllKeys(value);
  const isExpandable = keys.length > 0; 

  return (
    <>
      <div
        className={cx(css.line, css.property, css.object)}
        style={{ '--level': props.level, '--order': props.order } as CSSProperties}
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
