import { observer } from 'mobx-react-lite';
import type { PropertyListItem } from '@/model/list-item/property-list-item';
import { ArrayProperty } from './array';
import { FunctionProperty } from './function';
import { InstanceProperty } from './instance';
import { ObjectProperty } from './object';
import { PrimitiveProperty } from './primitive';

export interface PropertyListItemRenderProps {
  item: PropertyListItem;
  isFitted?: boolean;
}

export const PropertyListItemRender = observer(
  (props: PropertyListItemRenderProps) => {
    switch (props.item.type) {
      case 'array':
        return <ArrayProperty {...props} />;
      case 'function':
        return <FunctionProperty {...props} />;
      case 'instance':
        return <InstanceProperty {...props} />;
      case 'object':
        return <ObjectProperty {...props} />;
      case 'primitive':
        return <PrimitiveProperty {...props} />;
    }
  },
);
