import _ from 'lodash';

export function isSubset(small, large) {
  if (!_.isArray(small) || !_.isArray(large)) {
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

function constructCache(seedObj, predicate) {
  const cache = new Map();

  function recurse(obj, path = []) {
    const k = predicate(obj);

    if (k) {
      cache.set(path, k);
    }

    if (_.isObject(obj)) {
      _.each(obj, (value, key) => {
        recurse(value, [...path, key]);
      });
    }
  }

  recurse(seedObj);

  return cache;
}

export default class ObjectCache {

  constructor(seedObj, predicate) {
    if (seedObj instanceof Map) {
      this.cache = seedObj;
    } else {
      this.cache = constructCache(seedObj, predicate);
    }
    this.getCacheForValue = this.getCacheForValue.bind(this);
    this.getCacheForPath = this.getCacheForPath.bind(this);
  }

  /**
   * Returns a subset of the cache graph filtered to only include the values equal to the query
   * @param query
   * @returns ObjectCache
   */
  getCacheForValue(query) {
    const map = new Map();
    this.cache.forEach((value, path) => {
      if (_.isEqual(query, value)) {
        map.set(path, value);
      }
    });

    return new ObjectCache(map);
  }

  /**
   * Returns a subset of the cache graph localized for the given path
   * @param currentPath
   * @returns ObjectCache
   */
  getCacheForPath(currentPath) {
    if (currentPath.length === 0) {
      return this;
    }

    const subset = _.partial(isSubset, currentPath);
    const relativePath = _.partial(_.drop, _, currentPath.length);
    const map = new Map();

    this.cache.forEach((value, path) => {
      if (subset(path)) {
        map.set(relativePath(path), value);
      }
    });

    return new ObjectCache(map);
  }

  getPaths() {
    return _.toArray(this.cache.keys());
  }

  getValues() {
    return _.toArray(this.cache.values());
  }
}
