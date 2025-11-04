import { DevtoolsVM } from "@/model";
import { createRoot } from "react-dom/client";
import { DevtoolsClientView } from "./devtools-client-view";

export const renderDevtools = (container: HTMLElement, model: DevtoolsVM) => {
  const root = createRoot(container);

  root.render(
    <DevtoolsClientView model={model} />  
  );
}