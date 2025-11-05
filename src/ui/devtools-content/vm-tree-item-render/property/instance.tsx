import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import { getAllKeys } from '@/model/utils/get-all-keys';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/expand-button';
import type { VmTreeItemRenderVM } from '../../../../model/vm-tree-item-render.vm';
import { Property, type PropertyDetailedProps } from '.';

export const InstanceProperty = observer((props: PropertyDetailedProps) => {
  const { name, value } = props;
  const model = useViewModel<VmTreeItemRenderVM>();
  const isExpanded = model.isPathExpanded(props.path);

  const Constructor = value.constructor as Function;
  const className = Constructor.name;

  const keys = getAllKeys(value);

  return (
    <>
      <div
        className={cx(css.line, css.property, css.instance)}
        style={
          { '--level': props.level, '--order': props.order } as CSSProperties
        }
        onClick={() => model.handleExpandPropertyClick(props.path)}
        data-fitted={props.isFitted}
      >
        <ExpandButton expandable expanded={isExpanded} />
        <span className={css.propertyName}>{name}</span>
        <span className={css.propertyMeta}>:&nbsp;</span>
        <span className={css.propertyValue}>{`${className}`}</span>
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
