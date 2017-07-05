import test from 'ava';
import _ from 'lodash';
import ObjectCache, {isSubset} from '../main';

test('isSubset', t => {
  t.true(isSubset([1, 2, 3], [1, 2, 3]));
  t.true(isSubset([1, 2, 3], [1, 2, 3, 4]));
  t.false(isSubset([1, 2, 3], [1, 2]));
  t.true(isSubset(['fields', 'asset'], ['fields', 'asset', 'values', 0]));
  t.false(isSubset(['fields', 'asset'], ['field', 'asset', 'values', 0]));
  t.false(isSubset('foo', ['foo', 'bar']));
});

const testObj = {
  a: [{foo: true}, {foo: true, bar: {foo: false}}],
  b: {
    c: {
      foo: true
    }
  }
};

const objCache = new ObjectCache(testObj, o => _.isObject(o) && _.has(o, 'foo') && o);
const initialPaths = [['a', 0], ['a', 1], ['a', 1, 'bar'], ['b', 'c']];

test('Constructor does normal things with bad values', t => {
  t.notThrows(() => {
    let x = new ObjectCache();
    x = new ObjectCache([]);
    x = new ObjectCache(false);
    t.true(x instanceof ObjectCache);
  });
});

test('Constructs an ObjectCache with the right initial paths', t => {
  t.deepEqual(objCache.getPaths(), initialPaths);
});

test('Constructs an ObjectCache with the right initial values', t => {
  t.deepEqual(objCache.getValues(), [{foo: true}, {foo: true, bar: {foo: false}}, {foo: false}, {foo: true}]);
});

test('Constructs an ObjectCache from a relative path', t => {
  const relativeToA = objCache.getCacheForPath(['a']);
  t.deepEqual(relativeToA.getPaths(), [[0], [1], [1, 'bar']]);
  t.deepEqual(relativeToA.getValues(), [{foo: true}, {foo: true, bar: {foo: false}}, {foo: false}]);
});

test('Constructs an ObjectCache from an empty path', t => {
  const identity = objCache.getCacheForPath([]);
  t.deepEqual(identity.getPaths(), initialPaths);
});

test('Constructs an ObjectCache from a value', t => {
  const fooCache = objCache.getCacheForValue({foo: true});
  t.deepEqual(fooCache.getPaths(), [['a', 0], ['b', 'c']]);
});
