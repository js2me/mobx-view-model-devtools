import { DevtoolsVM } from "@/model";
import { withViewModel } from "mobx-view-model";

export const ViewModelDevTools = withViewModel(DevtoolsVM, ({ model }) => {
  return null; 
});
