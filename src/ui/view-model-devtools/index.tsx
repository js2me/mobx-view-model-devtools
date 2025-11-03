import { DevtoolsVM } from "@/model";
import { ViewModelsProvider, withViewModel } from "mobx-view-model";
import { VmDevtoolsButton } from "../devtools-button";
import { VmDevtoolsPopup } from "../devtools-popup";

export const ViewModelDevTools = withViewModel(DevtoolsVM, ({ model }) => {
  return (
    <ViewModelsProvider value={model.vmStore}>
      <VmDevtoolsButton />
      {model.isOpened && model.displayType === 'popup' && <VmDevtoolsPopup />}  
    </ViewModelsProvider>
  );
});
