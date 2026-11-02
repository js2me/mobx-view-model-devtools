import { isObservableArray, untracked } from 'mobx';
import { PropertyListItem } from '../list-item/property-list-item';
import {
  getCollectionKind,
  isMobxObservableMap,
  isMobxObservableSet,
} from './collection-like';
import {
  findMobxAdministration,
  isMobxComputedProperty,
} from './mobx-administration';
import type { MapLike, SetLike } from './mobx-collection';

export type ComputedProducerTarget = {
  host: object;
  key: string;
  value: unknown;
};

type EditSegment =
  | { kind: 'property'; key: string }
  | { kind: 'map'; key: unknown }
  | { kind: 'set'; index: number };

function editSegment(item: PropertyListItem): EditSegment {
  if (item.collectionEntryKind === 'map') {
    return { kind: 'map', key: item.mapEntryKey };
  }
  if (item.collectionEntryKind === 'set') {
    return { kind: 'set', index: item.collectionEntryIndex! };
  }
  return { kind: 'property', key: item.property! };
}

function applyNestedEdit(
  value: unknown,
  segments: EditSegment[],
  parsed: unknown,
): unknown {
  if (segments.length === 0) {
    return parsed;
  }

  const [segment, ...rest] = segments;
  if (segment.kind === 'map') {
    if (getCollectionKind(value) !== 'map')
      throw new Error('Map entry was not found');
    const next = new Map((value as MapLike).entries());
    if (!next.has(segment.key)) throw new Error('Map entry was not found');
    next.set(segment.key, applyNestedEdit(next.get(segment.key), rest, parsed));
    return next;
  }
  if (segment.kind === 'set') {
    if (getCollectionKind(value) !== 'set')
      throw new Error('Set entry was not found');
    const values = [...(value as SetLike).values()];
    if (segment.index < 0 || segment.index >= values.length)
      throw new Error('Set entry was not found');
    values[segment.index] = applyNestedEdit(
      values[segment.index],
      rest,
      parsed,
    );
    return new Set(values);
  }
  const head = segment.key;

  if (Array.isArray(value)) {
    // slice preserves sparse entries; copying enumerable properties keeps
    // custom keys (including an empty key) when editing another array member.
    const next = Object.assign(value.slice(), value);
    const nextValue = applyNestedEdit(Reflect.get(value, head), rest, parsed);
    if (!Reflect.set(next, head, nextValue)) {
      throw new Error(`Cannot update array property "${head}"`);
    }
    return next;
  }

  if (value !== null && typeof value === 'object') {
    return {
      ...(value as Record<string, unknown>),
      [head]: applyNestedEdit(
        (value as Record<string, unknown>)[head],
        rest,
        parsed,
      ),
    };
  }

  if (rest.length === 0) {
    return parsed;
  }

  return value;
}

/**
 * Pin the nearest computed snapshot on the edited path. Observable owners
 * are stable edit targets of their own; copying them into an outer snapshot
 * would detach shared state and discard class prototypes and computed getters.
 */
export function resolveComputedProducerForEdit(
  item: PropertyListItem,
  parsed: unknown,
): ComputedProducerTarget | null {
  if (item.property == null) {
    return null;
  }

  const segments = [editSegment(item)];
  let current = item.parentListItem;

  while (current instanceof PropertyListItem && current.property != null) {
    if (
      findMobxAdministration(current.data) ||
      isObservableArray(current.data) ||
      isMobxObservableMap(current.data) ||
      isMobxObservableSet(current.data)
    ) {
      return null;
    }

    const host = current.parentListItem.data;
    const key = current.property;
    if (isMobxComputedProperty(host, key)) {
      const rootValue = untracked(() => Reflect.get(host, key));
      return { host, key, value: applyNestedEdit(rootValue, segments, parsed) };
    }

    // An observable field (including observable.ref) owns the value below it.
    // Editing that value must not pin a computed higher up the inspector tree.
    if (findMobxAdministration(host)) {
      return null;
    }

    segments.unshift(editSegment(current));
    current = current.parentListItem;
  }

  return null;
}

export function findMobxComputedPropertyHost(
  object: object,
  key: string,
): { host: object; key: string } | null {
  const adm = findMobxAdministration(object);

  if (adm && isMobxComputedProperty(object, key)) {
    return { host: object, key };
  }

  return null;
}
