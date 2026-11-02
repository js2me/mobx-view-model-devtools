import { action, computed, makeObservable, observable } from 'mobx';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import type { Maybe } from 'yummies/types';
import type { CollectionKind } from '../utils/collection-like';
import {
  isMobxObservableMap,
  isMobxObservableSet,
} from '../utils/collection-like';
import { formatSearchSegmentKey } from '../utils/format-search-key';
import {
  notifyMapEntryOwner,
  notifyPropertyOwner,
} from '../utils/mobx-edit-adapter';
import { resolveComputedProducerForEdit } from '../utils/resolve-computed-producer';
import { isInaccessible } from '../utils/safe-access';
import {
  setMapEntryValue,
  setSetEntryValue,
} from '../utils/set-collection-entry-value';
import { setPropertyValue } from '../utils/set-property-value';
import type { ViewModelDevtools } from '../view-model-devtools';
import { PropertyListItem } from './property-list-item';

export interface PropertyEditorHost {
  readonly property: Maybe<string>;
  readonly type: string;
  readonly dataType: string;
  readonly data: any;
  readonly isInaccessible: boolean;
  readonly nestedValueType: string;
  readonly collectionEntryKind?: CollectionKind;
  readonly collectionEntryIndex?: number;
  readonly getPreview?: () => unknown;
  readonly mapEntryKey: unknown;
  readonly stringifiedData: string;
  readonly parentListItem: any;
  readonly devtools: ViewModelDevtools;
  reportDataChanged(): void;
}

