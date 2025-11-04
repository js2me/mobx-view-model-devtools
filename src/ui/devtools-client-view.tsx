import { observer } from "mobx-react-lite";
import { ViewModelsProvider, ActiveViewModelProvider } from "mobx-view-model";
import { VmDevtoolsButton } from "./devtools-button";
import { VmDevtoolsPopup } from "./devtools-popup";
import { DevtoolsVM } from "@/model";


export const DevtoolsClientView = observer(({ model }: { model: DevtoolsVM}) => { 
  return (
    <ViewModelsProvider value={model.vmStore}>
      <ActiveViewModelProvider value={model}>
        <VmDevtoolsButton />
        {model.isOpened && model.displayType === 'popup' && <VmDevtoolsPopup />}   
      </ActiveViewModelProvider>
    </ViewModelsProvider>  
  )
})