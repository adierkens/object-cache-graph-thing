# object-cache-graph-thing [![CircleCI](https://circleci.com/gh/adierkens/object-cache-graph-thing/tree/master.svg?style=svg)](https://circleci.com/gh/adierkens/object-cache-graph-thing/tree/master) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo) [![npm version](https://badge.fury.io/js/object-cache-graph-thing.svg)](https://badge.fury.io/js/object-cache-graph-thing) [![codecov](https://codecov.io/gh/adierkens/object-cache-graph-thing/branch/master/graph/badge.svg)](https://codecov.io/gh/adierkens/object-cache-graph-thing)

> A thing for making object traversals quicker

Object traversals are slow, recursion is not fun, and waiting 10s for a page to load because you have to parse a JSON blob 17 times is terrible. This tries to fix some of that.

Instead of trying ot recursively search an object to find all children that match a pattern, let's only search it once, construct a graph of all instances of the thing we care about, and manipulate that graph.

Example:

```javascript
import ObjectCache from 'object-cache-graph-thing';

const objectThatICareAbout = {
    a: [
        { foo: true },
        { foo: false, c: { foo: true } }
    ]
    b: { foo: true }
}

// Find all objects that have a property `foo`
// The predicate function returns what to store for a given path in the object
// If a falsy value is returned, then that path is ignored and not cached.
const predicate = (testObj) => _.isObject(testObj) && _.has(testObj, 'foo') && foo

const cache = new ObjectCache(objectThatICareAbout, predicate);


// Get all the paths where `foo` is a prop
cache.getPaths(); // [ ['a', 0], ['a', 1], ['a', 1, 'c'], ['b'] ]

// Get a sub-graph relative to child
// same as new `ObjectCache(objectThatICareAbout.a, predicate)`, without the overhead of parsing again
cache.getCacheForPath(['a']);

```

## API

```javascript
import ObjectCache from 'object-cache-graph-thing';
```

### **ObjectCache** instances

#### Methods

ObjectCache._prototype.**constructor(seedObject : Object, predicate : Function)**_
> Constructs a new ObjectCache instance

ObjectCache._prototype.**getCacheForValue(val : Any)**_
> Create a new ObjectCache instance for the given value

ObjectCache._prototype.**getCacheForPath(path: Array)**_
> Create a new ObjectCache instance for the given subtree

ObjectCache._prototype.**getPaths()**_
> Get all the current paths in the tree

ObjectCache._prototype.**getValues()**_
> Get all the current values in the tree
