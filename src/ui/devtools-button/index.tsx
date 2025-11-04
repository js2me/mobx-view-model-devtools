import { cx } from 'yummies/css';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import css from '@/styles.module.css';
import { DevtoolsVM } from '@/model';

export const VmDevtoolsButton = observer(() => {
  const model = useViewModel(DevtoolsVM); 

  console.log('ddd', model); 

  return (
    <button
      className={cx(
        css.vmButton,
        {
          [css.opened]: model.isOpened,
        },
        model.payload.buttonClassName,
      )}
      data-position={`${model.payload.position}`}
      ref={model.buttonRef}
      onClick={model.handleToggleOpen}
    >
      <img src={model.logoUrl} />
      <div />
      <span>{model.allVms.length}</span>
    </button>
  );
});
