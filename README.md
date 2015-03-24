# cqrsjs

[![Circle CI](https://circleci.com/gh/tmorin/cqrsjs.svg?style=svg)](https://circleci.com/gh/tmorin/cqrsjs)
[![Dependency Status](https://david-dm.org/tmorin/cqrsjs.png)](https://david-dm.org/tmorin/cqrsjs)
[![devDependency Status](https://david-dm.org/tmorin/cqrsjs/dev-status.png)](https://david-dm.org/tmorin/cqrsjs#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/tmorin/cqrsjs/badge.svg)](https://coveralls.io/r/tmorin/cqrsjs)

CQRS pattern application for JavaScript.

## Requirements

cqrsjs is designed to work into browsers and node too.

cqrsjs used the es6 Promise.
So use a polyfill if the targeted runtime doesn't provide a native implementation.

cqrsjs is built around the es5 features.

So it should work for node, evergreen browsers, IE9 and IE10.

If not ... it's a bug.

## cq what?

cqrs means _Command and Query Responsibility Segregation_.
It's coming from far away, so [Wikipedia](http://en.wikipedia.org/wiki/Command%E2%80%93query_separation) will be a better place to know more about it.

## Install

```shell
npm install --save cqrs.js
```

```shell
bower install --save cqrs.js
```

```javascript
require(['cqrsjs', ...
```

## Example

- [shoplist](example/shoplist)

## Documentation

- [play with cqrsjs](doc/play-with-cqrsjs.md)
- [play with commands](doc/play-with-commands.md)
- [play with events](doc/play-with-events.md)
- [play with queries](doc/play-with-queries.md)
- [play with aggregates](doc/play-with-aggregates.md)
