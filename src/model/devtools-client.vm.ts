import { ViewModelBase } from 'mobx-view-model';
import type { ViewModelDevtools } from './view-model-devtools';

export class DevtoolsClientVM extends ViewModelBase<{
  devtools: ViewModelDevtools;
}> {
  devtools = this.payload.devtools;
}
