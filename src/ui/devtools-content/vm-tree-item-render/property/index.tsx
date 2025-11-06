import { observer } from 'mobx-react-lite';
import { typeGuard } from 'yummies/type-guard';
import { ArrayProperty } from './array';
import { FunctionProperty } from './function';
import { InstanceProperty } from './instance';
import { ObjectProperty } from './object';
import { PrimitiveProperty } from './primitive';

export interface PropertyProps {
  model: { isPathExpanded: (path: string) => boolean; handleExpandPropertyClick: (path: string) => void };
  name: string;
  value: any;
  level: number;
  isFitted: boolean;
  path: string;
  order?: number;
}

export interface PropertyDetailedProps extends PropertyProps {
  valueType: string;
}

export const Property = observer((rootProps: PropertyProps) => {
  const { value } = rootProps;

  const valueType = Object.prototype.toString.call(value);

  const props: PropertyDetailedProps = {
    ...rootProps,
    value,
    valueType,
  };

  if (Array.isArray(value)) {
    return <ArrayProperty {...props} />;
  }

  if (
    typeGuard.isObject(value) &&
    value.constructor?.name &&
    value.constructor.name !== 'Object'
  ) {
    return <InstanceProperty {...props} />;
  } else if (typeGuard.isFunction(value)) {
    return <FunctionProperty {...props} />;
  } else if (typeGuard.isObject(value)) {
    return <ObjectProperty {...props} />;
  } else if (
    valueType.startsWith('[object ') &&
    value &&
    typeof value === 'object' &&
    'constructor' in value
  ) {
    return <InstanceProperty {...props} />;
  } else {
    return <PrimitiveProperty {...props} />;
  }
});