function formatEditError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export class PropertyEditor {
  editContent = '';
  isEditMode = false;

  constructor(private readonly host: PropertyEditorHost) {
    makeObservable(this, {
      editContent: observable.ref,
      isEditMode: observable,
      isEditable: computed,
      editableContent: computed,
      handleChangeEditContent: action,
      handleEditKeyDown: action,
      startEdit: action,
      cancelEdit: action,
      applyEdit: action,
      toggleBoolean: action,
      confirmEdit: action,
      callFunction: action,
    });
  }

  get isEditable() {
    const h = this.host;
    if (h.isInaccessible || isInaccessible(h.parentListItem.data)) {
      return false;
    }

    if (h.getPreview) {
      return false;
    }

    if (h.collectionEntryKind === 'map' || h.collectionEntryKind === 'set') {
      return (
        h.property !== undefined &&
        h.nestedValueType !== 'instance' &&
        h.nestedValueType !== 'function'
      );
    }

    return (
      h.property !== undefined &&
      h.collectionEntryKind == null &&
      h.type !== 'instance' &&
      !h.isInaccessible &&
      !isInaccessible(h.parentListItem.data)
    );
  }

  get editableContent() {
    const h = this.host;
    if (h.isInaccessible) {
      return '';
    }

    if (h.collectionEntryKind != null) {
      return this.formatEditableNestedValue();
    }

    switch (h.type) {
      case 'object':
      case 'array': {
        try {
          return JSON.stringify(h.data, null, 2);
        } catch {
          return h.stringifiedData;
        }
      }
      default: {
        switch (h.dataType) {
          case 'bigint':
            return `${String(h.data)}n`;
          case 'symbol':
            return `Symbol(${Symbol.keyFor(h.data as symbol) || ''})`;
          case 'string':
            return JSON.stringify(h.data);
        }

        return String(h.data);
      }
    }
  }

  handleChangeEditContent: ChangeEventHandler<HTMLInputElement> = (e) => {
    this.editContent = e.target.value;
  };

  handleEditKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.confirmEdit();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.cancelEdit();
    }
  };

  confirmEdit() {
    if (this.host.dataType === 'function') {
      this.callFunction();
      return;
    }

    this.applyEdit();
  }

  callFunction() {
    // biome-ignore lint/security/noGlobalEval: no way...
    const args = eval(`[${this.editContent.trim()}]`);
    this.host.data.apply(this.host.parentListItem.data, args);
    this.cancelEdit();
  }

  startEdit() {
    this.editContent = this.editableContent;
    this.isEditMode = true;
  }

  cancelEdit() {
    this.editContent = '';
    this.isEditMode = false;
  }

  applyEdit() {
    if (!this.isEditable || this.host.property === undefined) {
      return;
    }

    let parsed: unknown;

    try {
      parsed = this.parseEditContent();
    } catch (error) {
      this.host.devtools.notifications.push({
        title: `Failed to parse value for "${this.getEditTargetLabel()}": ${formatEditError(error)}`,
      });
      return;
    }

    if (!this.commitParsedEdit(parsed)) {
      return;
    }

    this.cancelEdit();
  }

  toggleBoolean() {
    if (
      !this.isEditable ||
      this.host.dataType !== 'boolean' ||
      this.host.property === undefined
    ) {
      return;
    }

    const nextValue = !this.host.data;
    this.commitParsedEdit(nextValue);
  }

  private commitParsedEdit(parsed: unknown): boolean {
    let result: ReturnType<PropertyEditor['applyParsedEdit']>;
    try {
      result = this.applyParsedEdit(parsed);
    } catch (error) {
      result = { ok: false, error: formatEditError(error) };
    }

    if (!result.ok) {
      this.host.devtools.notifications.push({
        title: `Failed to update "${this.getEditTargetLabel()}": ${result.error}`,
      });
      return false;
    }

    if (!result.notifies) this.notifyNearestObservableOwner();
    this.reportDataChangedUpwards();
    return true;
  }

  private getEditTargetLabel() {
    const h = this.host;
    if (h.collectionEntryKind === 'map' && h.mapEntryKey != null) {
      return formatSearchSegmentKey(h.mapEntryKey);
    }

    return String(h.property);
  }

  private applyParsedEdit(parsed: unknown): {
    ok: boolean;
    error?: string;
    notifies?: boolean;
  } {
    const h = this.host;

    const producerTarget = resolveComputedProducerForEdit(
      h as PropertyListItem,
      parsed,
    );

    if (producerTarget) {
      const result = setPropertyValue(
        producerTarget.host,
        producerTarget.key,
        producerTarget.value,
      );

      if (!result.ok) return result;
      for (const { entry, value } of producerTarget.identityUpdates)
        entry.rebind(value);
      return result;
    }

    if (h.collectionEntryKind === 'map') {
      const key = h.mapEntryKey;

      return {
        ...setMapEntryValue(h.parentListItem.data, key, parsed),
        notifies: isMobxObservableMap(h.parentListItem.data),
      };
    }

    if (h.collectionEntryKind === 'set') {
      const oldValue =
        h instanceof PropertyListItem && h.setEntryIdentity
          ? h.setEntryIdentity.value
          : h.data;
      const result = setSetEntryValue(h.parentListItem.data, oldValue, parsed);
      if (result.ok && h instanceof PropertyListItem)
        h.setEntryIdentity?.rebind(result.value);
      return {
        ...result,
        notifies: isMobxObservableSet(h.parentListItem.data),
      };
    }

    if (h.property == null) {
      return { ok: false, error: 'Property key is missing' };
    }

    const result = setPropertyValue(h.parentListItem.data, h.property, parsed);

    return result;
  }

  private parseEditContent(): unknown {
    const h = this.host;
    const content = this.editContent.trim();

    if (
      h.type === 'object' ||
      h.type === 'array' ||
      (h.collectionEntryKind != null &&
        (h.nestedValueType === 'object' || h.nestedValueType === 'array'))
    ) {
      return JSON.parse(content);
    }

    // biome-ignore lint/security/noGlobalEval: devtools edit field, same as function call args
    return eval(`(${content})`);
  }

  private formatEditableNestedValue() {
    const h = this.host;
    switch (h.nestedValueType) {
      case 'object':
      case 'array': {
        try {
          return JSON.stringify(h.data, null, 2);
        } catch {
          return h.stringifiedData;
        }
      }
      default: {
        switch (h.dataType) {
          case 'bigint':
            return `${String(h.data)}n`;
          case 'symbol':
            return `Symbol(${Symbol.keyFor(h.data as symbol) || ''})`;
          case 'string':
            return JSON.stringify(h.data);
        }

        return String(h.data);
      }
    }
  }

  private notifyNearestObservableOwner() {
    let current = this.host;
    while (current instanceof PropertyListItem) {
      if (
        current.collectionEntryKind === 'map' &&
        notifyMapEntryOwner(current.parentListItem.data, current.mapEntryKey)
      )
        return;
      if (
        notifyPropertyOwner(
          current.parentListItem.data,
          current.property ?? undefined,
        )
      )
        return;
      const parent = current.parentListItem;
      if (!(parent instanceof PropertyListItem)) return;
      current = parent;
    }
  }

  private reportDataChangedUpwards() {
    let current: any = this.host;

    while (current) {
      current.reportDataChanged();
      current =
        current instanceof PropertyListItem
          ? current.parentListItem
          : undefined;
    }
  }
}
