import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { expect } from 'vitest';
import { PropertyListItem } from '@/model/list-item/property-list-item';
import { VMListItem } from '@/model/list-item/vm-list-item';
import type { AnyVM } from '@/model/types';
import type { ViewModelDevtools } from '@/model/view-model-devtools';
import { PropertyListItemRender } from '@/ui/devtools-content/list-items/property-list-item-render';

// Only the panel shell is replaced: rows, editors, MobX propagation and the
// application's observer component all run their production implementations.
export function inspect<T extends object>(
  model: T,
  path: string[],
  read: () => unknown,
  options: { additionalPaths?: string[][]; viewModels?: object[] } = {},
) {
  const notifications: { title: string }[] = [];
  const devtools = {
    anyCache: observable.map(),
    watchedPropertyKeys: [],
    allVms: options.viewModels ?? [model],
    sortPropertiesBy: 'none',
    highlightUpdates: false,
    notifications: {
      push: (notification: { title: string }) =>
        notifications.push(notification),
    },
    searchEngine: {
      isPropertyItemExpanded: () => false,
      isPropertyItemExpandable: (item: PropertyListItem) =>
        item.children.length > 0,
      isItemFitted: () => true,
    },
  } as unknown as ViewModelDevtools;
  const root = new VMListItem(devtools, model as AnyVM, []);
  function findItem(path: string[]) {
    let parent: VMListItem | PropertyListItem = root;
    for (const key of path) {
      const child = parent.children.find(
        (child) => child instanceof PropertyListItem && child.property === key,
      );
      expect(
        child,
        `Property ${key} must be discoverable in the devtools tree`,
      ).toBeInstanceOf(PropertyListItem);
      parent = child as PropertyListItem;
    }
    return parent as PropertyListItem;
  }
  const item = findItem(path);
  const App = observer(() => (
    <output data-testid="app">{JSON.stringify(read())}</output>
  ));
  render(
    <>
      <App />
      <section data-testid="row">
        <PropertyListItemRender item={item} />
      </section>
      {options.additionalPaths?.map((path) => (
        <section key={JSON.stringify(path)} data-testid={JSON.stringify(path)}>
          <PropertyListItemRender item={findItem(path)} />
        </section>
      ))}
    </>,
  );
  const row = within(screen.getByTestId('row'));
  const user = userEvent.setup();
  return {
    user,
    row,
    notifications,
    rowFor: (path: string[]) =>
      within(screen.getByTestId(JSON.stringify(path))),
    async edit(
      content: string,
      submit: 'Enter' | 'Apply' = 'Enter',
      target = row,
    ) {
      await user.click(target.getByTitle('Edit'));
      const input = target.getByRole('textbox');
      await user.clear(input);
      await user.paste(content);
      if (submit === 'Enter') await user.keyboard('{Enter}');
      else await user.click(target.getByTitle('Apply'));
    },
    expectApp(value: unknown) {
      expect(screen.getByTestId('app').textContent).toBe(JSON.stringify(value));
    },
  };
}
