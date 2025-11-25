import { Xmark } from '@gravity-ui/icons';
import { withViewModel } from 'mobx-view-model';
import { VmDevtoolsContent } from '../devtools-content';
import { VmDevtoolsPopupVM } from './model';
import css from './styles.module.css';

export const VmDevtoolsPopup = withViewModel(VmDevtoolsPopupVM, ({ model }) => {
  return (
    <VmDevtoolsContent
      className={css.vmPopup}
      data-position={model.devtools.position}
      payload={{
        devtools: model.devtools,
        ref: model.contentRef,
      }}
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
