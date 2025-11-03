import {
  type AnyViewModel,
  type AnyViewModelSimple,
  ViewModelBase,
} from 'mobx-view-model';

export class DevtoolsVMImpl<
  Payload extends AnyObject = EmptyObject,
  ParentViewModel extends AnyViewModel | AnyViewModelSimple | null = null,
  ComponentProps extends AnyObject = AnyObject,
> extends ViewModelBase<Payload, ParentViewModel, ComponentProps> {}
