import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import { cx } from 'yummies/css';
import type { DevtoolsClientVM } from '@/model';
import css from '@/styles.module.css';

export const VmDevtoolsButton = observer(() => {
  const model = useViewModel<DevtoolsClientVM>();

  return (
    <button
      className={cx(
        css.vmButton,
        {
          [css.opened]: model.devtools.isPopupOpened,
          [css.isConnected]: model.devtools.isActive,
        },
        model.devtools.config.buttonClassName,
      )}
      data-position={`${model.devtools.config.position}`}
      ref={model.devtools.buttonRef}
      onClick={model.handleToggleOpen}
    >
      <img src={model.devtools.logoUrl} />
      <div />
      <span>{model.devtools.allVms.length}</span>
    </button>
  );
});
