import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { DevtoolsClientVM } from '@/model';
import css from '@/styles.module.css';
import { VmDevtoolsContent } from '../devtools-content';
import { XMark } from '../icons/x-mark';

export const VmDevtoolsPopup = observer(() => {
  const model = useViewModel<DevtoolsClientVM>();

  return (
    <VmDevtoolsContent
      className={css.vmPopup}
      data-position={`${model.devtools.config.position}`}
      headerContent={
        <button onClick={model.handleClosePopupClick}>
          <XMark />
        </button>
      }
    />
  );
});
