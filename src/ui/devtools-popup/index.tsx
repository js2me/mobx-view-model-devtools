import { Xmark } from '@gravity-ui/icons';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { DevtoolsClientVM } from '../devtools-client/model';
import { VmDevtoolsContent } from '../devtools-content';
import css from './styles.module.css';

export const VmDevtoolsPopup = observer(() => {
  const model = useViewModel<DevtoolsClientVM>();

  return (
    <VmDevtoolsContent
      className={css.vmPopup}
      data-position={model.devtools.position}
      headerContent={
        <button
          className={css.closePopupButton}
          onClick={model.devtools.hidePopup}
        >
          <Xmark />
        </button>
      }
    />
  );
});
