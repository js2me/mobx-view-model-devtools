import { action, computed, makeObservable, observable } from 'mobx';
import type { AnyObject } from 'yummies/types';
import type { VMListItem } from './list-item/vm-list-item';
import {
  createFocusableRef,
  type FocusableRef,
} from './utils/create-focusable-ref';

export interface SearchResult {
  isFitted: boolean;
  isFittedById?: boolean;
  isFittedByName?: boolean;
  isFittedByPropertyPath?: boolean;
  fittedProperties: string[];
  isFittedAllProperties?: boolean;
  fullFittedProperty?: string;
  fittedPath: string[];
}

export type SearchInput =
  | { type: 'vm'; item: VMListItem }
  | { type: 'extras'; item: AnyObject };

export class SearchEngine {
  searchInputRef: FocusableRef<HTMLInputElement>;

  public fittedVmIds = new Set<string>();

  private rawSearchText!: string;
  public formattedSearchText!: string;

  private searchTextUpdateTimeout: number | undefined;

  segments: string[] = [];

  private get cache() {
    this.fittedVmIds.clear();
    this.formattedSearchText;
    return new Map<string, SearchResult>();
  }

  get isActive() {
    return !!this.formattedSearchText;
  }

  private defaultSearchResult: SearchResult = {
    isFitted: true,
    isFittedByName: true,
    fittedProperties: [],
    fittedPath: [],
  };

  getSearchResult(input: SearchInput): SearchResult {
    if (!this.isActive) {
      return this.defaultSearchResult;
    }

    if (input.type === 'extras') {
      return this.defaultSearchResult;
    }

    const { item } = input;

    if (this.cache.has(item.key)) {
      return this.cache.get(item.key)!;
    }

    if (!this.segments.length) {
      return this.defaultSearchResult;
    }

    const isFittedByProperty = false;
    let fittedProperties: string[] = [];

    const firstSegment = this.segments[0];
    const secondSegment = this.segments[1];

    let propSegmentsToCheck: string[] = [];

    let isFittedById: boolean;
    let isFittedByName: boolean;
    let isFittedAllProperties: boolean | undefined;

    if (secondSegment) {
      isFittedById = item.searchData.id === firstSegment;
      isFittedByName = item.searchData.name === firstSegment;

      if (isFittedById || isFittedByName) {
        propSegmentsToCheck = [secondSegment];
      } else {
        propSegmentsToCheck = [firstSegment];
      }
    } else {
      isFittedById = item.searchData.id.startsWith(firstSegment);
      isFittedByName = item.searchData.name.startsWith(firstSegment);

      if (!isFittedById && !isFittedByName) {
        propSegmentsToCheck = [firstSegment];
      }
    }

    if (item.data.id && isFittedById) {
      this.fittedVmIds.add(item.data.id);
    }

    const isFittedByPropertyPath = false;
    let fullFittedProperty: string | undefined;

    if (propSegmentsToCheck.length) {
      item.propertyListItems.forEach((origProperty) => {
        const property = origProperty.toLowerCase();

        for (const segment of propSegmentsToCheck) {
          const isFullFitted = property === segment;

          if (isFullFitted) {
            fullFittedProperty = property;
            fittedProperties.push(origProperty);
            return;
          }

          const isFittedProperty = !!segment && property.startsWith(segment);

          if (isFittedProperty) {
            fittedProperties.push(origProperty);
          }
        }
      });
    } else {
      fittedProperties = item.properties;
      isFittedAllProperties = true;
    }

    const isFitted =
      isFittedByName ||
      isFittedById ||
      isFittedByProperty ||
      isFittedByPropertyPath;

    this.cache.set(item.key, {
      isFitted,
      isFittedById,
      isFittedByName,
      isFittedByPropertyPath,
      fullFittedProperty,
      isFittedAllProperties,
      fittedPath: this.segments,
    });

    return this.cache.get(item.key)!;
  }

  getSearchPropertyResult(input: SearchInput, property: string): boolean {
    if (!this.isActive) {
      return true;
    }

    const searchResult = this.getSearchResult(input);

    if (
      input.type === 'vm' &&
      searchResult.isFittedAllProperties &&
      input.item.vm.id &&
      !this.fittedVmIds.has(input.item.vm.id)
    ) {
      return false;
    }

    return searchResult.fittedProperties.includes(property);
  }

  private setSearchText(searchText: string) {
    this.rawSearchText = searchText;
    this.formattedSearchText = searchText.toLowerCase().trim();

    this.segments.length = 0;

    if (!this.formattedSearchText) {
      return;
    }

    const segments: string[] = this.segments;

    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    let strictSearchByProperties = false;

    let startWithNextSegment = true;

    for (let i = 0; i < searchText.length; ) {
      const char = searchText[i];

      if (i === 0 && char === '.') {
        strictSearchByProperties = true;
        i++;
        continue;
      }

      if (char === ' ') {
        i++;
        continue;
      }

      if (char === '.') {
        startWithNextSegment = true;
        i++;
        continue;
      }

      // scenarios
      // foo.bar[0]
      // foo.bar[1000]
      // foo.bar['baz']
      // foo.bar["baz"]
      // if (char === '[') {
      //   let bunch = '';
      //   let charsToCheck = 1;
      //   while (searchText[i + charsToCheck] !== undefined) {
      //     const nextChar = searchText[i + charsToCheck];
      //     bunch += nextChar;
      //     charsToCheck++;
      //   }
      //   segments.push(searchText[i + 1]);
      //   startWithNextSegment = true;
      //   i += 2;
      //   continue;
      // }

      if (startWithNextSegment) {
        segments.push('');
        startWithNextSegment = false;
      }

      const lastIndex = segments.length - 1;
      segments[lastIndex] += char.toLowerCase();

      i++;
    }
  }

  resetSearch = () => {
    clearTimeout(this.searchTextUpdateTimeout!);
    this.setSearchText('');
    if (this.searchInputRef.current) {
      this.searchInputRef.current.value = '';
    }
  };

  constructor() {
    this.setSearchText('');

    this.searchInputRef = createFocusableRef<HTMLInputElement>({
      onSet: (input) => {
        if (this.rawSearchText && input.value !== this.rawSearchText) {
          input.value = this.rawSearchText;
        }

        input.addEventListener('input', () => {
          clearTimeout(this.searchTextUpdateTimeout!);
          this.searchTextUpdateTimeout = setTimeout(() => {
            this.setSearchText(input.value);
          }, 100);
        });
      },
    });

    makeObservable<
      typeof this,
      'cache' | 'rawSearchText' | 'formattedSearchText' | 'setSearchText'
    >(this, {
      rawSearchText: observable.ref,
      formattedSearchText: observable.ref,
      isActive: computed,
      cache: computed,
      setSearchText: action.bound,
    });
  }
}
