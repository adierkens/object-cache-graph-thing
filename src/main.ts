import deepEqual from 'fast-deep-equal';

export type KeyGenerator<T> = (thing: any) => undefined | T;
export type PathKey = string | number;
export type Path = PathKey[];
export type Cache<T> = {
  [path: string]: T;
};

export function isSubset(small: string, large: string) {
  return large.startsWith(small);
}

function constructCache<T>(
  seedObj: object,
  predicate: KeyGenerator<T>
): Cache<T> {
  const cache: Cache<T> = {};

  function recurse(obj: any, path: Path) {
    const k = predicate(obj);

    if (k) {
      cache[path.join('.')] = k;
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
  public cache: Cache<T>;

  constructor(seedObj?: Cache<T> | object, predicate?: KeyGenerator<T>) {
    if (typeof seedObj === 'object' && typeof predicate === 'function') {
      this.cache = constructCache(seedObj, predicate);
    } else if (typeof seedObj === 'object') {
      this.cache = seedObj as Cache<T>;
    } else {
      this.cache = {};
    }

    this.getCacheForValue = this.getCacheForValue.bind(this);
    this.getCacheForPath = this.getCacheForPath.bind(this);
    this.getPaths = this.getPaths.bind(this);
    this.getValues = this.getValues.bind(this);
  }

  /**
   * Returns a subset of the cache graph filtered to only include the values equal to the query
   */
  public getCacheForValue(query: T) {
    const map: Cache<T> = {};
    Object.keys(this.cache).forEach(path => {
      const value = this.cache[path];
      if (deepEqual(query, value)) {
        map[path] = value;
      }
    });

    return new ObjectCache<T>(map);
  }

  /**
   * Returns a subset of the cache graph localized for the given path
   */
  public getCacheForPath(currentPath: Path): ObjectCache<T> {
    if (currentPath.length === 0) {
      return this;
    }

    const subset = (p: string) => isSubset(currentPath.join('.'), p);
    const relativePath = (p: string) => p.slice(currentPath.length + 1);
    const map: Cache<T> = {};

    Object.keys(this.cache).forEach(path => {
      const value = this.cache[path];
      if (subset(path)) {
        map[relativePath(path)] = value;
      }
    });

    return new ObjectCache<T>(map);
  }

  public getPaths() {
    return Object.keys(this.cache).map(p =>
      p.split('.').map(k => (isNaN(k as any) ? k : Number(k)))
    );
  }

  public getValues() {
    return Object.values(this.cache);
  }
}
