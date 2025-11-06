import { withViewModel } from 'mobx-view-model';
import type { CSSProperties } from 'react';
import { cx } from 'yummies/css';
import css from '@/styles.module.css';
import { ExpandButton } from '@/ui/expand-button';
import { VmTreeItemRenderVM } from '../../../model';
import { Property } from './property';

export const VmTreeItemRender = withViewModel(
  VmTreeItemRenderVM,
  ({ model }) => {
    const vmItem = model.payload.vmItem;
    const isExpanded = model.devtools.isExpanded(vmItem);

    const fittedInfo = model.devtools.getVMFittedInfo(vmItem);

    return (
      <>
        <div
          className={cx(css.line, css.vmTreeItem)}
          data-fitted={fittedInfo.isFittedByName || fittedInfo.isFittedById}
          style={{ '--level': vmItem.depth } as CSSProperties}
        >
          <header onClick={() => model.handleVmItemHeaderClick(vmItem)}>
            <ExpandButton
              showIconAnyway
              expandable={vmItem.children.length > 0}
              expanded={isExpanded}
              disabled={model.devtools.isAllVmsExpandedByDefault}
            />
            <label title={vmItem.displayName}>{vmItem.displayName}</label>
            <span title={vmItem.vm.id}>{vmItem.vm.id}</span>
          </header>
        </div>
        {vmItem.properties.map((property, order) => (
          <Property
            model={model}
            name={property}
            order={order}
            value={(vmItem.vm as any)[property]}
            key={property}
            isFitted={model.devtools.checkIsPropertyFitted(vmItem, property)}
            level={vmItem.depth}
            path={property}
          />
        ))}
        {isExpanded &&
          vmItem.children.map((child) => (
            <VmTreeItemRender
              key={child.key}
              payload={{ vmItem: child, devtools: model.devtools }}
            />
          ))}
      </>
    );
  },
);
