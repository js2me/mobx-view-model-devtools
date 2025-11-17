import { observer } from 'mobx-react-lite';
import type { PropertyListItemRenderProps } from '.';
import css from './styles.module.css';

export const InstancePropertyContent = observer(
  ({ item }: PropertyListItemRenderProps) => {
    const Constructor = item.data.constructor as Function;
    const className = Constructor.name;

    return (
      <>
        {item.property === undefined ? null : (
          <>
            <span className={css.propertyName}>{item.property}</span>
            :&nbsp;
          </>
        )}
        <span className={css.propertyValue}>{`${className}`}</span>
        {item.isExpanded && <>&nbsp;{`{`}</>}
      </>
    );
  },
);
