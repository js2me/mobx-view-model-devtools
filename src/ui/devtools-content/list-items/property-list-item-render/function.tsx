import { observer } from 'mobx-react-lite';
import type { PropertyListItemRenderProps } from '.';
import css from './styles.module.css';

export const FunctionPropertyContent = observer(
  ({ item }: PropertyListItemRenderProps) => {
    const argLabels = Array.from(
      { length: item.data.length },
      (_, i) => `arg${i + 1}`,
    );

    return (
      <>
        <span className={css.propertyName}>{item.property}</span>
        {`(${argLabels.join(', ')})`}
      </>
    );
  },
);
