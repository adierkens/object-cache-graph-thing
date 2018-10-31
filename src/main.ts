import deepEqual from 'fast-deep-equal';

export type KeyGenerator<T> = (thing: any) => undefined | T;
export type PathKey = string | number;
export type Path = PathKey[];

export function isSubset(small: Path, large: Path) {
  if (!Array.isArray(small) || !Array.isArray(large)) {
    return false;
  }

  if (small.length > large.length) {
    return false;
  }

  for (let index = 0; index < small.length; index++) {
    if (small[index] !== large[index]) {
      return false;
    }
  }

  return true;
}

function constructCache<T>(
  seedObj: object,
  predicate: KeyGenerator<T>
): Map<Path, T> {
  const cache = new Map<Path, T>();

  function recurse(obj: any, path: Path) {
    const k = predicate(obj);

    if (k) {
      cache.set(path, k);
    }

    if (Array.isArray(obj)) {
      obj.forEach((value, index) => {
        recurse(value, [...path, index]);
      });
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        recurse(value, [...path, key]);
      });
    }
  }

  recurse(seedObj, []);

  return cache;
}

export default class ObjectCache<T> {
  cache: Map<Path, T>;

  constructor(seedObj?: Map<Path, T> | object, predicate?: KeyGenerator<T>) {
    if (seedObj instanceof Map) {
      this.cache = seedObj;
    } else if (typeof seedObj === 'object' && typeof predicate === 'function') {
      this.cache = constructCache(seedObj, predicate);
    } else {
      this.cache = new Map<Path, T>();
    }

    this.getCacheForValue = this.getCacheForValue.bind(this);
    this.getCacheForPath = this.getCacheForPath.bind(this);
    this.getPaths = this.getPaths.bind(this);
    this.getValues = this.getValues.bind(this);
  }

  /**
   * Returns a subset of the cache graph filtered to only include the values equal to the query
   * @param query
   * @returns ObjectCache
   */
  getCacheForValue(query: T) {
    const map = new Map<Path, T>();
    this.cache.forEach((value, path) => {
      if (deepEqual(query, value)) {
        map.set(path, value);
      }
    });

    return new ObjectCache<T>(map);
  }

  /**
   * Returns a subset of the cache graph localized for the given path
   * @param currentPath
   * @returns ObjectCache
   */
  getCacheForPath(currentPath: Path): ObjectCache<T> {
    if (currentPath.length === 0) {
      return this;
    }

    const subset = (p: Path) => isSubset(currentPath, p);
    const relativePath = (p: Path) => p.slice(currentPath.length);
    const map = new Map<Path, T>();

    this.cache.forEach((value, path) => {
      if (subset(path)) {
        map.set(relativePath(path), value);
      }
    });

    return new ObjectCache<T>(map);
  }

  getPaths() {
    return [...this.cache.keys()];
  }

  getValues() {
    return [...this.cache.values()];
  }
}
