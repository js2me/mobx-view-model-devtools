import {
  ActiveViewModelProvider,
  ViewModelsProvider,
  withViewModel,
} from 'mobx-view-model';
import { DevtoolsClientVM } from '@/model/devtools-client.vm';
import { VmDevtoolsButton } from './devtools-button';
import { VmDevtoolsPopup } from './devtools-popup';

export const DevtoolsClient = withViewModel(DevtoolsClientVM, ({ model }) => {
  return (
    <ViewModelsProvider value={model.devtools.vmStore}>
      <ActiveViewModelProvider value={model}>
        <VmDevtoolsButton />
        {model.devtools.isOpened && model.devtools.displayType === 'popup' && (
          <VmDevtoolsPopup />
        )}
      </ActiveViewModelProvider>
    </ViewModelsProvider>
  );
});
