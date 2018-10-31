import ObjectCache, { isSubset, Path } from '../main';

test('isSubset', () => {
  expect(isSubset([1, 2, 3].join('.'), [1, 2, 3].join('.'))).toBeTruthy();
  expect(isSubset([1, 2, 3].join('.'), [1, 2, 3, 4].join('.'))).toBeTruthy();
  expect(isSubset([1, 2, 3].join('.'), [1, 2].join('.'))).toBeFalsy();
  expect(
    isSubset(
      ['fields', 'asset'].join('.'),
      ['fields', 'asset', 'values', 0].join('.')
    )
  ).toBeTruthy();
  expect(
    isSubset(
      ['fields', 'asset'].join('.'),
      ['field', 'asset', 'values', 0].join('.')
    )
  ).toBeFalsy();
});

describe('objCache', () => {
  const testObj = {
    a: [{ foo: true }, { foo: true, bar: { foo: false } }],
    b: {
      c: {
        foo: true
      }
    }
  };

  const objCache = new ObjectCache<object>(
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
      { foo: true },
      { foo: true, bar: { foo: false } },
      { foo: false },
      { foo: true }
    ]);
  });

  it('Constructs an ObjectCache from a relative path', () => {
    const relativeToA = objCache.getCacheForPath(['a']);
    expect(relativeToA.getPaths()).toEqual([[0], [1], [1, 'bar']]);
    expect(relativeToA.getValues()).toEqual([
      { foo: true },
      { foo: true, bar: { foo: false } },
      { foo: false }
    ]);
  });

  it('Constructs an ObjectCache from an empty path', () => {
    const identity = objCache.getCacheForPath([]);
    expect(identity.getPaths()).toEqual(initialPaths);
  });

  it('Constructs an ObjectCache from a value', () => {
    const fooCache = objCache.getCacheForValue({ foo: true });
    expect(fooCache.getPaths()).toEqual([['a', 0], ['b', 'c']]);
  });
});
