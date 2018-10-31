import ObjectCache, {isSubset, Path} from '../main';

test('isSubset', () => {
  expect(isSubset([1, 2, 3], [1, 2, 3])).toBeTruthy();
  expect(isSubset([1, 2, 3], [1, 2, 3, 4])).toBeTruthy();
  expect(isSubset([1, 2, 3], [1, 2])).toBeFalsy();
  expect(
    isSubset(['fields', 'asset'], ['fields', 'asset', 'values', 0])
  ).toBeTruthy();
  expect(
    isSubset(['fields', 'asset'], ['field', 'asset', 'values', 0])
  ).toBeFalsy();
  expect(isSubset(('foo' as any) as Path, ['foo', 'bar'])).toBeFalsy();
});

describe('objCache', () => {
  const testObj = {
    a: [{foo: true}, {foo: true, bar: {foo: false}}],
    b: {
      c: {
        foo: true
      }
    }
  };

  const objCache = new ObjectCache(
    testObj,
    o => typeof o === 'object' && o.foo !== undefined && o
  );
  const initialPaths = [['a', 0], ['a', 1], ['a', 1, 'bar'], ['b', 'c']];

  it('Constructor does normal things with bad values', () => {
    expect(() => {
      let x = new ObjectCache();
      x = new ObjectCache([]);
      x = new ObjectCache(false as any);
      expect(x).toBeInstanceOf(ObjectCache);
    }).not.toThrow();
  });

  it('Constructs an ObjectCache with the right initial paths', () => {
    expect(objCache.getPaths()).toEqual(initialPaths);
  });

  it('Constructs an ObjectCache with the right initial values', () => {
    expect(objCache.getValues()).toEqual([
      {foo: true},
      {foo: true, bar: {foo: false}},
      {foo: false},
      {foo: true}
    ]);
  });

  it('Constructs an ObjectCache from a relative path', () => {
    const relativeToA = objCache.getCacheForPath(['a']);
    expect(relativeToA.getPaths()).toEqual([[0], [1], [1, 'bar']]);
    expect(relativeToA.getValues()).toEqual([
      {foo: true},
      {foo: true, bar: {foo: false}},
      {foo: false}
    ]);
  });

  it('Constructs an ObjectCache from an empty path', () => {
    const identity = objCache.getCacheForPath([]);
    expect(identity.getPaths()).toEqual(initialPaths);
  });

  it('Constructs an ObjectCache from a value', () => {
    const fooCache = objCache.getCacheForValue({foo: true});
    expect(fooCache.getPaths()).toEqual([['a', 0], ['b', 'c']]);
  });
});
