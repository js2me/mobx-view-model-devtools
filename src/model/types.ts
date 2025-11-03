import type { AnyViewModel, AnyViewModelSimple } from 'mobx-view-model';

export type AnyVM = AnyViewModelSimple | AnyViewModel;

export type VmTreeItem = {
  parent: Maybe<VmTreeItem>;
  vm: AnyVM;
  displayName: string;
  children: VmTreeItem[];
  depth: number;
  key: string;
  properties: string[];
};

export interface VMFittedInfo {
  isFitted: boolean;
  isFittedById?: boolean;
  isFittedByName?: boolean;
  isFittedByPropertyPath?: boolean;
  fittedProperties: string[];
}
